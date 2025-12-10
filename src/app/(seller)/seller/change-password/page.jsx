"use client";

import { Button } from '../../../../components/ui/button'; 
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useChangePasswordMutation } from '../../../../redux/authApi/authApi';
import useToast from '../../../../hooks/useShowToast';
import ReLogin from './reLogin';

export default function ChangePassword() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const toast = useToast();
  const [isReLoginModalOpen, setIsReLoginModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const validateField = (name, value) => {
    let error = '';

    if (!value) {
      error = 'This field is required';
    } else if (name === 'newPassword' && value.length < 8) {
      error = 'Password must be at least 8 characters';
    } else if (name === 'confirmPassword' && value !== formData.newPassword) {
      error = 'Passwords do not match';
    }

    return error;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }

    if (name === 'newPassword' && touched.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: formData.confirmPassword !== value ? 'Passwords do not match' : ''
      }));
    }
  };

  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    setTouched({
      oldPassword: true,
      newPassword: true,
      confirmPassword: true
    });

    const newErrors = {
      oldPassword: validateField('oldPassword', formData.oldPassword),
      newPassword: validateField('newPassword', formData.newPassword),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword)
    };

    setErrors(newErrors);

    // Check if there are any validation errors
    if (newErrors.oldPassword || newErrors.newPassword || newErrors.confirmPassword) {
      toast.showError("Please fix the errors in the form");
      return;
    }

    // Check if new password and confirm password match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.showError("Passwords do not match");
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      }).unwrap();

      if (response?.success) {
        // Reset form after successful update
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTouched({
          oldPassword: false,
          newPassword: false,
          confirmPassword: false
        });
        
        // Open re-login modal
        setIsReLoginModalOpen(true);
      } else {
        toast.showError(response?.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      
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
              currentPassword: "oldPassword",
              newPassword: "newPassword",
              confirmPassword: "confirmPassword",
            };

            const fieldName = fieldMap[err.path] || err.path;
            validationErrors[fieldName] = err.message;
          }
        });

        // Set validation errors in form
        if (Object.keys(validationErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...validationErrors }));
        }

        // Show error message
        const errorMessage =
          generalErrorMessage ||
          error.data.message ||
          "Failed to update password. Please check your input.";
        toast.showError(errorMessage);
      } else {
        // Handle other types of errors
        let errorMessage = "Failed to update password. Please try again.";
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

  const handleCancel = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTouched({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold mb-8">Change Password</h1>

        <Card className="shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old Password */}
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-lg">
                  Old Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showPasswords.old ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={(e) => handleChange('oldPassword', e.target.value)}
                    onBlur={(e) => handleBlur('oldPassword', e.target.value)}
                    placeholder="***********"
                    className={`pr-12 h-12 text-base ${errors.oldPassword && touched.oldPassword ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-red-700'
                      }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePasswordVisibility('old')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  >
                    {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {errors.oldPassword && touched.oldPassword && (
                  <p className="text-red-500 text-sm">{errors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-lg">
                  New Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    onBlur={(e) => handleBlur('newPassword', e.target.value)}
                    placeholder="***********"
                    className={`pr-12 h-12 text-base ${errors.newPassword && touched.newPassword ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-red-700'
                      }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="text-red-500 text-sm">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-lg">
                  Confirm Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                    placeholder="***********"
                    className={`pr-12 h-12 text-base ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-red-700'
                      }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-12 h-12 text-lg border-2 border-red-700 text-red-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-12 h-12 text-lg bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Re-login Modal */}
      <ReLogin 
        open={isReLoginModalOpen} 
        onOpenChange={setIsReLoginModalOpen} 
      />
    </div>
  );
}