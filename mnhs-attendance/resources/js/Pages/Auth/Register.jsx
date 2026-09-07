import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GoogleSignInButton from '@/Components/GoogleSignInButton';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register({ googleRegistration }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: googleRegistration?.name || '',
        email: googleRegistration?.email || '',
        password: '',
        password_confirmation: '',
        lrn: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        guardian_name: '',
        guardian_email: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout wide>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-navy-950">
                    Create your account
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                    Join the attendance monitoring system.
                </p>
            </div>

            {googleRegistration && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div className="min-w-0 text-sm text-emerald-800">
                        <p className="font-semibold">
                            Your Google email is verified
                        </p>
                        <p className="mt-0.5">
                            <span className="font-bold">{googleRegistration.email}</span>{' '}
                            is confirmed. Just fill in your student details below
                            to finish.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Full Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {googleRegistration && (
                    <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-inset ring-slate-200">
                        Email came from your Google account —{' '}
                        <span className="font-semibold">you can still change it</span>{' '}
                        if needed.
                    </div>
                )}

                <div className="mt-4">
                    <InputLabel htmlFor="lrn" value="LRN (Learner Reference Number)" />

                    <TextInput
                        id="lrn"
                        name="lrn"
                        value={data.lrn}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('lrn', e.target.value)}
                        required
                    />

                    <InputError message={errors.lrn} className="mt-2" />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />

                        <TextInput
                            id="first_name"
                            name="first_name"
                            value={data.first_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                        />

                        <InputError message={errors.first_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />

                        <TextInput
                            id="last_name"
                            name="last_name"
                            value={data.last_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                        />

                        <InputError message={errors.last_name} className="mt-2" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" />

                    <TextInput
                        id="middle_name"
                        name="middle_name"
                        value={data.middle_name}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('middle_name', e.target.value)}
                    />

                    <InputError message={errors.middle_name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="guardian_name" value="Guardian Name (Optional)" />

                    <TextInput
                        id="guardian_name"
                        name="guardian_name"
                        value={data.guardian_name}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('guardian_name', e.target.value)}
                    />

                    <InputError message={errors.guardian_name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="guardian_email" value="Guardian Email (Optional)" />

                    <TextInput
                        id="guardian_email"
                        type="email"
                        name="guardian_email"
                        value={data.guardian_email}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('guardian_email', e.target.value)}
                    />

                    <InputError message={errors.guardian_email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-6.72a10.06 10.06 0 0 1 0 14.14m0 0a10.16 10.16 0 0 1-4.39 2.18M12 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />

                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-6.72a10.06 10.06 0 0 1 0 14.14m0 0a10.16 10.16 0 0 1-4.39 2.18M12 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm font-medium text-navy-600 underline hover:text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                        <span className="bg-white px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <GoogleSignInButton label="Sign up with Google" />
                </div>
            </div>
        </GuestLayout>
    );
}
