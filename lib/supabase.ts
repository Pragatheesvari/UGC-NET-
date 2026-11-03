import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// false until the two environment variables below are set in .env.local
export const authConfigured = Boolean(url && key);
export const supabase = authConfigured ? createClient(url as string, key as string) : null;
