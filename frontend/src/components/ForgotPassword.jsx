import { useState } from "react";
import axios from "../utils/axios";
import NotificationAlert from "../components/NotificationAlert.jsx";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);   // 1 = email, 2 = new pw
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null); // {msg, buttons}

  /* ────────────── step 1: verify e-mail ────────────── */
  const submitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/forgot-password", { email });
      setUserId(data.userId);
      setStep(2);
    } catch (err) {
      setAlert({
        msg: err.response?.data?.message || "Something went wrong.",
        buttons: [{ label: "OK" }]
      });
    }
  };

  /* ────────────── step 2: set new password ─────────── */
  const submitNewPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/reset-password/${userId}`, { password });
      setAlert({
        msg: "Password updated. Sign in to continue.",
        buttons: [
          { label: "Not now" },
          { label: "Sign in", action: () => (window.location.href = "/login") }
        ]
      });
    } catch (err) {
      setAlert({
        msg: err.response?.data?.message || "Reset failed.",
        buttons: [{ label: "OK" }]
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 space-y-6">
        {step === 1 && (
          <form onSubmit={submitEmail} className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-2">
              Forgot your password?
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Enter the e-mail linked to your account.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Continue
            </button>
            <Link to="/login" className="block text-center text-sm text-red-600 hover:underline">
              Back to sign in
            </Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitNewPassword} className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-2">Set new password</h2>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="New password"
            />
            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Save password
            </button>
          </form>
        )}
      </div>

      {/* NotificationAlert reused everywhere */}
      {alert && (
        <NotificationAlert
          isOpen={!!alert}
          message={alert.msg}
          buttons={alert.buttons}
          onClose={() => setAlert(null)}
        />
      )}
    </section>
  );
};

export default ForgotPassword;
