import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import NotificationAlert from "../components/NotificationAlert.jsx";

function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotUserId, setForgotUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState(""); // inline error
  const [alert, setAlert] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    const payload = formData.identifier.includes("@")
      ? { email: formData.identifier, password: formData.password }
      : { username: formData.identifier, password: formData.password };

    try {
      const res = await axios.post("/login", payload);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.error) {
        setMessage(err.response.data.error);
        setTimeout(() => setMessage(""), 4000);
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Verify Email
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setAlert({
        message: "Please enter your email address",
        type: "alert",
        onConfirm: () => setAlert(null)
      });
      return;
    }

    try {
      const response = await axios.post("/forgot-password", { email: forgotEmail });
      if (response.data.ok) {
        setForgotUserId(response.data.userId);
        setForgotStep(2);
      }
    } catch (err) {
      setAlert({
        message: err.response?.data?.message || "User not found with this email address",
        type: "alert",
        onConfirm: () => setAlert(null)
      });
    }
  };

  // Forgot Password Step 2: Set New Password
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters long');
      return;
    }
    setPwError('');
    try {
      const response = await axios.put(`/reset-password/${forgotUserId}`, {
        password: newPassword
      });
      if (response.data.ok) {
        setAlert({
          message: "Password reset successfully! You can now sign in with your new password.",
          type: "auth",
          onCancel: () => setAlert(null),        // “Not now”
          onConfirm: () => {                     // “Sign In”
            setAlert(null);
            setShowForgotPassword(false);
            setForgotStep(1);
            setForgotEmail("");
            setNewPassword("");
            setForgotUserId("");
          }
        });
      }
    } catch (err) {
      setAlert({
        message: err.response?.data?.message || "Failed to reset password",
        type: "alert",
        onConfirm: () => setAlert(null)
      });
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotEmail("");
    setNewPassword("");
    setForgotUserId("");
    setPwError('');
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <section className="text-center">
          <img
            src="https://www.gstatic.com/youtube/img/branding/youtubelogo/svg/youtubelogo.svg"
            alt="YouTube"
            className="h-8 mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-900">
            {showForgotPassword ? "Reset Password" : "Welcome back"}
          </h2>
          <p className="mt-2 text-gray-600">
            {showForgotPassword 
              ? (forgotStep === 1 ? "Enter your email to reset password" : "Set your new password")
              : "Sign in to your account"}
          </p>
        </section>

        {!showForgotPassword ? (
          // Regular Login Form
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}
            
            <fieldset className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email or username"
                  autoComplete="username"
                  value={formData.identifier}
                  onChange={handleChange}
                />
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                
                {/* Forgot Password Link */}
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-red-600 hover:text-red-500 cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 cursor-pointer border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                  Create account
                </Link>
              </p>
            </div>
          </form>
        ) : (
          // Forgot Password Form
          <div className="mt-8 space-y-6">
            {forgotStep === 1 ? (
              // Step 1: Enter Email
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetForgotPassword}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: Set New Password
              <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (pwError) setPwError('');
                    }}
                  />
                  {pwError && <p className="mt-1 text-sm text-red-600">{pwError}</p>}
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setPwError(''); }}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Notification Alert */}
      {alert?.message && (
        <NotificationAlert
          isOpen={true}
          message={alert.message}
          type={alert.type || "alert"}
          onCancel={alert.onCancel}
          onConfirm={alert.onConfirm}
          cancelLabel={alert.cancelLabel}
          confirmLabel={alert.confirmLabel}
        />
      )}
    </section>
  );
}

export default Login;
