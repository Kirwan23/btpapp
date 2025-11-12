import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const getEnvVar = (key: string): string | null => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    const value = (import.meta as any).env?.[key];
    if (value && value !== "undefined") return value;
  }
  if (typeof window !== "undefined") {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

const defaultUrl = "https://vsdmspbmlxybxuccwadg.supabase.co";
const defaultAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZG1zcGJtbHh5Ynh1Y2N3YWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzE5MzYsImV4cCI6MjA3Nzk0NzkzNn0.ZKXHxXr4aLDq5In9VJpkrWeff1vTkfz-Vg2oxT9QOUM";

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL") || defaultUrl;
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY") || defaultAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

export const supabase = client;


