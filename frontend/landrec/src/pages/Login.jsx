import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";
import TextInput from "../components/common/TextInput";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-bg px-4">
      <FloatingBackground />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <div className="hidden flex-col justify-between rounded-clay bg-gradient-to-br from-blue-600 to-green-600 p-10 text-white shadow-clay md:flex">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/70">BhuLekh AI</p>
            <h1 className="mt-4 text-3xl font-semibold leading-snug">
              Intelligent land record digitization for every village, tehsil and district.
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-claySm bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-semibold">98.4%</p>
              <p className="text-xs text-white/70">OCR field accuracy</p>
            </div>
            <div className="rounded-claySm bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-semibold">12k+</p>
              <p className="text-xs text-white/70">Records digitized</p>
            </div>
          </div>
        </div>

        <div className="rounded-clay bg-base-surfaceLight p-8 shadow-clay sm:p-10">
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