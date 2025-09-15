"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const [role, setRole] = useState<"seller" | "buyer">();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");

  useEffect(() => {
    // Set role from URL parameter if provided
    if (urlRole === "seller" || urlRole === "buyer") {
      setRole(urlRole);
    }
  }, [urlRole]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      // Pass the role as a parameter to the role selection page
      await signIn("google", {
        callbackUrl: `/auth/role-selection?role=${role}`,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Scheduler
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your role and sign in with Google
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">I am a:</label>
            <div className="mt-2 space-y-2 text-black">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="buyer"
                  checked={role === "buyer"}
                  onChange={(e) => setRole(e.target.value as "buyer")}
                  className="mr-2"
                />
                <span>Buyer - I want to book appointments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="seller"
                  checked={role === "seller"}
                  onChange={(e) => setRole(e.target.value as "seller")}
                  className="mr-2"
                />
                <span>Seller - I want to offer my time for booking</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
