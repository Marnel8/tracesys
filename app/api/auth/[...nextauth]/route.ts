import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Get invitation token from cookies
        const cookieStore = await cookies();
        const invitationToken = cookieStore.get("invitationToken")?.value;

        // Debug logging (remove in production if needed)
        if (!invitationToken) {
          console.log(
            "No invitation token found in cookies during OAuth callback"
          );
        } else {
          console.log(
            "Invitation token found in cookies during OAuth callback"
          );
        }

        // Call Express API to handle OAuth callback
        const response = await fetch(`${API_URL}/api/v1/auth/oauth-callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include credentials for cross-domain cookie handling
          body: JSON.stringify({
            email: user.email,
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            avatar: user.image,
            provider: "google",
            invitationToken: invitationToken,
          }),
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          console.error("OAuth callback error:", error);

          // If it's a new user without invitation token, provide clearer error
          if (
            response.status === 400 &&
            error?.error?.message?.includes("Invitation token")
          ) {
            console.error("New user registration requires invitation token");
          }

          // If email doesn't match invitation, provide clearer error
          if (
            response.status === 400 &&
            error?.error?.message?.includes("email")
          ) {
            console.error("OAuth email does not match invitation email");
          }

          return false;
        }

        const data = await response.json();
        const tokens = data?.data?.tokens;

        // Extract Set-Cookie headers from server response
        // getSetCookie() is available in Node.js 18+ and Next.js
        const setCookieHeaders = response.headers.getSetCookie?.() || [];
        
        // Check if server sent cookies via Set-Cookie headers
        const serverSentCookies = setCookieHeaders.some(header => 
          header.includes("access_token=") || header.includes("refresh_token=")
        );
        
        // Only set cookies on client side if:
        // 1. Server didn't send Set-Cookie headers (fallback for cross-domain scenarios)
        // 2. OR we're in a cross-domain setup where server cookies won't be accessible
        // The server should handle setting cookies via Set-Cookie headers in most cases
        if (!serverSentCookies && tokens?.accessToken && tokens?.refreshToken) {
          // Fallback: Set cookies if server didn't send Set-Cookie headers
          // This is important for cross-domain scenarios where Set-Cookie headers
          // from the server might not be accessible to the client
          const isProd = process.env.NODE_ENV === "production";
          const cookieDomain = process.env.COOKIE_DOMAIN;
          
          const baseCookieOptions: {
            httpOnly: boolean;
            sameSite: "lax" | "none";
            secure: boolean;
            path: string;
            maxAge: number;
            domain?: string;
          } = {
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd, // Must be true when sameSite is "none"
            path: "/",
            maxAge: 60 * 60, // 1 hour for access token
          };
          
          // Set domain only if explicitly configured and not localhost
          if (cookieDomain && cookieDomain !== "localhost" && !cookieDomain.startsWith("127.0.0.1")) {
            baseCookieOptions.domain = cookieDomain;
          }

          cookieStore.set("access_token", tokens.accessToken, baseCookieOptions);
          
          // Refresh token with longer expiry
          cookieStore.set("refresh_token", tokens.refreshToken, {
            ...baseCookieOptions,
            maxAge: 3 * 24 * 60 * 60, // 3 days
          });
        }

        if (invitationToken) {
          cookieStore.delete("invitationToken");
        }

        // Store user data in account for jwt callback
        (account as any).userData = data.data.user;
        (account as any).needsOnboarding = data.data.needsOnboarding;

        return true;
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account, trigger, session: sessionUpdate }) {
      if (trigger === "update" && sessionUpdate) {
        if (typeof (sessionUpdate as any).needsOnboarding !== "undefined") {
          token.needsOnboarding = (sessionUpdate as any).needsOnboarding;
        }
        if ((sessionUpdate as any).user) {
          const updatedUser = (sessionUpdate as any).user;
          token.id = (updatedUser as any).id ?? token.id;
          token.role = (updatedUser as any).role ?? token.role;
          token.email = (updatedUser as any).email ?? token.email;
        }
      }

      if ((account as any)?.userData) {
        const userData = (account as any).userData;
        token.id = userData.id;
        token.role = userData.role;
        token.email = userData.email;
        token.needsOnboarding = (account as any).needsOnboarding;
      } else if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
        (session as any).needsOnboarding =
          typeof (session as any).needsOnboarding !== "undefined"
            ? (session as any).needsOnboarding
            : token.needsOnboarding;
      }
      return session;
    },
  },
  pages: {
    signIn: "/select-role",
    error: "/auth/error",
  },
});

export const { GET, POST } = handlers;
