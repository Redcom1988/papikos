import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import SettingsLayout from '@/layouts/settings-layout';

export default function Appearance() {
    return (
        <SettingsLayout>
            <Head title="Appearance Settings" />

            <div className="space-y-6 bg-background text-foreground">
                <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                <div className="bg-background">
                    <AppearanceTabs />
                </div>
            </div>
        </SettingsLayout>
    );
}
