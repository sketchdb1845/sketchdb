import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authClient, getAppSession } from "../lib/authClient";

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

  useEffect(() => {
    const restore = async () => {
      const session = await getAppSession();
      if (session.user) {
        navigate("/dashboard");
      }
    };

    restore();
  }, [navigate]);

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

    const session = await getAppSession({ bootstrap: true });
    if (!session.user) {
      throw new Error("Account created, but session could not be established. Please sign in again.");
    }
    navigate("/dashboard");
  };

  const onSignIn = async () => {
    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      throw new Error(result.error.message);
    }

    const session = await getAppSession({ bootstrap: true });
    if (!session.user) {
      throw new Error("Sign-in succeeded, but session could not be established. Please try again.");
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
    <div className="min-h-screen bg-[#f5f4ed] px-4 py-6 text-[#1F1F1E] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto mt-30 w-1/3 h-1/2  rounded-4xl border border-[#C66341]">
        <main className="flex items-center">
          <form onSubmit={onSubmit} className="w-full rounded-[2rem] border border-[#f0eee6] bg-[#faf9f5] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.07)] sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4 border-b border-[#e8e6dc] pb-5">
              <div>
                <p className="font-sans-claude text-[10px] uppercase tracking-[0.35em] text-[#87867f]">
                  Account
                </p>
                <h2 className="mt-2 font-sans-claude text-4xl leading-none text-[#1F1F1E]">
                  {heading}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-full border border-[#e8e6dc] bg-white px-4 py-2 text-sm font-medium text-[#4d4c48] transition hover:bg-[#f5f4ed]"
              >
                Home
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {mode === "signup" && (
                <input
                  className="w-full rounded-2xl border border-[#e8e6dc] bg-white px-4 py-3 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              {(mode === "signin" || mode === "signup" || mode === "forgot") && (
                <input
                  className="w-full rounded-2xl border border-[#e8e6dc] bg-white px-4 py-3 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}

              {(mode === "signin" || mode === "signup" || mode === "reset") && (
                <input
                  className="w-full rounded-2xl border border-[#e8e6dc] bg-white px-4 py-3 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

              {(mode === "signup" || mode === "reset") && (
                <input
                  className="w-full rounded-2xl border border-[#e8e6dc] bg-white px-4 py-3 text-[#1F1F1E] outline-none transition placeholder:text-[#87867f] focus:border-[#3898ec] focus:ring-4 focus:ring-[#3898ec]/15"
                  placeholder="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              {error && <p className="rounded-2xl border border-[#f1c7c7] bg-[#fdf4f4] px-4 py-3 text-sm text-[#b53333]">{error}</p>}
              {message && <p className="rounded-2xl border border-[#d8e9d8] bg-[#f4faf4] px-4 py-3 text-sm text-[#2f6b2f]">{message}</p>}

              <button
                disabled={loading}
                className="w-full rounded-full bg-[#c96442] px-6 py-3.5 text-sm font-semibold text-[#faf9f5] transition hover:bg-[#b95d3c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Please wait..." : heading}
              </button>

              <div className="flex flex-row flex-wrap justify-center gap-2 py-1 text-sm text-[#5e5d59]">
                {mode !== "signin" && (
                  <button type="button" className="w-[49%] rounded-full bg-[#C66341] text-white border border-[#e8e6dc] px-4 py-2 transition hover:bg-[#f5f4ed] hover:text-[#C66341] cursor-pointer" onClick={() => setSearchParams({ mode: "signin" })}>
                    Sign in
                  </button>
                )}
                {mode !== "signup" && (
                  <button type="button" className="w-[49%] rounded-full bg-[#C66341] text-white border border-[#e8e6dc] px-4 py-2 transition hover:bg-[#f5f4ed] hover:text-[#C66341] cursor-pointer" onClick={() => setSearchParams({ mode: "signup" })}>
                    Sign up
                  </button>
                )}
                {mode !== "forgot" && (
                  <button type="button" className="w-[49%] rounded-full bg-[#C66341] text-white border border-[#e8e6dc] px-4 py-2 transition hover:bg-[#f5f4ed] hover:text-[#C66341] cursor-pointer" onClick={() => setSearchParams({ mode: "forgot" })}>
                    Forgot password
                  </button>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
