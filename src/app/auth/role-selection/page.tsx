"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, User, Check } from "lucide-react";

export default function RoleSelection() {
  const { data: session, status } = useSession();
  const [selectedRole, setSelectedRole] = useState<"seller" | "buyer">("buyer");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user already has a role set
    if (
      session?.user?.role &&
      (session.user.role === "seller" || session.user.role === "buyer")
    ) {
      // User already has a role, redirect to appropriate dashboard
      if (session.user.role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/buyer/dashboard");
      }
      return;
    }

    // Get role from URL parameter
    const urlRole = searchParams.get("role");
    if (urlRole && (urlRole === "seller" || urlRole === "buyer")) {
      setSelectedRole(urlRole as "seller" | "buyer");
    }
  }, [session, router, searchParams]);

  const handleRoleConfirm = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      console.log("Updating role to:", selectedRole);
      const response = await fetch("/api/user/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        console.log("Role updated successfully");

        // Force a complete redirect with page reload
        if (selectedRole === "seller") {
          window.location.href = "/seller/dashboard";
        } else {
          window.location.href = "/buyer/dashboard";
        }
      } else {
        console.error("Failed to update role", await response.text());
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Scheduler
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please confirm your role to continue
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div>
              <label className="text-base font-medium text-gray-900">
                How do you want to use Scheduler?
              </label>
              <p className="text-sm leading-5 text-gray-500">
                You can change this later in your settings.
              </p>
              <div className="mt-4 space-y-4">
                <div
                  className={`relative border rounded-lg p-4 cursor-pointer ${
                    selectedRole === "buyer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedRole("buyer")}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={selectedRole === "buyer"}
                        onChange={() => setSelectedRole("buyer")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <label className="font-medium text-gray-900 cursor-pointer">
                        I'm a Buyer
                      </label>
                      <p className="text-sm text-gray-500">
                        I want to book appointments with sellers
                      </p>
                    </div>
                  </div>
                  {selectedRole === "buyer" && (
                    <div className="absolute top-4 right-4">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>

                <div
                  className={`relative border rounded-lg p-4 cursor-pointer ${
                    selectedRole === "seller"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedRole("seller")}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={selectedRole === "seller"}
                        onChange={() => setSelectedRole("seller")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <label className="font-medium text-gray-900 cursor-pointer">
                        I'm a Seller
                      </label>
                      <p className="text-sm text-gray-500">
                        I want to offer my time for appointments
                      </p>
                    </div>
                  </div>
                  {selectedRole === "seller" && (
                    <div className="absolute top-4 right-4">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={handleRoleConfirm}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up your account...
                  </div>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
