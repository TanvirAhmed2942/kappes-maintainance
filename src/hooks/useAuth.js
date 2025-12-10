"use client";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsLoggedIn,
  selectRole,
  selectAccessToken,
  setRole,
  setAccessToken,
  setRefreshToken,
  login,
  logout,
} from "../../src/features/authSlice/authSlice";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get values from both Redux state and localStorage
  const reduxIsLoggedIn = useSelector(selectIsLoggedIn);
  const accessToken = useSelector(selectAccessToken);
  const reduxRole = useSelector(selectRole);

  // Decode JWT token to get userId and role
  const getTokenData = () => {
    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") return { userId: null, role: null };

      // Get token from Redux or localStorage
      const token = accessToken || localStorage.getItem("accessToken");

      if (!token) return { userId: null, role: reduxRole || null };

      // Decode the token
      const decoded = jwtDecode(token);

      // Return userId and role from token (fallback to Redux for role)
      return {
        userId:
          decoded._id || decoded.id || decoded.userId || decoded.sub || null,
        role: decoded.role || reduxRole || null,
      };
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return { userId: null, role: reduxRole || null };
    }
  };

  const { userId, role: tokenRole } = getTokenData();
  // Use role from token if available, otherwise use Redux role
  const role = tokenRole || reduxRole;

  // Determine if user is logged in
  const isLoggedIn = (() => {
    // Check if we're in browser environment
    if (typeof window === "undefined") return false;

    // Check Redux state first
    if (reduxIsLoggedIn) return true;

    // Check localStorage as a fallback
    const storedAccessToken = localStorage.getItem("accessToken");
    return !!storedAccessToken;
  })();

  const loginUser = (userData) => {
    dispatch(login(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  const updateTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) dispatch(setAccessToken(accessToken));
    if (refreshToken) dispatch(setRefreshToken(refreshToken));
  };

  const updateRole = (newRole) => {
    dispatch(setRole(newRole));
  };

  return {
    // State
    isLoggedIn,
    role,
    accessToken,
    userId,

    // Actions
    login: loginUser,
    logout: logoutUser,
    updateTokens,
    updateRole,

    // Checks
    isAdmin: role === "ADMIN",
    isSeller: role === "SELLER",
    isVendor: role === "VENDOR",
    isShopAdmin: role === "SHOP ADMIN",
    isUser: role === "USER",
  };
};

export default useAuth;
