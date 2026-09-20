import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";
import AuthIllustration from "../components/common/AuthIllustration";
import TextInput from "../components/common/TextInput";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

const DEMO_ACCOUNTS = [
  { label: "Demo Admin", email: "admin@bhulekh.demo", password: "Demo@1234" },
  { label: "Demo Operator", email: "operator@bhulekh.demo", password: "Demo@1234" }
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-bg px-4 py-8">
      <FloatingBackground />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <AuthIllustration />

        <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay sm:p-10">
          <div className="mb-6 rounded-claySm bg-amia-500/10 p-4 text-sm">
            <p className="font-medium text-amia-700">Demo Access for SIH Judges</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="rounded-lg bg-base-surfaceLight px-3 py-2 text-left text-xs text-ink-secondary shadow-claySm transition-colors hover:bg-white"
                >
                  <span className="block font-medium text-ink-primary">{account.label}</span>
                  <span className="block truncate">{account.email}</span>
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-ink-primary">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-secondary">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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