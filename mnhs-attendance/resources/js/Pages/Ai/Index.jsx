import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
    'Which students were late most often this month?',
    'Summarize attendance for this month.',
    'Which section has the highest number of absences?',
    'Who arrived earliest today?',
];

function AssistantAvatar({ role }) {
    return (
        <span
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                role === 'user'
                    ? 'bg-navy-800 text-white'
                    : 'bg-gradient-to-br from-navy-600 to-navy-800 text-white'
            }`}
        >
            {role === 'user' ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
            )}
        </span>
    );
}

export default function Index() {
    const user = usePage().props.auth.user;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const ask = async (questionOverride) => {
        const question = (questionOverride || input).trim();
        if (!question || loading) return;

        setMessages((prev) => [...prev, { role: 'user', content: question }]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(route('ai.query'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                    ),
                },
                body: JSON.stringify({ question }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.answer },
                ]);
            } else {
                const message =
                    data.errors?.question?.[0] ||
                    data.message ||
                    'The assistant could not answer right now.';
                setError(message);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Assistant</p>
                    <h2 className="surface-title">AI Assistant</h2>
                </div>
            }
        >
            <Head title="AI Assistant" />

            <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card flex flex-col overflow-hidden">
                    {/* Chat header */}
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-navy-950 px-5 py-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/20">
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white">
                                School Data Assistant
                            </h3>
                            <p className="truncate text-xs text-navy-200/70">
                                Ask anything about students, teachers, sections,
                                and attendance.
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex h-[65vh] flex-col overflow-y-auto bg-slate-50/60 px-4 py-5 sm:px-6">
                        {messages.length === 0 && !loading && (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800 text-white">
                                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                    </svg>
                                </span>
                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    How can I help you today?
                                </h3>
                                <p className="mt-1 max-w-md text-sm text-slate-500">
                                    Ask natural-language questions about school
                                    data. Answers are based on your role-based
                                    access for the current month.
                                </p>

                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => ask(suggestion)}
                                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-800"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${
                                    message.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                {message.role === 'assistant' && (
                                    <AssistantAvatar role="assistant" />
                                )}
                                <div
                                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                        message.role === 'user'
                                            ? 'rounded-br-md bg-navy-800 text-white'
                                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                                    }`}
                                >
                                    {message.content}
                                </div>
                                {message.role === 'user' && (
                                    <AssistantAvatar role="user" />
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-3">
                                <AssistantAvatar role="assistant" />
                                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                        <div className="flex items-end gap-3">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        ask();
                                    }
                                }}
                                placeholder="Ask about students, attendance, sections..."
                                className="input min-h-[44px] flex-1 resize-none py-2.5"
                            />
                            <button
                                onClick={() => ask()}
                                disabled={!input.trim() || loading}
                                className="btn-primary shrink-0"
                            >
                                {loading ? 'Thinking...' : 'Send'}
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">
                            {user?.name}, signed in as {user?.role?.replace('_', ' ')} — you
                            can only see data your role allows.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}