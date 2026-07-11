import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

<<<<<<< HEAD
type CookieAdapter = {
  getAll(): Array<{ name: string; value: string }>
  setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>): void
}
=======
export async function createClient() {
  const cookieStore = await cookies();
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7

export function createSupabaseServerClient(cookieStore: CookieAdapter) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
<<<<<<< HEAD
          cookieStore.setAll(cookiesToSet)
        },
      },
    },
  )
=======
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
}

export async function createClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient({
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      } catch (error) {
        // The `set` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
  })
}
