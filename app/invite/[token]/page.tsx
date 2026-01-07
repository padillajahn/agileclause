"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function InvitePage() {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  useEffect(() => {
    async function checkInvitation() {
      // Check if invitation exists and is valid
      const { data, error } = await supabase
        .from("invitations")
        .select("*, roles(name)")
        .eq("token", token)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        setError("This invitation is invalid or has expired.");
      } else {
        setInvitation(data);
      }
      setLoading(false);
    }

    checkInvitation();
  }, [token, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Invalid Invitation</h1>
            <p className="text-slate-500 mb-4">{error}</p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-semibold tracking-tight">AgileClause</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold mb-2">You're Invited!</h1>
          <p className="text-slate-500 mb-2">
            You've been invited to join AgileClause as a
          </p>
          <p className="text-lg font-medium text-blue-600 mb-4">
            {invitation?.roles?.name || "Team Member"}
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Invitation sent to: {invitation?.email}
          </p>

          <Link
            href={`/signup?token=${token}`}
            className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Accept & Create Account
          </Link>

          <p className="mt-4 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
