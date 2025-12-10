"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useShowToast";
import { Button } from "../components/ui/button";

export const AuthGuard = ({
  children,
  requiredRole = null,
  excludedRoles = null,
}) => {
  const { isLoggedIn, role, isVendor, isShopAdmin } = useAuth();
  const router = useRouter();
  const { showError } = useToast();
  const [hasShownError, setHasShownError] = useState(false);

  // Check if user has the required role(s)
  const hasRequiredRole = () => {
    if (!requiredRole) return true; // No role requirement

    // Handle array of roles
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    // Map role strings to auth checks
    const roleChecks = {
      VENDOR: isVendor || role === "VENDOR",
      "SHOP ADMIN": isShopAdmin || role === "SHOP ADMIN",
      SELLER: role === "SELLER",
      ADMIN: role === "ADMIN",
      USER: role === "USER",
    };

    // Check if user has any of the required roles
    return requiredRoles.some((reqRole) => roleChecks[reqRole] || false);
  };

  // Check if user has any excluded role(s)
  const hasExcludedRole = () => {
    if (!excludedRoles) return false; // No role exclusion

    // Handle array of roles
    const excludedRolesList = Array.isArray(excludedRoles)
      ? excludedRoles
      : [excludedRoles];

    // Map role strings to auth checks
    const roleChecks = {
      VENDOR: isVendor || role === "VENDOR",
      "SHOP ADMIN": isShopAdmin || role === "SHOP ADMIN",
      SELLER: role === "SELLER",
      ADMIN: role === "ADMIN",
      USER: role === "USER",
    };

    // Check if user has any of the excluded roles
    return excludedRolesList.some(
      (excludedRole) => roleChecks[excludedRole] || false
    );
  };

  // Determine if user has access
  const userHasAccess = (() => {
    // If user is not logged in
    if (!isLoggedIn) {
      // Allow access if no role is required, deny if role is required
      return !requiredRole;
    }

    // If user is logged in, check role requirements and exclusions
    return hasRequiredRole() && !hasExcludedRole();
  })();

  useEffect(() => {
    // Reset error state when login status or role changes
    setHasShownError(false);
  }, [isLoggedIn, role]);

  useEffect(() => {
    // Only show error once when access is denied
    if (!userHasAccess && !hasShownError) {
      if (!isLoggedIn && requiredRole) {
        // Only show login error if a role is required
        showError("Please login to access this page");
        setHasShownError(true);

        const timeoutId = setTimeout(() => {
          router.replace("/auth/login");
        }, 3000);

        return () => clearTimeout(timeoutId);
      } else if (requiredRole && !hasRequiredRole()) {
        const roleText = Array.isArray(requiredRole)
          ? requiredRole.join(" or ")
          : requiredRole;
        showError(`Access denied. This page requires ${roleText} role.`);
        setHasShownError(true);

        const timeoutId = setTimeout(() => {
          router.replace("/");
        }, 3000);

        return () => clearTimeout(timeoutId);
      } else if (excludedRoles && hasExcludedRole()) {
        const excludedText = Array.isArray(excludedRoles)
          ? excludedRoles.join(" and ")
          : excludedRoles;
        showError(
          `Access denied. ${excludedText} users cannot access this page.`
        );
        setHasShownError(true);

        const timeoutId = setTimeout(() => {
          router.replace("/seller/overview");
        }, 3000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    isLoggedIn,
    role,
    userHasAccess,
    hasShownError,
    router,
    showError,
    requiredRole,
    excludedRoles,
  ]);

  // Render children with blur effect if access is denied
  return userHasAccess ? (
    children
  ) : (
    <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center opacity-90 space-y-4">
        <p className="text-red-600 font-semibold mb-4">Access Denied</p>
        <p className="text-gray-700">
          {!isLoggedIn && requiredRole
            ? "Please log in to access this page"
            : excludedRoles && hasExcludedRole()
            ? `${
                Array.isArray(excludedRoles)
                  ? excludedRoles.join(" and ")
                  : excludedRoles
              } users cannot access this page. Your current role: ${
                role || "N/A"
              }`
            : requiredRole
            ? `This page requires ${
                Array.isArray(requiredRole)
                  ? requiredRole.join(" or ")
                  : requiredRole
              } role. Your current role: ${role || "N/A"}`
            : "You don't have permission to access this page"}
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            className="bg-kappes hover:bg-red-800 text-white"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          {!isLoggedIn && requiredRole ? (
            <Button
              className="bg-kappes hover:bg-red-800 text-white"
              onClick={() => router.replace("/auth/login")}
            >
              Login
            </Button>
          ) : excludedRoles && hasExcludedRole() ? (
            <Button
              className="bg-kappes hover:bg-red-800 text-white"
              onClick={() => router.replace("/seller/overview")}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              className="bg-kappes hover:bg-red-800 text-white"
              onClick={() => router.replace("/")}
            >
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Higher-order component for route protection
export const withAuth = (
  WrappedComponent,
  requiredRole = null,
  excludedRoles = null
) => {
  return function ProtectedRoute(props) {
    return (
      <AuthGuard requiredRole={requiredRole} excludedRoles={excludedRoles}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
};
