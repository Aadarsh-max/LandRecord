import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Building2, ShieldCheck, UserCheck } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";
import AuthIllustration from "../components/common/AuthIllustration";
import TextInput from "../components/common/TextInput";
import SelectInput from "../components/common/SelectInput";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

const DEPARTMENTS = [
  "Department of Land Resources (DoLR)",
  "Revenue Department",
  "Survey and Settlement Department",
  "Registration and Stamps Department",
  "Panchayati Raj Department",
  "Rural Development Department",
  "Urban Development Department",
  "District Collectorate",
  "Tehsil / Taluka Office",
  "State Land Records Bureau",
  "Other Government Department"
];

const ROLE_OPTIONS = [
  {
    value: "operator",
    label: "Operator",
    desc: "Upload and process documents",
    icon: UserCheck,
    gradient: "from-green-500 to-amia-600"
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Full access — verify records, view dashboards",
    icon: ShieldCheck,
    gradient: "from-blue-500 to-blue-600"
  }
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
    role: "operator"
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
      await signup(form.name, form.email, form.password, form.department, form.role);
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (signupError) {
      setError(signupError.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-bg px-4 py-8">
      <FloatingBackground />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <AuthIllustration />

        <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay sm:p-10">
          <h2 className="text-2xl font-semibold text-ink-primary">Create your account</h2>
          <p className="mt-1 text-sm text-ink-secondary">Get access to the digitization dashboard</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-ink-secondary">Sign up as</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = form.role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("role", option.value)}
                      className={`rounded-claySm p-3 text-left transition-all duration-200 ${
                        isSelected
                          ? `bg-gradient-to-br ${option.gradient} text-white shadow-clay`
                          : "bg-base-surface text-ink-secondary shadow-clayInset hover:bg-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <p className="mt-1.5 text-sm font-semibold">{option.label}</p>
                      <p className={`mt-0.5 text-[11px] ${isSelected ? "text-white/80" : "text-ink-muted"}`}>
                        {option.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

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
            <SelectInput
              id="department"
              label="Department"
              icon={<Building2 className="h-4 w-4" />}
              options={DEPARTMENTS}
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
    </div>
  );
}