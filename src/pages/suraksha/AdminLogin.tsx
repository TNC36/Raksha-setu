import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Shield, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

type Step = "email" | "otp" | "role-select";

export default function AdminLogin() {
  const navigate = useNavigate();
  const currentUser = useQuery(api.admin.getCurrentUser);
  const isAdmin = useQuery(api.admin.checkAdmin);
  const bootstrapAdmin = useMutation(api.admin.bootstrapAdmin);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signOut } = useAuthActions();

  // Redirect if already admin
  useEffect(() => {
    if (isAdmin === true) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  // After sign-in, check if user is admin or needs role assignment
  useEffect(() => {
    if (currentUser && step === "otp") {
      if (currentUser.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        // Check if any admin exists — if not, this user can bootstrap
        // Use a ref to avoid setState in effect
        const timer = setTimeout(() => setStep("role-select"), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, step, navigate]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("email-otp", { flow: "otp", email });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("email-otp", { flow: "otp", email, code: otp });
      // After successful sign-in, the currentUser query will update
      // The useEffect above will handle the redirect
    } catch {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  }

  async function handleBecomeAdmin() {
    setError("");
    setLoading(true);
    try {
      // Try to bootstrap as first admin
      const result = await bootstrapAdmin({});
      if (result?.success) {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch {
      // If bootstrap fails (admin already exists), show message
      setError(
        "An administrator already exists. Contact your admin to grant you access, or use the admin credentials."
      );
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setStep("email");
    setOtp("");

    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Admin Login
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Raksha Setu Administration
          </p>
        </div>

        <div className="bg-card dark:bg-primary border border-border rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 bg-card bg-primary text-foreground"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  A one-time verification code will be sent to this email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                ) : (
                  <>Send Verification Code</>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Verification Code
                </label>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Code sent to <strong>{email}</strong>
                </p>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 bg-card bg-primary text-foreground tracking-widest text-center"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : (
                  <>Verify & Sign In</>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                  className="flex-1 py-2 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Role Selection (first admin setup) */}
          {step === "role-select" && currentUser && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Signed in as {currentUser.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No administrator account exists yet.
                </p>
              </div>

              <button
                onClick={handleBecomeAdmin}
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</>
                ) : (
                  <>Become First Administrator</>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                This will make you the administrator. Only the first user can claim this role automatically.
                After that, new admins must be promoted by an existing admin.
              </p>

              <button
                onClick={handleSignOut}
                className="w-full py-2 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Sign out and use a different account
              </button>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-4 bg-info/10 bg-info/10 border border-blue-200 border-info/30 rounded-xl p-4">
          <p className="text-[11px] text-info text-info leading-relaxed">
            <strong>How admin access works:</strong> Sign in with the email account that should have admin access.
            The first user to sign in can claim the administrator role. Subsequent admins must be promoted
            by an existing administrator.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground hover:text-foreground no-underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Raksha Setu
          </Link>
        </p>
      </div>
    </div>
  );
}
