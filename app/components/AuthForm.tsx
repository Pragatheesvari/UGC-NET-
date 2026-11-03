"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authConfigured, supabase } from "../../lib/supabase";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");

    if (!authConfigured || !supabase) {
      setNotice(
        "Authentication is not connected yet. Add your Supabase URL and public anon key to .env.local, then restart the app. Your details have not been sent or saved.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (isRegister) {
      const name = String(formData.get("name") ?? "");
      if (password !== formData.get("confirmPassword")) {
        setNotice("Those passwords do not match. Please try again.");
        return;
      }

      setBusy(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) {
          setNotice(error.message);
        } else if (data.session) {
          router.push("/");
        } else {
          setNotice("Account created. Check your email to confirm your address, then sign in.");
        }
      } catch {
        setNotice("Could not reach Supabase. Check your connection and project URL.");
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setNotice(error.message);
      } else {
        router.push("/");
      }
    } catch {
      setNotice("Could not reach Supabase. Check your connection and project URL.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="header">
        <Link className="auth-brand" href="/" aria-label="NETmaster home">
          <span className="brandMark">N</span>
          <span>NETmaster<span className="brandDot">.</span></span>
        </Link>
        <Link className="auth-back-link" href="/">
          Back to study dashboard
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-story" aria-label="Your UGC NET study journey">
          <div className="auth-story-glow" />
          <span className="storyLabel">YOUR UGC NET JOURNEY</span>
          <h1>Small steps.<br />A stronger <em>future.</em></h1>
          <p>
            Make space for focused study, steady practice, and the progress
            you&apos;re working toward.
          </p>
          <div className="bookArt" aria-hidden="true">
            <span className="bookPageLeft"><i /><i /><i /></span>
            <span className="bookPageRight"><i /><i /><i /></span>
            <span className="bookSpine" />
          </div>
          <span className="storyCaption">ONE DAY AT A TIME</span>
        </section>

        <section className="formPanel">
          <div className="formHeading">
            <span className="auth-eyebrow">YOUR STUDY SPACE</span>
            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p>
              {isRegister
                ? "Set up your space and make your next study session count."
                : "Sign in to pick up where your preparation left off."}
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>
            )}
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </label>
            {isRegister && (
              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  minLength={8}
                  required
                />
              </label>
            )}

            <button className="submit" type="submit" disabled={busy}>
              {busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
            <p className="notice" aria-live="polite" role="status">
              {notice}
            </p>
          </form>

          <p className="switchMode">
            {isRegister ? "Already have an account?" : "New to NETmaster?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="authNote">
            Sign in to save your study progress to your Supabase account.
          </p>
        </section>
      </main>
      <footer className="footer">
        Prepare with purpose. Progress at your own pace.
      </footer>
    </div>
  );
}
