import { NextResponse } from "next/server"

export async function middleware(request) {
  // Absolute minimal middleware to prevent MIDDLEWARE_INVOCATION_FAILED
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}