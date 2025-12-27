import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, refreshUser } = useAuth();

  // If user is not verified, show verification required message
  const isVerificationRequired = user && user.emailVerification === false && !searchParams.get('userId');

  const handleResendVerification = async () => {
    if (!user) return;

    try {
      // Use client-side Appwrite API to send verification email
      await account.createVerification(`${window.location.origin}/verify-email`);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast.error(error.message || 'Failed to send verification email. Please try again.');
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = searchParams.get('userId');
      const secret = searchParams.get('secret');

      if (!userId || !secret) {
        setStatus('error');
        setMessage('Invalid verification link. Missing required parameters.');
        return;
      }

      try {
        // Use client-side Appwrite API directly
        await account.updateVerification(userId, secret);

        // Immediately refresh user data to update verification status
        await refreshUser();

        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast.success('Email verified successfully!');

        // Navigate to dashboard after user state is updated
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Email verification failed.');
        toast.error(error.message || 'Verification failed');
      }
    };

    // Only run verification if we have the parameters (not just showing the UI)
    if (searchParams.get('userId') && searchParams.get('secret')) {
      verifyEmail();
    }

    // Real-time verification check (poll every 3 seconds)
    const interval = setInterval(async () => {
      try {
        const currentUser = await account.get();
        if (currentUser.emailVerification) {
          clearInterval(interval);
          // Refresh AuthContext user data
          await refreshUser();
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          toast.success('Email verified successfully!');
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        // User might have logged out or session expired
        console.log('Verification check failed - user may not be logged in');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [searchParams, navigate]);

  // Show verification required message for unverified users
  if (isVerificationRequired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Verify Your Email</h1>
          <div className="space-y-4 mb-6">
            <p className="text-muted-foreground">
              We've sent a verification link to <strong>{user.email}</strong>.
              Please check your email and click the link to activate your account.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or click below to resend.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              Resend Verification Email
            </button>

            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Verifying Email</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
