import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchBar from "@/components/ui/search-bar";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from "@inertiajs/react";
import {
    CreditCard,
    Calendar,
    DollarSign,
    User,
    RefreshCw,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Bug
} from "lucide-react";
import { useState, useEffect } from "react";

// Custom table components
const Table = ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <table className="w-full border-collapse" {...props}>{children}</table>
);

const TableHeader = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props}>{children}</thead>
);

const TableBody = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props}>{children}</tbody>
);

const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50" {...props}>{children}</tr>
);

const TableHead = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" {...props}>{children}</th>
);

const TableCell = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-sm" {...props}>{children}</td>
);

interface Transaction {
    id: string;
    invoice_number: string;
    amount: number;
    formatted_amount: string;
    status: string;
    status_display: string;
    payment_method: string | null;
    created_at: string;
    updated_at: string;
    paid_at: string | null;
    customer: {
        name: string | null;
        email: string | null;
    };
    raw_data?: any;
}

interface TransactionPageProps {
    transactions?: Transaction[];
    single_transaction?: Transaction;
    transaction_id?: string;
    debug?: {
        params: any;
        raw_data: any;
        formatted_count: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/dashboard/transactions' },
];

export default function TransactionPage({ transactions, single_transaction, transaction_id, debug }: TransactionPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(single_transaction || null);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>(transactions || []);
    const [showDebug, setShowDebug] = useState(false);

    const pageProps = usePage().props;
    
    // Debug logging
    useEffect(() => {
        console.log('TransactionPage Props:', {
            transactions,
            single_transaction,
            transaction_id,
            debug,
            pageProps
        });
    }, [transactions, single_transaction, transaction_id, debug, pageProps]);

    // Auto-refresh for pending transactions
    useEffect(() => {
        if (single_transaction && single_transaction.status === 'PENDING') {
            const interval = setInterval(() => {
                refreshTransaction(single_transaction.id);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [single_transaction]);

    const refreshTransaction = async (transactionId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/transaction/${transactionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCurrentTransaction(data.data);
                }
            }
        } catch (error) {
            console.error('Error refreshing transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
            case 'SETTLEMENT':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'PENDING':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'FAILED':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
        switch (status) {
            case 'SUCCESS':
            case 'SETTLEMENT':
                return "default";
            case 'FAILED':
            case 'EXPIRED':
                return "destructive";
            default:
                return "secondary";
        }
    };

    const filteredTransactions = allTransactions.filter(transaction =>
        transaction.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Single transaction view
    if (single_transaction || currentTransaction) {
        const transaction = currentTransaction || single_transaction!;
        
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Transaction ${transaction.invoice_number}`} />
                
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Transaction Details</h1>
                            <p className="text-muted-foreground">
                                Invoice #{transaction.invoice_number}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refreshTransaction(transaction.id)}
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit('/dashboard/transactions')}
                            >
                                Back to All Transactions
                            </Button>
                        </div>
                    </div>

                    {/* Transaction Details Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Transaction Information
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(transaction.status)}
                                    <Badge variant={getStatusVariant(transaction.status)}>
                                        {transaction.status_display}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                                        <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                                        <p className="text-lg font-semibold">{transaction.invoice_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                        <p className="text-2xl font-bold text-green-600">{transaction.formatted_amount}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                        <p className="text-sm">{transaction.payment_method || 'Not specified'}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Email</label>
                                        <p className="text-sm">{transaction.customer?.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                                        <p className="text-sm">{transaction.customer?.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                        <p className="text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {transaction.created_at}
                                        </p>
                                    </div>
                                    {transaction.paid_at && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Paid At</label>
                                            <p className="text-sm flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {transaction.paid_at}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status-specific messages */}
                    {transaction.status === 'PENDING' && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-yellow-700">
                                    <Clock className="w-5 h-5" />
                                    <p className="font-medium">Payment is pending. This page will auto-refresh every 5 seconds.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {transaction.status === 'SUCCESS' && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-5 h-5" />
                                    <p className="font-medium">Payment completed successfully!</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        );
    }

    // All transactions view
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Transactions" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Transactions</h1>
                        <p className="text-muted-foreground">
                            View and manage all payment transactions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{allTransactions.length} Total Transactions</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDebug(!showDebug)}
                        >
                            <Bug className="w-4 h-4" />
                            Debug
                        </Button>
                    </div>
                </div>

                {/* Debug Info */}
                {showDebug && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bug className="w-5 h-5" />
                                Debug Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium">Props Received:</h4>
                                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                        {JSON.stringify({
                                            transactions: transactions ? `Array(${transactions.length})` : 'undefined',
                                            single_transaction: single_transaction ? 'Object' : 'undefined',
                                            transaction_id,
                                            debug
                                        }, null, 2)}
                                    </pre>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium">All Page Props:</h4>
                                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                        {JSON.stringify(pageProps, null, 2)}
                                    </pre>
                                </div>
                                
                                {debug && (
                                    <div>
                                        <h4 className="font-medium">Debug Data from Controller:</h4>
                                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                            {JSON.stringify(debug, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium">Current State:</h4>
                                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                        {JSON.stringify({
                                            allTransactions_length: allTransactions.length,
                                            filteredTransactions_length: filteredTransactions.length,
                                            searchTerm
                                        }, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Transactions</CardTitle>
                            <div className="w-96">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search transactions, invoices, or customers..."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Show loading state or empty state */}
                        {allTransactions.length === 0 ? (
                            <div className="text-center py-8">
                                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                                <p className="text-muted-foreground">
                                    No transaction data was loaded. Check the debug info above for more details.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{transaction.invoice_number}</div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {transaction.id.substring(0, 12)}...
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{transaction.customer?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-muted-foreground">{transaction.customer?.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transaction.formatted_amount}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{transaction.payment_method || 'Not specified'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(transaction.status)}
                                                    <Badge variant={getStatusVariant(transaction.status)}>
                                                        {transaction.status_display}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    {transaction.created_at}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(`/dashboard/transactions/${transaction.id}`)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {filteredTransactions.length === 0 && allTransactions.length > 0 && (
                            <div className="text-center py-8">
                                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                                <p className="text-muted-foreground">
                                    No transactions found matching your search: "{searchTerm}"
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}