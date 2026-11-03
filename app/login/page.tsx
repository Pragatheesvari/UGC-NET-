import type { Metadata } from "next";
import AuthForm from "../components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — NETmaster",
  description: "Sign in to your NETmaster UGC NET study space.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
