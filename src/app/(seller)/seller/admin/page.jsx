"use client";

import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Eye, EyeOff, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  useGetShopAdminQuery,
  useAddShopAdminMutation,
  useDeleteShopAdminMutation,
} from "../../../../redux/sellerApi/sellerAdminApi/sellerAdminApi";
import useToast from "../../../../hooks/useShowToast";

export default function AdminList() {
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  // Get shop admins
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    refetch,
  } = useGetShopAdminQuery();

  const [addShopAdmin, { isLoading: isAdding }] = useAddShopAdminMutation();
  const [deleteShopAdmin, { isLoading: isDeleting }] =
    useDeleteShopAdminMutation();

  // Extract admins from the response structure: data.shops[0].admins
  const admins = adminsData?.data?.shops?.[0]?.admins || [];
  const isLoading = isAdding || isDeleting;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleAddAdmin = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.showError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.showError("Please enter a valid email address");
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      };

      // Add new admin
      const response = await addShopAdmin({
        data: payload,
      }).unwrap();

      if (response?.success) {
        toast.showSuccess("Admin added successfully!", {
          description: response.message || "Admin has been added.",
        });
        resetForm();
        setIsDialogOpen(false);
        refetch();
      } else {
        toast.showError(response?.message || "Failed to add admin");
      }
    } catch (error) {
      console.error("Admin operation error:", error);

      // Handle validation errors from API
      if (error?.data?.error && Array.isArray(error.data.error)) {
        let generalErrorMessage = "";
        error.data.error.forEach((err) => {
          if (!err.path || err.path === "") {
            generalErrorMessage = err.message;
          }
        });
        toast.showError(
          generalErrorMessage || error.data.message || "Operation failed"
        );
      } else {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Operation failed. Please try again.";
        toast.showError(errorMessage);
      }
    }
  };

  const handleDelete = async (adminId) => {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const response = await deleteShopAdmin(adminId).unwrap();

      if (response?.success) {
        toast.showSuccess("Admin deleted successfully!", {
          description: response.message || "Admin has been deleted.",
        });
        refetch();
      } else {
        toast.showError(response?.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Delete admin error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete admin. Please try again.";
      toast.showError(errorMessage);
    }
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="">
      <div className="">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Admin List</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 flex justify-end">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              + Add Admin
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-black">Name</TableHead>
                <TableHead className="font-semibold text-black">Role</TableHead>
                <TableHead className="font-semibold text-black">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Created Date
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAdmins ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading admins...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No admins found. Click "Add Admin" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => {
                  const createdDate =
                    admin.created_at || admin.createdAt
                      ? new Date(
                          admin.created_at || admin.createdAt
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A";

                  return (
                    <TableRow key={admin._id || admin.id}>
                      <TableCell>
                        {admin.full_name || admin.name || "N/A"}
                      </TableCell>
                      <TableCell>{admin.role || "Admin"}</TableCell>
                      <TableCell>{admin.email || "N/A"}</TableCell>
                      <TableCell>{createdDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(admin._id || admin.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Admin Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Add New Admin
              </DialogTitle>
              <DialogClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </DialogClose>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding..." : "Add Admin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
