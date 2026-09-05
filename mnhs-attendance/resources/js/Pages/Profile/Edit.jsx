import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Account</p>
                    <h2 className="surface-title">Profile</h2>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="card card-pad">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="card card-pad">
                    <UpdatePasswordForm />
                </div>

                <div className="card card-pad">
                    <DeleteUserForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
