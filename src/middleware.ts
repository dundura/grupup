import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/bookings(.*)",
  "/profile(.*)",
  "/groups/create(.*)",
  "/free-play/create(.*)",
  "/trainer",
  "/trainer/(.*)",
]);

const SOCIAL_CRAWLERS = [
  "facebookexternalhit", "Twitterbot", "LinkedInBot",
  "Slackbot", "WhatsApp", "TelegramBot", "Googlebot",
];

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (isProtectedRoute(req) && !userId) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn({ returnBackUrl: req.url });
  }
  return NextResponse.next();
});

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const ua = req.headers.get("user-agent") ?? "";
  if (SOCIAL_CRAWLERS.some((bot) => ua.includes(bot))) {
    return NextResponse.next();
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
