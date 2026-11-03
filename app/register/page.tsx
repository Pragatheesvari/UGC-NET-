import type { Metadata } from "next";
import AuthForm from "../components/AuthForm";

export const metadata: Metadata = {
  title: "Create an account — NETmaster",
  description: "Create your NETmaster UGC NET study account.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
