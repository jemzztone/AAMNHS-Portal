import GuestLayout from '@/Layouts/GuestLayout';
import { PasswordForm } from '@/Pages/Auth/Login';
import { Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <PasswordForm mode="confirm" />
        </GuestLayout>
    );
}
