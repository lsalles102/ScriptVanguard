
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};
