"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";

export default function StudentLoginPage() {
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleSigningIn(true);
      await signIn("google", { callbackUrl: "/dashboard/student" });
    } catch (error) {
      console.error("Google sign-in failed", error);
      setGoogleSigningIn(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url(/images/auth-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-secondary-50/95 backdrop-blur-md border-primary-200 shadow-2xl animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Image
                src="/images/tracesys-logo.png"
                alt="TracèSys Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Student Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Use your school Google account to access your practicum records
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-center text-gray-700">
              Sign in with your school Google account to access your practicum
              records.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
              disabled={googleSigningIn}
              onClick={handleGoogleSignIn}
            >
              {googleSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Need help? Contact your practicum coordinator for assistance.
            </p>

            <div className="text-center">
              <Link
                href="/select-role"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700 hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
