import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, ArrowRight, Home } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping"></div>
        </div>
        <p className="mt-4 text-muted-foreground animate-pulse">Signing you in...</p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        setError("Google sign-in failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred with Google sign-in.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animated-gradient opacity-80 dark:opacity-60"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/40"></div>

        {/* Animated Orbs for extra depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1100px] grid lg:grid-cols-2 bg-card/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">

        {/* Left Side - Visual Welcome */}
        <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden group border-r border-white/10">
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors duration-500"></div>
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/40 to-transparent"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 transition-all font-medium mb-12 group-hover:-translate-x-1">
              <Home className="w-4 h-4" />
              Home
            </Link>

            <div className="space-y-6">
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
                <Lock className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h1 className="text-6xl font-black text-white leading-tight">
                Deepen Your <br />
                <span className="text-secondary drop-shadow-lg">Knowledge</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed font-light">
                Secure access to the community of scholars, students, and learners. Your spiritual journey continues here.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-white/60 text-sm">
            <span className="h-px w-12 bg-white/20"></span>
            <span>Trusted by thousands in the community</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-background/40 backdrop-blur-md">
          <div className="max-w-md mx-auto w-full space-y-10">
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-card/40 hover:bg-card/60 rounded-full text-foreground border border-border/40 transition-all font-medium"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-foreground tracking-tight">Welcome Back</h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Please sign in to your dashboard
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20 flex items-center gap-3 animate-in slide-in-from-top-4">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                {error}
              </div>
            )}

            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 border border-gray-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-muted-foreground bg-transparent font-medium">Or email sign in</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/70 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-14 pl-12 pr-4 bg-card/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-foreground/70">Password</label>
                    <a href="#" className="text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-wider">Forgot?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 pl-12 pr-4 bg-card/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? "Validating..." : <>Sign In <ArrowRight size={20} /></>}
                </button>
              </form>

              <div className="text-center pt-4">
                <p className="text-muted-foreground font-medium">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-black hover:underline underline-offset-4">
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
