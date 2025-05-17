
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL não está definida');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY não está definida');
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export const isUserLoggedIn = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export const isUserAdmin = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user?.user_metadata?.role === 'admin';
};

export const logout = async () => {
  await supabase.auth.signOut();
};
