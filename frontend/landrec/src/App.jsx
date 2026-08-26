import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadDocument from "./pages/UploadDocument";
import VerificationQueue from "./pages/VerificationQueue";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><VerificationQueue /></ProtectedRoute>} />
    </Routes>
  );
}