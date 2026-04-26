import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/bookings(.*)",
  "/profile(.*)",
  "/groups/create(.*)",
  "/free-play/create(.*)",
  "/trainer",
  "/trainer/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const path = req.nextUrl.pathname;

  if (isProtectedRoute(req) && !userId) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Redirect signed-in users who haven't finished onboarding
  if (
    userId &&
    !(sessionClaims?.metadata as Record<string, unknown>)?.onboardingComplete &&
    !path.startsWith("/onboarding") &&
    !path.startsWith("/api") &&
    !path.startsWith("/_next")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
