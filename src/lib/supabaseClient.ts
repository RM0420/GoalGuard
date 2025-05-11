import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Fetch Supabase URL and Anon Key from environment variables.
// Ensure you have a .env file in your root directory with:
// SUPABASE_URL=your_supabase_url
// SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing. Make sure .env is set up correctly and variables are prefixed with EXPO_PUBLIC_."
  );
}

// Explicitly provide global fetch and WebSocket for React Native environment
declare var global: any; // To satisfy TypeScript for global.WebSocket if not readily typed

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: global.fetch,
    WebSocket: global.WebSocket,
  },
});
