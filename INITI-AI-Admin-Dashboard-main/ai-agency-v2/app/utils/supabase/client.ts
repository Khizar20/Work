import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Enhanced configuration to fix connection issues
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-my-custom-header': 'initi-ai-dashboard'
        }
      },
      // Add proper cookie options to fix session persistence issues
      cookies: {
        get(name) {
          if (typeof document === 'undefined') return undefined;
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name, value, options) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=${value}; path=${options?.path ?? '/'};${
            options?.sameSite ? ` samesite=${options.sameSite};` : ''
          }${options?.secure ? ' secure;' : ''}${options?.maxAge ? ` max-age=${options.maxAge};` : ''}`;
        },
        remove(name, options) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; path=${options?.path ?? '/'};${
            options?.sameSite ? ` samesite=${options.sameSite};` : ''
          }${options?.secure ? ' secure;' : ''} max-age=0;`;
        },
      },
    }
  );
}
