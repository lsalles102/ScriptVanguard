import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgepubxloominybyvcuv.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZXB1Ynhsb29taW55Ynl2Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjI2MjgsImV4cCI6MjA2Mjk5ODYyOH0.RVa4ZZPHWBK72z7xh2X-5k1AdLFAwASArWybotNGlow'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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