"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { useGetCategoryQuery } from "../../redux/productApi/productApi";
import { useCreateSellerMutation } from "../../redux/sellerApi/sellerApi";
import {
  useVerifyEmailMutation,
  useResendOtpMutation,
} from "../../redux/authApi/authApi";
import useToast from "../../hooks/useShowToast";
import { useRouter } from "next/navigation";

export default function SellerRegistrationForm() {
  const router = useRouter();
  const toast = useToast();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoryQuery();
  const [createSeller, { isLoading: isSubmitting }] = useCreateSellerMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Start countdown timer
  const startCountdown = () => {
    setCanResend(false);
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle back to registration
  const handleBackToRegistration = () => {
    setShowOtpVerification(false);
    setOtp("");
    setErrors({});
  };

  // Extract categories from API response
  const categories =
    categoriesData?.success && categoriesData?.data?.categorys
      ? categoriesData.data.categorys
      : [];

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }
    if (!selectedCategory) {
      newErrors.storeCategory = "Store category is required";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.showError("Please fix the errors in the form");
      return;
    }

    try {
      // Format phone number with +1 prefix
      const formattedPhone = phone.startsWith("+1")
        ? phone
        : `+1${phone.replace(/\D/g, "")}`;

      // Prepare data according to API format
      const sellerData = {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
        phone: formattedPhone,
        store_name: storeName.trim(),
        store_category: selectedCategory,
      };

      const response = await createSeller({ data: sellerData }).unwrap();

      if (response?.success) {
        toast.showSuccess(
          response?.message ||
            "Seller account created successfully! Please verify your email."
        );
        // Show OTP verification form
        setShowOtpVerification(true);
        startCountdown();
      } else {
        toast.showError(response?.message || "Failed to create seller account");
      }
    } catch (error) {
      console.error("Seller registration error:", error);

      // Handle validation errors from API
      if (error?.data?.error && Array.isArray(error.data.error)) {
        const validationErrors = {};
        let generalErrorMessage = "";

        error.data.error.forEach((err) => {
          // If path is empty, it's a general error message
          if (!err.path || err.path === "") {
            generalErrorMessage = err.message;
          } else {
            // Map API error paths to form field names
            const fieldMap = {
              password: "password",
              full_name: "fullName",
              email: "email",
              phone: "phone",
              store_name: "storeName",
              store_category: "storeCategory",
              confirmPassword: "confirmPassword",
            };

            const fieldName = fieldMap[err.path] || err.path;
            validationErrors[fieldName] = err.message;
          }
        });

        // Set validation errors in form
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
        }

        // Show error message - prioritize specific error message, then general message, then API message
        const errorMessage =
          generalErrorMessage ||
          error.data.message ||
          "Please fix the validation errors";
        toast.showError(errorMessage);
      } else {
        // Handle other types of errors
        let errorMessage = "Failed to create seller account";
        if (error?.data?.errorMessages && error.data.errorMessages.length > 0) {
          errorMessage = error.data.errorMessages[0].message;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        toast.showError(errorMessage);
      }
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async () => {
    if (!otp || otp.length < 4) {
      toast.showError("Please enter complete OTP");
      return;
    }

    try {
      const response = await verifyEmail({
        oneTimeCode: Number(otp),
        email: email.trim(),
      }).unwrap();

      if (response?.success) {
        toast.showSuccess(response?.message || "Email verified successfully!");
        // Redirect to seller login
        router.push("./become-seller-login");
      } else {
        toast.showError(response?.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        error?.data?.error?.[0]?.message ||
        "Invalid OTP. Please try again.";
      toast.showError(errorMessage);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      const response = await resendOtp({ email: email.trim() }).unwrap();

      if (response?.success) {
        toast.showSuccess(response?.message || "OTP sent successfully!");
        startCountdown();
      } else {
        toast.showError(response?.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Failed to resend OTP. Please try again.";
      toast.showError(errorMessage);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // OTP Verification Component
  if (showOtpVerification) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToRegistration}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-red-700">
              Verify Your Email
            </CardTitle>
          </div>
          <p className="text-center text-gray-600 text-sm px-6">
            Enter the OTP sent to your email to complete your seller
            registration.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <p className="text-center text-gray-600 text-sm">
              A code has been sent to
              <span className="block mt-1 text-xs text-gray-500 font-medium">
                {email}
              </span>
            </p>

            {!canResend ? (
              <p className="text-center text-red-700 text-sm font-bold">
                Resend in {formatTime(countdown)}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-center text-red-700 text-sm font-bold underline hover:text-red-800 w-full bg-transparent border-none cursor-pointer disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            )}

            <Button
              onClick={handleOtpVerification}
              className="w-full bg-red-700 hover:bg-red-800 text-white"
              size="lg"
              disabled={isVerifying || otp.length < 4}
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md ">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-red-700">
          Create Your Account
        </CardTitle>
        <p className="text-center text-gray-600 text-sm px-6">
          Join us to explore top Canadian-made products, exclusive deals, and
          great rewards
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name<span className="text-red-600">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email<span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeName">
              Store Name<span className="text-red-600">*</span>
            </Label>
            <Input
              id="storeName"
              type="text"
              placeholder="Enter your store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
            {errors.storeName && (
              <p className="text-sm text-red-500">{errors.storeName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeCategory">
              Store Category<span className="text-red-600">*</span>
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={categoriesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categoriesError ? (
                  <SelectItem value="error" disabled>
                    Error loading categories
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name || "N/A"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.storeCategory && (
              <p className="text-sm text-red-500">{errors.storeCategory}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone<span className="text-red-600">*</span>
            </Label>
            <div className="flex">
              <div className="inline-flex items-center justify-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <img
                    src="/api/placeholder/24/24"
                    alt="CA flag"
                    className="w-4 h-4 rounded-sm"
                  />
                  +1
                </span>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="rounded-l-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password<span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={togglePasswordVisibility}
              >
                {!showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password<span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={toggleConfirmPasswordVisibility}
              >
                {!showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-500">or</span>
        </div>

        <Button variant="outline" className="w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
          >
            <g clipPath="url(#clip0_553_4538)">
              <path
                d="M23.5938 9.91355L13.8044 9.91308C13.3721 9.91308 13.0217 10.2634 13.0217 10.6957V13.823C13.0217 14.2552 13.3721 14.6056 13.8044 14.6056H19.3171C18.7135 16.1722 17.5868 17.4842 16.1493 18.3178L18.5 22.387C22.2707 20.2062 24.5 16.3799 24.5 12.0965C24.5 11.4866 24.455 11.0506 24.3651 10.5597C24.2968 10.1867 23.9729 9.91355 23.5938 9.91355Z"
                fill="#167EE6"
              />
              <path
                d="M12.5 19.3043C9.80218 19.3043 7.44699 17.8303 6.18207 15.6491L2.11304 17.9944C4.18374 21.5833 8.06283 24 12.5 24C14.6768 24 16.7307 23.4139 18.5 22.3926V22.387L16.1494 18.3178C15.0742 18.9414 13.8299 19.3043 12.5 19.3043Z"
                fill="#12B347"
              />
              <path
                d="M18.5 22.3926V22.387L16.1494 18.3178C15.0741 18.9413 13.83 19.3043 12.5 19.3043V24C14.6767 24 16.7308 23.4139 18.5 22.3926Z"
                fill="#0F993E"
              />
              <path
                d="M5.19566 12C5.19566 10.6702 5.55856 9.42609 6.18205 8.35092L2.11302 6.00558C1.08603 7.76934 0.5 9.81769 0.5 12C0.5 14.1823 1.08603 16.2307 2.11302 17.9944L6.18205 15.6491C5.55856 14.5739 5.19566 13.3298 5.19566 12Z"
                fill="#FFD500"
              />
              <path
                d="M12.5 4.69566C14.2593 4.69566 15.8753 5.32078 17.1375 6.36061C17.4488 6.61711 17.9014 6.59859 18.1867 6.31336L20.4024 4.09758C20.7261 3.77395 20.703 3.24422 20.3573 2.94431C18.2425 1.10967 15.491 0 12.5 0C8.06283 0 4.18374 2.41673 2.11304 6.00558L6.18207 8.35092C7.44699 6.16969 9.80218 4.69566 12.5 4.69566Z"
                fill="#FF4B26"
              />
              <path
                d="M17.1374 6.36061C17.4488 6.61711 17.9015 6.59859 18.1866 6.31336L20.4024 4.09758C20.726 3.77395 20.7029 3.24422 20.3573 2.94431C18.2425 1.10963 15.491 0 12.5 0V4.69566C14.2592 4.69566 15.8752 5.32078 17.1374 6.36061Z"
                fill="#D93F21"
              />
            </g>
            <defs>
              <clipPath id="clip0_553_4538">
                <rect
                  width="24"
                  height="24"
                  fill="white"
                  transform="translate(0.5)"
                />
              </clipPath>
            </defs>
          </svg>
          Continue with Google
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="./become-seller-login"
            className="text-red-700 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
