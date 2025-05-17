
export const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://seu-backend.repl.co'
    : 'http://localhost:5000',
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY
};
