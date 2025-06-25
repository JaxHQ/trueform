
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wniuvfcykklziqvhzsyg.supabase.co';
const supabaseAnonKey = 'your-anon-keyeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaXV2ZmN5a2tsemlxdmh6c3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTkxMDAsImV4cCI6MjA2NTM3NTEwMH0.rnS69Xv_HTjn7qlN591vJQ9diuR9VxzPLi27qRVzlKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);