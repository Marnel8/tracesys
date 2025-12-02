"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function InvitationAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const response = await api.get(`/invitation/validate/${token}`);
      setInvitation(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Invalid or expired invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = () => {
    setValidating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const role = invitation?.role || "student";
      
      // Redirect to server OAuth endpoint with invitation token
      const oauthUrl = `${apiUrl}/api/v1/auth/google?role=${role}&invitationToken=${encodeURIComponent(token)}`;
      
      window.location.href = oauthUrl;
    } catch (err) {
      console.error("Error signing in:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google"
      );
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="invitation-shell">
        <div className="invitation-content">
          <Card className="invitation-card max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Invitation error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push("/select-role")}
                className="invitation-primary-btn w-full"
              >
                Go to home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-shell">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="invitation-hero invitation-hero--sub">
          <div className="space-y-3">
            <p className="invitation-eyebrow">TracèSys invitation</p>
            <h1 className="text-3xl font-semibold leading-tight text-gray-900">
              You're invited to join as a {invitation?.role}
            </h1>
            <p className="text-base text-muted-foreground">
              Accept the invite below to unlock onboarding, dashboards, and
              practicum coordination. We’ll guide you through sign-in using the
              email on this invite.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="invitation-pill">
              Expires on {new Date(invitation?.expiresAt).toLocaleDateString()}
            </Badge>
            <Badge className="invitation-pill">
              Sent to {invitation?.email}
            </Badge>
          </div>
        </section>

        <div className="invitation-content invitation-content--form">
          <div className="w-full max-w-3xl mx-auto">
            <Card className="invitation-form-card">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Review & accept</CardTitle>
                <CardDescription>
                  Make sure the details below look right before continuing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {invitation && (
                  <div className="space-y-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Email
                        </p>
                        <p className="font-medium text-foreground">
                          {invitation.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Role
                        </p>
                        <p className="font-medium capitalize">
                          {invitation.role}
                        </p>
                      </div>
                      {invitation.department && (
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">
                            Department
                          </p>
                          <p className="font-medium">
                            {invitation.department.name}
                          </p>
                        </div>
                      )}
                      {invitation.section && (
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">
                            Section
                          </p>
                          <p className="font-medium">
                            {invitation.section.name}
                          </p>
                        </div>
                      )}
                      {invitation.program && (
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase text-muted-foreground">
                            Program
                          </p>
                          <p className="font-medium">{invitation.program}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAcceptInvitation}
                  disabled={validating}
                  className="invitation-primary-btn w-full"
                  size="lg"
                >
                  {validating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Accept invitation with Google"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
