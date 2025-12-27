import { useState } from "react";
import { Mail, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function EmailVerificationPrompt() {
  const { user, sendVerificationEmail } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show if user is logged in but not verified
  if (!user || user.emailVerification || isDismissed) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      const success = await sendVerificationEmail();
      if (success) {
        toast.success("Verification email sent! Check your inbox.");
      } else {
        toast.error("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 relative">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-grow">
          <h3 className="font-semibold text-foreground mb-1">
            Verify Your Email Address
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Please verify your email address to access all features and ensure account security.
          </p>

          <button
            onClick={handleSendVerification}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={14} />
                Send Verification Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
