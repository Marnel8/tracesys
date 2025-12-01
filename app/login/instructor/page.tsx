"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Users, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useLogout } from "@useAuth";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const instructorLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type InstructorLoginForm = z.infer<typeof instructorLoginSchema>;

// Helper function to validate redirect path (prevent open redirects)
function validateRedirectPath(path: string | null): string {
  if (!path) return "/dashboard/instructor";
  
  // Only allow internal paths (starting with /)
  // Reject external URLs, protocol-relative URLs, and paths with //
  if (
    !path.startsWith("/") ||
    path.includes("//") ||
    path.includes(":") ||
    path.includes("javascript:") ||
    path.includes("data:")
  ) {
    return "/dashboard/instructor";
  }
  
  // Only allow specific dashboard paths
  if (path.startsWith("/dashboard/instructor") || path.startsWith("/dashboard/student")) {
    return path;
  }
  
  // Default to instructor dashboard for any other internal path
  return "/dashboard/instructor";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const handleGoogleSignIn = async () => {
    try {
      setGoogleSigningIn(true);
      await signIn("google", { callbackUrl: "/dashboard/instructor" });
    } catch (error: any) {
      toast.error("Google sign-in failed");
      setGoogleSigningIn(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorLoginForm>({
    resolver: zodResolver(instructorLoginSchema),
  });

  const onSubmit = async (data: InstructorLoginForm) => {
    setIsLoading(true);
    try {
      const res: any = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      const userRole = res?.user?.role;
      const isActive = res?.user?.isActive;

      if (userRole !== "instructor") {
        toast.error("This login is for instructors only.");
        try {
          await logoutMutation.mutateAsync();
        } catch {}
        setIsLoading(false);
        return;
      }

      if (isActive === false) {
        toast.error(
          "Your account has been deactivated. Please contact your administrator."
        );
        try {
          await logoutMutation.mutateAsync();
        } catch {}
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully");
      
      // Get redirect path from URL params and validate it (prevent open redirects)
      const redirectParam = searchParams.get("redirect");
      const redirectPath = validateRedirectPath(redirectParam);
      
      // Wait for cookies to be set by the browser before redirect
      // The server sets cookies via Set-Cookie headers in the login response.
      // We need to give the browser time to process them before the middleware runs.
      // Note: We can't check httpOnly cookies from JavaScript, but since the login
      // was successful, the server has sent Set-Cookie headers. We just need to
      // wait for the browser to process them.
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use window.location.href for full page reload to ensure cookies are included
      // This ensures a fresh request where cookies will be available to middleware
      window.location.href = redirectPath;
    } catch (error: any) {
      toast.error(error?.message || "Failed to sign in");
      setIsLoading(false);
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
              <Users className="w-5 h-5 text-primary-600" />
              Instructor Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to manage students and sections
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 pr-10"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password/instructor"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full border border-primary-500 bg-primary-50 text-primary-700 font-medium py-2.5 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                disabled={isLoading || loginMutation.isPending}
              >
                {isLoading || loginMutation.isPending
                  ? "Signing in..."
                  : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-secondary-50 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
              onClick={handleGoogleSignIn}
              disabled={googleSigningIn}
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

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup/instructor"
                  className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Create one here
                </Link>
              </p>
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

export default function InstructorLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
