
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgepubxloominybyvcuv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZXB1Ynhsb29taW55Ynl2Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjI2MjgsImV4cCI6MjA2Mjk5ODYyOH0.RVa4ZZPHWBK72z7xh2X-5k1AdLFAwASArWybotNGlow';

export const supabase = createClient(supabaseUrl, supabaseKey);
