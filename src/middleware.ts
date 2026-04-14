import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Only verify session on specific protected routes defined in matcher
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        try {
            const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            });

            if (!response.ok) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            const session = await response.json();

            // If no active session, redirect to login
            if (!session || !session.session) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        } catch (error) {
            // Fallback to login on error (e.g. timeout)
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
    
    // Redirect authenticated users away from login page
    if (request.nextUrl.pathname.startsWith("/login")) {
         try {
            const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            });
            const session = await response.json();
            if (session && session.session) {
                 return NextResponse.redirect(new URL("/dashboard", request.url));
            }
         } catch {
             // Let them access login if error
         }
    }

    return NextResponse.next();
}

export const config = {
    // Protect dashboard routes and intercept login page
    matcher: ["/dashboard/:path*", "/login"],
};
