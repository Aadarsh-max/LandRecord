import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Building2 } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";
import TextInput from "../components/common/TextInput";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-bg px-4 py-10">
      <FloatingBackground />

      <div className="w-full max-w-lg rounded-clay bg-base-surfaceLight p-8 shadow-clay sm:p-10">
        <h2 className="text-2xl font-semibold text-ink-primary">Create your account</h2>
        <p className="mt-1 text-sm text-ink-secondary">Get access to the digitization dashboard</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <TextInput
            id="name"
            label="Full name"
            placeholder="Ananya Sharma"
            icon={<User className="h-4 w-4" />}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
          <TextInput
            id="email"
            label="Email address"
            type="email"
            placeholder="officer@dolr.gov.in"
            icon={<Mail className="h-4 w-4" />}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
          <TextInput
            id="department"
            label="Department"
            placeholder="Dept of Land Resources"
            icon={<Building2 className="h-4 w-4" />}
            value={form.department}
            onChange={(event) => updateField("department", event.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Create a password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirm password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}