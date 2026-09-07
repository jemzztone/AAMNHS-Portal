import GoogleSignInButton from '@/Components/GoogleSignInButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

/**
 * Shared password card used by both the login flow (guests) and the
 * confirm-password flow (authenticated users re-verifying their identity).
 */
export function PasswordForm({ mode = 'login', email = '', status }) {
    const isLogin = mode === 'login';

    const { data, setData, post, processing, errors, reset } = useForm(
        isLogin
            ? { email: email ?? '', password: '' }
            : { password: '' },
    );

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(isLogin ? route('login') : route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            {isLogin ? (
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-bold text-navy-950">
                        Log in to your account
                    </h1>
                </div>
            ) : (
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-bold text-navy-950">
                        Confirm your password
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        This is a secure area of the application. Please confirm your password before continuing.
                    </p>
                </div>
            )}

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                {isLogin && (
                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>
                )}

                <div className={isLogin ? 'mt-4' : ''}>
                    <InputLabel htmlFor="password" value="Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full"
                            autoComplete={isLogin ? 'current-password' : 'current-password'}
                            isFocused={!isLogin}
                            onChange={(e) => setData('password', e.target.value)}
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

                <div className="mt-6">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        {isLogin ? 'Log in' : 'Confirm'}
                    </PrimaryButton>
                </div>
            </form>

            {isLogin && (
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
                        <GoogleSignInButton />
                    </div>
                </div>
            )}
        </>
    );
}

export default function Login({ status, canResetPassword }) {
    return (
        <GuestLayout>
            <Head title="Log in" />

            <PasswordForm mode="login" status={status} />
        </GuestLayout>
    );
}
