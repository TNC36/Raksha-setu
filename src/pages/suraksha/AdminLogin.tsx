import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Lock, User } from "lucide-react";
import { adminLogin, isAdminLoggedIn } from "../../utils/storage";
import { useEffect } from "react";

const MVP_USERNAME = "admin";
const MVP_PASSWORD = "Suraksha@123";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate async login
    setTimeout(() => {
      if (username === MVP_USERNAME && password === MVP_PASSWORD) {
        adminLogin();
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 300);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-neutral-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">
            Admin Login
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Suraksha Setu Administration
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
            MVP credentials only. Production deployment should use backend
            authentication with hashed passwords and JWT/session management.
          </p>
        </form>
      </div>
    </div>
  );
}
