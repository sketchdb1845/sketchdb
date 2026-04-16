import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/authClient";

type Mode = "signin" | "signup" | "forgot" | "reset";

const getMode = (mode: string | null): Mode => {
  if (mode === "signup" || mode === "forgot" || mode === "reset") {
    return mode;
  }
  return "signin";
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const mode = getMode(searchParams.get("mode"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const heading = useMemo(() => {
    if (mode === "signup") return "Create your account";
    if (mode === "forgot") return "Forgot password";
    if (mode === "reset") return "Reset password";
    return "Sign in";
  }, [mode]);

  const onSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    navigate("/dashboard");
  };

  const onSignIn = async () => {
    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      throw new Error(result.error.message);
    }

    navigate("/dashboard");
  };

  const onForgotPassword = async () => {
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    setMessage("If this email exists, a reset link has been sent.");
  };

  const onResetPassword = async () => {
    if (!token) {
      throw new Error("Reset token is missing.");
    }

    if (password !== confirmPassword) {
      throw new Error("Password and confirm password must match.");
    }

    const result = await authClient.resetPassword({
      token,
      newPassword: password,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    setMessage("Password updated. You can sign in now.");
    setSearchParams({ mode: "signin" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        await onSignUp();
      } else if (mode === "forgot") {
        await onForgotPassword();
      } else if (mode === "reset") {
        await onResetPassword();
      } else {
        await onSignIn();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-[#101a2d] border border-[#1f2c47] rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">{heading}</h1>

        {mode === "signup" && (
          <input
            className="w-full rounded-md p-3 bg-[#0b1220] border border-[#1f2c47]"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        {(mode === "signin" || mode === "signup" || mode === "forgot") && (
          <input
            className="w-full rounded-md p-3 bg-[#0b1220] border border-[#1f2c47]"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {(mode === "signin" || mode === "signup" || mode === "reset") && (
          <input
            className="w-full rounded-md p-3 bg-[#0b1220] border border-[#1f2c47]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        {(mode === "signup" || mode === "reset") && (
          <input
            className="w-full rounded-md p-3 bg-[#0b1220] border border-[#1f2c47]"
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-green-400 text-sm">{message}</p>}

        <button disabled={loading} className="w-full py-3 rounded-md bg-[#1d4ed8] hover:bg-[#1e40af] font-semibold disabled:opacity-60">
          {loading ? "Please wait..." : heading}
        </button>

        <div className="flex flex-wrap gap-3 text-sm text-gray-300">
          {mode !== "signin" && (
            <button type="button" className="underline" onClick={() => setSearchParams({ mode: "signin" })}>
              Sign in
            </button>
          )}
          {mode !== "signup" && (
            <button type="button" className="underline" onClick={() => setSearchParams({ mode: "signup" })}>
              Sign up
            </button>
          )}
          {mode !== "forgot" && (
            <button type="button" className="underline" onClick={() => setSearchParams({ mode: "forgot" })}>
              Forgot password
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
