
export const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : `http://0.0.0.0:5000`,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY
};
