import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SearchParams = {
  error?: string;
};

const errorDetails: Record<
  string,
  {
    title: string;
    message: string;
    actions?: { label: string; href: string }[];
  }
> = {
  AccessDenied: {
    title: "Account Not Found",
    message:
      "We couldn't match your Google account with a TracèSys profile or invitation. Please ask your practicum coordinator to send you an invite before trying again.",
    actions: [{ label: "Back to Sign-in Options", href: "/select-role" }],
  },
  Configuration: {
    title: "Configuration Issue",
    message:
      "Something is misconfigured with our sign-in service. Please try again later.",
  },
  default: {
    title: "Sign-in Error",
    message: "Something went wrong while signing you in. Please try again.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const errorKey = params.error ?? "default";
  const content = errorDetails[errorKey] ?? errorDetails.default;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-100"
      style={{
        backgroundImage: "url(/images/auth-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg" />
      <Card className="relative z-10 w-full max-w-lg bg-white border-slate-200 text-slate-900 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-700">{content.message}</p>
          {errorKey === "AccessDenied" && (
            <div className="text-sm text-slate-500 space-y-1">
              <p>- Make sure you're using the invited school email account.</p>
              <p>
                - If you don't have an invite, contact your practicum
                coordinator.
              </p>
              <p>
                - Already onboarded? Ask an administrator to add you to
                TracèSys.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {(
            content.actions ?? [
              { label: "Back to Sign-in Options", href: "/select-role" },
            ]
          ).map((action) => (
            <Button
              key={action.href}
              asChild
              variant="secondary"
              className="flex-1"
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </CardFooter>
        <div className="px-6 pb-6 text-center text-xs text-slate-500">
          Need help? Email{" "}
          <a
            href="mailto:tracesys2025@gmail.com"
            className="underline font-medium text-primary-600"
          >
            tracesys2025@gmail.com
          </a>
        </div>
      </Card>
    </div>
  );
}
