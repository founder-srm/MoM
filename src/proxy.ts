<<<<<<< HEAD:src/middleware.ts
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
=======
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7:src/proxy.ts

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

<<<<<<< HEAD:src/middleware.ts
  const supabase = createSupabaseServerClient({
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        request.cookies.set(name, value)
        supabaseResponse.cookies.set(name, value, options)
      })
    },
  })
=======
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7:src/proxy.ts

  // Refresh the auth token to keep the session alive
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
