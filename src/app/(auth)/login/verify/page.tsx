import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="space-y-6 text-center">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-loumi-100 dark:bg-loumi-900/30">
        <Mail className="w-8 h-8 text-loumi-500" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-muted-foreground">
          We&apos;ve sent you a magic link to sign in to your account.
        </p>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-2">
        <p className="font-medium">Next steps:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Check your email inbox</li>
          <li>Click the sign-in link in the email</li>
          <li>You&apos;ll be automatically signed in</li>
        </ol>
      </div>

      {/* Note */}
      <p className="text-sm text-muted-foreground">
        Didn&apos;t receive an email? Check your spam folder or{' '}
        <Link href="/login" className="text-loumi-500 hover:text-loumi-600">
          try again
        </Link>
        .
      </p>

      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}
