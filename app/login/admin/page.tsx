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
import { ArrowLeft, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useLogout } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import api from "@/lib/api";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value), {
      message: "Password must contain both uppercase and lowercase letters",
    }),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

// Helper function to validate redirect path (prevent open redirects)
function validateRedirectPath(path: string | null): string {
  if (!path) return "/dashboard/admin";

  // Only allow internal paths (starting with /)
  // Reject external URLs, protocol-relative URLs, and paths with //
  if (
    !path.startsWith("/") ||
    path.includes("//") ||
    path.includes(":") ||
    path.includes("javascript:") ||
    path.includes("data:")
  ) {
    return "/dashboard/admin";
  }

  // Only allow specific dashboard paths
  if (
    path.startsWith("/dashboard/admin") ||
    path.startsWith("/dashboard/instructor") ||
    path.startsWith("/dashboard/student")
  ) {
    return path;
  }

  // Default to admin dashboard for any other internal path
  return "/dashboard/admin";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const handleSeedAdmin = async () => {
    setIsSeeding(true);
    try {
      const response = await api.post("/user/seed-admin");
      toast.success(
        `Admin account created! Email: ${response.data.email}, Password: ${response.data.password}`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to seed admin account"
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true);
    try {
      const res: any = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      const userRole = res?.user?.role;
      const isActive = res?.user?.isActive;

      if (userRole !== "admin") {
        toast.error("This login is for administrators only.");
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
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use window.location.href for full page reload to ensure cookies are included
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
              <Shield className="w-5 h-5 text-primary-600" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access the admin dashboard
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

            {/* Seeder Button */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-secondary-50 px-2 text-muted-foreground">
                  Admin Tools
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border border-amber-300 text-amber-700 bg-amber-50 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50/50"
              onClick={handleSeedAdmin}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Seed Admin Account
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
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

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

