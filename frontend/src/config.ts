
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDev: import.meta.env.DEV
};
