<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\DokuTransactionService;
use Illuminate\Support\Facades\Log;

class DokuController extends Controller
{
    protected $dokuService;

    /**
     * Show all transactions page
     */
    public function index(Request $request)
    {
        // Get transactions with pagination/filters
        $params = [
            'page' => $request->get('page', 1),
            'limit' => $request->get('limit', 20),
            'status' => $request->get('status'),
            'from_date' => $request->get('from_date'),
            'to_date' => $request->get('to_date'),
        ];

        $params = array_filter($params);
        
        // Debug: Log the params being sent
        Log::info('DokuController::index - Params:', $params);
        
        $transactionsData = $this->dokuService->getTransactions($params);
        
        // Debug: Log the raw response
        Log::info('DokuController::index - Raw response:', ['data' => $transactionsData]);
        
        // Format transactions for display
        $transactions = [];
        if ($transactionsData && isset($transactionsData['data'])) {
            foreach ($transactionsData['data'] as $transaction) {
                $transactions[] = $this->formatTransactionForFrontend($transaction);
            }
        }

        // Debug: Log formatted transactions
        Log::info('DokuController::index - Formatted transactions:', ['count' => count($transactions), 'transactions' => $transactions]);

        return Inertia::render('dashboard/transaction-page', [
            'transactions' => $transactions,
            'pagination' => $transactionsData['pagination'] ?? null,
            'debug' => [
                'params' => $params,
                'raw_data' => $transactionsData,
                'formatted_count' => count($transactions),
            ]
        ]);
    }

    /**
     * Show single transaction page
     */
    public function show($transactionId)
    {
        Log::info('DokuController::show - Transaction ID:', ['id' => $transactionId]);
        
        $transaction = $this->dokuService->getTransactionStatus($transactionId);
        
        Log::info('DokuController::show - Raw transaction:', ['transaction' => $transaction]);
        
        if (!$transaction) {
            return Inertia::render('Dashboard/Transactions/NotFound', [
                'transaction_id' => $transactionId
            ]);
        }

        $formattedTransaction = $this->formatTransactionForFrontend($transaction);

        return Inertia::render('Dashboard/Transactions/Show', [
            'single_transaction' => $formattedTransaction,
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Get transaction status via API (for AJAX calls)
     */
    public function getTransactionStatus($transactionId)
    {
        $transaction = $this->dokuService->getTransactionStatus($transactionId);
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatTransactionForFrontend($transaction)
        ]);
    }

    /**
     * Check multiple transactions status (for dashboard widgets)
     */
    public function checkMultipleTransactions(Request $request)
    {
        $transactionIds = $request->get('transaction_ids', []);
        $results = [];

        foreach ($transactionIds as $transactionId) {
            $transaction = $this->dokuService->getTransactionStatus($transactionId);
            if ($transaction) {
                $results[] = $this->formatTransactionForFrontend($transaction);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * Payment success page (redirect from Doku)
     */
    public function paymentSuccess(Request $request)
    {
        $transactionId = $request->get('transaction_id');
        
        if (!$transactionId) {
            return redirect()->route('dashboard')->with('error', 'Invalid transaction');
        }

        $transaction = $this->dokuService->getTransactionStatus($transactionId);
        
        if (!$transaction) {
            return redirect()->route('dashboard')->with('error', 'Transaction not found');
        }

        $formattedTransaction = $this->formatTransactionForFrontend($transaction);

        return Inertia::render('Dashboard/Transactions/Success', [
            'transaction' => $formattedTransaction,
        ]);
    }

    /**
     * Payment failure page (redirect from Doku)
     */
    public function paymentFailure(Request $request)
    {
        $transactionId = $request->get('transaction_id');
        
        if (!$transactionId) {
            return redirect()->route('dashboard')->with('error', 'Invalid transaction');
        }

        $transaction = $this->dokuService->getTransactionStatus($transactionId);
        
        if (!$transaction) {
            return redirect()->route('dashboard')->with('error', 'Transaction not found');
        }

        $formattedTransaction = $this->formatTransactionForFrontend($transaction);

        return Inertia::render('Dashboard/Transactions/Failure', [
            'transaction' => $formattedTransaction,
        ]);
    }

    /**
     * Format transaction data for frontend consumption
     */
    private function formatTransactionForFrontend($transaction)
    {
        $formatted = [
            'id' => $transaction['id'] ?? null,
            'invoice_number' => $transaction['invoice_number'] ?? null,
            'amount' => $transaction['amount'] ?? 0,
            'formatted_amount' => 'Rp ' . number_format($transaction['amount'] ?? 0, 0, ',', '.'),
            'status' => $transaction['status'] ?? 'unknown',
            'status_display' => $this->getStatusDisplay($transaction['status'] ?? 'unknown'),
            'payment_method' => $transaction['payment_method'] ?? null,
            'created_at' => $this->formatDate($transaction['created_at'] ?? null),
            'updated_at' => $this->formatDate($transaction['updated_at'] ?? null),
            'paid_at' => $this->formatDate($transaction['paid_at'] ?? null),
            'customer' => [
                'name' => $transaction['customer']['name'] ?? null,
                'email' => $transaction['customer']['email'] ?? null,
            ],
            'raw_data' => $transaction, // Include raw data for debugging
        ];
        
        Log::info('DokuController::formatTransactionForFrontend - Formatted:', $formatted);
        
        return $formatted;
    }

    /**
     * Get human-readable status display
     */
    private function getStatusDisplay($status)
    {
        $statusMap = [
            'SUCCESS' => 'Paid',
            'SETTLEMENT' => 'Settled',
            'PENDING' => 'Pending Payment',
            'FAILED' => 'Failed',
            'EXPIRED' => 'Expired',
            'CANCELLED' => 'Cancelled',
        ];

        return $statusMap[$status] ?? ucfirst(strtolower($status));
    }

    /**
     * Format date for display
     */
    private function formatDate($date)
    {
        if (!$date) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($date)->format('M d, Y H:i');
        } catch (\Exception $e) {
            return $date;
        }
    }

    public function testApiConnection()
    {
        $result = $this->dokuService->testConnection();
        
        return response()->json($result);
    }
}