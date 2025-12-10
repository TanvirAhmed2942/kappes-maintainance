"use client";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import {
  useResendOtpMutation,
  useVerifyEmailMutation,
} from "../../redux/authApi/authApi";
import {
  useVerifyBusinessEmailMutation,
  useResendBusinessOtpMutation,
} from "../../redux/servicesApi/servicsApi";
import useToast from "../../hooks/useShowToast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useUser from "../../hooks/useUser";

export default function OTPverification() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const email = searchParams.get("email");
  const forgot = searchParams.get("forgot");
  const [countdown, setCountdown] = useState(30);
  const [timerKey, setTimerKey] = useState(0); // Key to restart timer
  const router = useRouter();

  // Check if we're on business verification route
  const isBusinessVerification = pathname?.includes(
    "/business-listing/verification"
  );

  // Get user email from useUser hook (fallback for regular verification if needed)
  const { userEmail: userEmailFromHook, profileData } = useUser();

  // Determine which email to use
  // For business verification: prioritize email from URL params (passed from business listing form)
  // For regular verification: use email from URL params (standard flow)
  const verificationEmail = isBusinessVerification
    ? email || profileData?.data?.email || userEmailFromHook
    : email || userEmailFromHook;

  useEffect(() => {
    if (email || forgot) {
      console.log("Query params:", { email, forgot });
    }
    if (isBusinessVerification) {
      console.log("Business verification - using email:", verificationEmail);
    }
  }, [email, forgot, isBusinessVerification, verificationEmail]);

  // User verification mutations (for regular user verification)
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResendOtpLoading }] = useResendOtpMutation();

  // Business verification mutations (for business verification only)
  const [verifyBusinessEmail, { isLoading: isVerifyingBusiness }] =
    useVerifyBusinessEmailMutation();
  const [resendBusinessOtp, { isLoading: isResendBusinessOtpLoading }] =
    useResendBusinessOtpMutation();
  const { showSuccess, showError } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  // Watch OTP value to enable/disable submit button
  const otpValue = watch("otp");

  const intervalRef = useRef(null);

  // Countdown timer for resend - only restarts when timerKey changes
  useEffect(() => {
    // Clear any existing interval before setting up a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset countdown to initial value when timer restarts
    setCountdown(30);

    // Set up the interval
    intervalRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        // Stop the timer when countdown reaches 0
        if (prevCountdown <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerKey]); // Only restart when timerKey changes

  const onSubmit = async (data) => {
    console.log("OTP Value:", data.otp);

    if (!verificationEmail) {
      showError("Email is required for verification");
      return;
    }

    try {
      let response;

      if (isBusinessVerification) {
        // Use business verification API
        response = await verifyBusinessEmail({
          email: verificationEmail,
          oneTimeCode: Number(data.otp),
        }).unwrap();
      } else {
        // Use regular email verification API (user verification)
        response = await verifyEmail({
          oneTimeCode: Number(data.otp),
          email: verificationEmail,
        });
      }

      console.log(response);

      if (response?.success === true || response?.data?.success === true) {
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Verification successful";
        showSuccess(successMessage);

        // Save verifyToken from the correct path in response (only for regular verification)
        if (!isBusinessVerification) {
          const verifyToken =
            response?.data?.data?.verifyToken || response?.data?.verifyToken;
          if (verifyToken) {
            localStorage.setItem("verifyToken", verifyToken);
            console.log("Verify token saved:", verifyToken);
          }
        }

        if (isBusinessVerification) {
          // Stay on the same page or navigate as needed
          // The VerificationSuccess component will handle the UI
        } else if (forgot === "true") {
          router.push("/auth/reset-password");
        } else {
          router.push("/auth/login");
        }
      } else {
        const errorMessage =
          response?.message || response?.data?.message || "Verification failed";
        showError(errorMessage);
      }
    } catch (error) {
      console.log("Verification error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        error?.data?.error?.[0]?.message ||
        "Invalid OTP. Please try again.";
      showError(errorMessage);
    }
  };

  const handleResend = async () => {
    console.log("Resend OTP requested");

    if (!verificationEmail) {
      showError("Email is required to resend OTP");
      return;
    }

    try {
      let response;
      if (isBusinessVerification) {
        // Use business resend OTP API
        response = await resendBusinessOtp({ email: verificationEmail });
      } else {
        // Use regular user resend OTP API
        response = await resendOtp({ email: verificationEmail });
      }

      console.log(response);
      if (response.data?.success === true) {
        router.push("/trades-&-services/all-services");
        showSuccess(response.data?.message);
        // Restart timer by incrementing timerKey
        setTimerKey((prev) => prev + 1);
      } else {
        const errorMessage = response.data?.message || "Failed to resend OTP";
        showError(errorMessage);
      }
    } catch (error) {
      console.log("Resend OTP error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Failed to resend OTP. Please try again.";
      showError(errorMessage);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-red-700">
          Verify OTP
        </CardTitle>
        <p className="text-center text-gray-600 text-sm px-6">
          Enter your OTP which has been sent to your email and completely verify
          your account.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-center mx-auto">
            <Controller
              name="otp"
              control={control}
              rules={{
                required: "OTP is required",
                minLength: {
                  value: 4,
                  message: "Please enter complete OTP",
                },
              }}
              render={({ field }) => (
                <InputOTP
                  maxLength={4}
                  value={field.value}
                  onChange={field.onChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </div>

          {errors.otp && (
            <p className="text-center text-red-500 text-sm">
              {errors.otp.message}
            </p>
          )}

          <p className="text-center text-gray-600 text-sm px-6">
            A code has been sent to your email
            {verificationEmail && (
              <span className="block mt-1 text-xs text-gray-500">
                ({verificationEmail})
              </span>
            )}
          </p>

          {countdown > 0 ? (
            <p className="text-center text-red-700 text-sm font-bold px-6">
              Resend in {formatTime(countdown)}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendOtpLoading || isResendBusinessOtpLoading}
              className="text-center text-red-700 text-sm font-bold px-6 underline hover:text-red-800 w-full bg-transparent border-none cursor-pointer disabled:opacity-50"
            >
              {isResendOtpLoading || isResendBusinessOtpLoading
                ? "Sending..."
                : "Resend OTP"}
            </button>
          )}

          <Button
            onClick={handleSubmit(onSubmit)}
            className="w-full bg-red-700 hover:bg-red-800 text-white disabled:opacity-50"
            size="lg"
            disabled={
              isSubmitting || isVerifyingBusiness || otpValue?.length < 4
            }
          >
            {isSubmitting || isVerifyingBusiness ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
