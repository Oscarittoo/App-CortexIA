import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const createDisabledClient = () => {
  const error = new Error('Supabase non configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env');

  const chainable = {
    order: async () => ({ data: [], error }),
    eq: () => ({
      maybeSingle: async () => ({ data: null, error }),
      update: async () => ({ data: null, error })
    }),
    maybeSingle: async () => ({ data: null, error })
  };

  return {
    auth: {
      signInWithPassword: async () => ({ data: null, error }),
      signUp: async () => ({ data: null, error }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error }),
      admin: {
        listUsers: async () => ({ data: { users: [] }, error })
      }
    },
    from: () => ({
      select: () => chainable,
      update: () => ({ eq: async () => ({ data: null, error }) }),
      upsert: async () => ({ data: null, error }),
      eq: () => ({ maybeSingle: async () => ({ data: null, error }) })
    })
  };
};

if (!isValidHttpUrl(supabaseUrl) || !supabaseAnonKey) {
  const keyLength = typeof supabaseAnonKey === 'string' ? supabaseAnonKey.length : 0;
  console.warn('Supabase non configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env');
  console.warn('Diagnostic Supabase:', {
    url: supabaseUrl || '(vide)',
    urlValide: isValidHttpUrl(supabaseUrl),
    anonKeyPresent: Boolean(supabaseAnonKey),
    anonKeyLength: keyLength
  });
}

export const supabase = isValidHttpUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : createDisabledClient();
