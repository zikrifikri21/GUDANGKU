import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status, canResetPassword, canRegister }: Props) {
    return (
        <>
            <Head title="Masuk — Gudangku" />

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@perusahaan.com"
                                    className="h-10 border-border/50 bg-muted/40 text-sm focus-visible:border-[#e8b84b] focus-visible:ring-0"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                    >
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-[#e8b84b] hover:text-[#c99b36]"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-10 border-border/50 bg-muted/40 text-sm focus-visible:border-[#e8b84b] focus-visible:ring-0"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-border/50 data-[state=checked]:border-[#e8b84b] data-[state=checked]:bg-[#e8b84b] data-[state=checked]:text-[#1a1a18]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal text-muted-foreground"
                                >
                                    Ingat saya
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="mt-2 h-[42px] w-full gap-2 bg-[#1a1a18] text-sm font-semibold tracking-wide text-[#f5f2eb] hover:bg-[#2e2e2a] active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
                            >
                                {processing ? <Spinner /> : <LoginIcon />}
                                {processing ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </div>

                        {/* Register link */}
                        {canRegister && (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="h-px flex-1 bg-border/50" />
                                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                        atau
                                    </span>
                                    <span className="h-px flex-1 bg-border/50" />
                                </div>
                                <p className="text-center text-sm text-muted-foreground">
                                    Belum punya akun?{' '}
                                    <TextLink
                                        href={register()}
                                        tabIndex={6}
                                        className="font-medium text-[#e8b84b] hover:text-[#c99b36]"
                                    >
                                        Daftar sekarang
                                    </TextLink>
                                </p>
                            </>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akun',
    description: 'Masukkan email dan kata sandi untuk mengakses Gudangku',
};

function LoginIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
                d="M6 3h7v10H6M4 11l-3-3 3-3M1 8h8"
                stroke="#e8b84b"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}