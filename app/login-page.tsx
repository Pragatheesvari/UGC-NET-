"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, authConfigured } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMsg("");
    if (!supabase) {
      setMsg("Authentication is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server.");
      return;
    }
    if (!email || password.length < 6) {
      setMsg("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) setMsg(error.message);
        else if (data.session) router.push("/");
        else setMsg("Account created. Check your email and confirm your address, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMsg(error.message);
        else router.push("/");
      }
    } catch {
      setMsg("Could not reach the authentication service. Check your internet connection and Supabase URL.");
    }
    setBusy(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-[#245c4b]">NET Mastery Hub</h1>
        <p className="mb-4 text-sm text-[#78817e]">{mode === "login" ? "Sign in to save your progress" : "Create your account"}</p>
        {!authConfigured && (
          <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Sign-in is not set up on this server yet (missing Supabase keys).</p>
        )}
        <input className="mb-3 w-full rounded-xl border p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="mb-3 w-full rounded-xl border p-3" type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}
        <button disabled={busy} onClick={submit} className="w-full rounded-xl bg-[#245c4b] p-3 font-semibold text-white disabled:opacity-60">
          {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}
        </button>
        <button className="mt-3 w-full text-sm text-[#245c4b] underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMsg(""); }}>
          {mode === "login" ? "New here? Create an account" : "Already registered? Sign in"}
        </button>
        <a className="mt-2 block text-center text-sm text-[#78817e]" href="/">Continue as guest</a>
      </div>
    </main>
  );
}
