
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || `https://${window.location.hostname}`,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDev: import.meta.env.DEV
};
