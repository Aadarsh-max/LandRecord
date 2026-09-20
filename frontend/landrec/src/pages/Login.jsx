import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, UserCheck, Loader2 } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";
import AuthIllustration from "../components/common/AuthIllustration";
import TextInput from "../components/common/TextInput";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@bhulekh.demo",
    password: "Demo@1234",
    icon: ShieldCheck,
    desc: "Full access — verify records, view all dashboards",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    role: "Operator",
    email: "operator@bhulekh.demo",
    password: "Demo@1234",
    icon: UserCheck,
    desc: "Upload and process documents",
    gradient: "from-green-500 to-amia-600"
  }
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(account) {
    setError("");
    setDemoLoadingRole(account.role);
    try {
      await login(account.email, account.password);
      navigate("/dashboard");
    } catch {
      setError(`Could not sign in as demo ${account.role.toLowerCase()}. Please try manual login.`);
    } finally {
      setDemoLoadingRole(null);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-bg px-4 py-8">
      <FloatingBackground />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <AuthIllustration />

        <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay sm:p-10">
          <div className="mb-6">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Judges — sign in instantly
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isLoading = demoLoadingRole === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoLogin(account)}
                    disabled={isLoading || demoLoadingRole !== null}
                    className={`group relative overflow-hidden rounded-claySm bg-gradient-to-br ${account.gradient} p-4 text-left text-white shadow-clay transition-all duration-300 hover:-translate-y-0.5 hover:shadow-claySm disabled:opacity-70`}
                  >
                    <div className="flex items-center gap-2">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                      <span className="text-sm font-semibold">Continue as {account.role}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/80">{account.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-muted/15" />
            <span className="text-xs text-ink-muted">or sign in manually</span>
            <div className="h-px flex-1 bg-ink-muted/15" />
          </div>

          <h2 className="text-2xl font-semibold text-ink-primary">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-secondary">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <TextInput
              id="email"
              label="Email address"
              type="email"
              placeholder="officer@dolr.gov.in"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-secondary">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}