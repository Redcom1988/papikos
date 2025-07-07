<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendServiceFeeReminder extends Command
{
    protected $signature = 'app:send-service-fee-reminder';
    protected $description = 'Send monthly service fee payment reminder to all property owners';

    // List of invalid email domains to skip
    protected array $invalidDomains = [
        'example.com',
        'example.net',
        'example.org',
        'test.com',
        'test.net',
        'test.org',
    ];

    public function handle()
    {
        $owners = User::where('role', UserRole::OWNER->value)->get();

        foreach ($owners as $owner) {
            $email = $owner->email;
            $domain = strtolower(substr(strrchr($email, "@"), 1));

            if (in_array($domain, $this->invalidDomains, true)) {
                Log::info("Skipped sending to invalid email: {$email} (User ID: {$owner->id})");
                continue;
            }

            $html = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Monthly Service Fee Payment Reminder</title>
            </head>
            <body style="font-family: Arial, sans-serif; background: #f8fafc; color: #222;">
                <div style="max-width: 480px; min-height: 520px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px;">
                    <h2 style="color: #2563eb;">Hello, ' . htmlspecialchars($owner->name, ENT_QUOTES, 'UTF-8') . '!</h2>
                    <p>
                        We hope this message finds you well. We are reaching out to remind you that your <strong>monthly service fee of <span style="color:#16a34a;">Rp. 150.000</span></strong> for advertising your property on our platform is now due.
                    </p>
                    <p>
                        To ensure that your property listing remains active and continues to reach potential renters, we kindly ask that you complete your payment at your earliest convenience. Timely payment will help you avoid any interruptions in your listing and allow you to continue enjoying all the features and benefits that papikos provides.
                    </p>
                    <p>
                        You can easily make your payment by clicking the button below:
                    </p>
                    <p>
                        <a href="https://sandbox.doku.com/p-link/p/service-fee-payment" style="display:inline-block; background:#2563eb; color:#fff; padding:12px 24px; border-radius:4px; text-decoration:none; font-weight:bold;">
                            Pay Now
                        </a>
                    </p>
                    <hr style="margin:32px 0;">
                    <p style="color:#64748b;">
                        Thank you for being a valued member of papikos.<br>
                        <strong>papikos Team</strong>
                    </p>
                    <p style="color:#94a3b8; font-size:12px;">
                        This is an automated message. Please do not reply directly to this email.
                    </p>
                </div>
            </body>
            </html>
            ';

            Mail::html($html, function ($message) use ($owner) {
                $message->to($owner->email)
                    ->subject('Monthly Service Fee Payment Reminder');
            });

            Log::info("Service fee reminder sent to: {$email} (User ID: {$owner->id})");
        }

        $this->info('Service fee reminders processed. Check logs for details.');
    }
}
