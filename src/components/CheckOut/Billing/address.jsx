"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { IoHomeOutline } from "react-icons/io5";
import provideIcon from "../../../common/components/provideIcon";
import useUser from "../../../hooks/useUser";

function Address({ onDeliveryChange, onPaymentChange, onAddressChange }) {
  const { user, profileData, isLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Get user data from Redux or API (profileData takes priority if available)
  const userData = profileData?.data || user;

  // Extract address - handle both string and object formats
  const getAddressString = () => {
    if (!userData?.address) return "";
    if (typeof userData.address === "string") return userData.address;
    if (userData.address?.address) return userData.address.address;
    if (userData.address?.detail_address)
      return userData.address.detail_address;
    // If address is an object, try to build a string from its properties
    if (typeof userData.address === "object") {
      const parts = [
        userData.address.detail_address,
        userData.address.city,
        userData.address.province,
        userData.address.country,
      ].filter(Boolean);
      return parts.join(", ") || "";
    }
    return "";
  };

  const [addressData, setAddressData] = useState({
    name: userData?.full_name || "",
    phone: userData?.phone || "",
    address: getAddressString(),
  });

  const [formData, setFormData] = useState(addressData);

  // Update address data when user data loads
  useEffect(() => {
    if (userData) {
      // Extract address - handle both string and object formats
      let addressString = "";
      if (userData.address) {
        if (typeof userData.address === "string") {
          addressString = userData.address;
        } else if (userData.address?.address) {
          addressString = userData.address.address;
        } else if (userData.address?.detail_address) {
          addressString = userData.address.detail_address;
        } else if (typeof userData.address === "object") {
          const parts = [
            userData.address.detail_address,
            userData.address.city,
            userData.address.province,
            userData.address.country,
          ].filter(Boolean);
          addressString = parts.join(", ") || "";
        }
      }

      const newAddressData = {
        name: userData.full_name || "",
        phone: userData.phone || "",
        address: addressString,
      };
      setAddressData(newAddressData);
      setFormData(newAddressData);

      // Notify parent of address change
      if (onAddressChange) {
        onAddressChange(addressString);
      }
    }
  }, [userData, onAddressChange]);

  // Notify parent when delivery or payment changes
  useEffect(() => {
    if (onDeliveryChange && deliveryOption) {
      onDeliveryChange(deliveryOption);
    }
  }, [deliveryOption, onDeliveryChange]);

  useEffect(() => {
    if (onPaymentChange && paymentMethod) {
      // Map UI values to API values
      const paymentMap = {
        COD: "Cod",
        ONLINE: "Online",
        CARD: "Card",
      };
      onPaymentChange(paymentMap[paymentMethod] || paymentMethod);
    }
  }, [paymentMethod, onPaymentChange]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setAddressData(formData);
    setIsModalOpen(false);
    // Notify parent of address change
    if (onAddressChange && formData.address) {
      onAddressChange(formData.address);
    }
  };

  const handleCancel = () => {
    setFormData(addressData);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-5 h-full items-start justify-between  ">
      <Card className="w-full h-[45%]  border p-0">
        <CardHeader className="bg-kappes rounded-t-md">
          <CardTitle className="flex items-center justify-between text-white h-12 gap-4 py-2  mt-1.5">
            <span className="flex items-center gap-4 font-comfortaa">
              <IoHomeOutline size={20} className="-mt-1" />
              Shipping Address
            </span>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <span className="cursor-pointer">
                  {provideIcon({ name: "edit" })}
                </span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Shipping Address</DialogTitle>
                  <DialogDescription>
                    Make changes to your shipping address here. Click save when
                    you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="col-span-3 "
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSave}
                    className="bg-kappes hover:bg-red-700"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start justify-start gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-gray-500">Loading user information...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-start gap-2">
                {provideIcon({ name: "user" })}
                <p className={addressData.name ? "" : "text-gray-400"}>
                  {addressData.name || "Not provided"}
                </p>
              </div>
              <div className="flex items-center justify-start gap-2">
                {provideIcon({ name: "telephone" })}
                <p className={addressData.phone ? "" : "text-gray-400"}>
                  {addressData.phone || "Not provided"}
                </p>
              </div>
              <div className="flex items-center justify-start gap-2">
                {provideIcon({ name: "location" })}
                <p className={addressData.address ? "" : "text-gray-400"}>
                  {addressData.address || "Not provided"}
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>

      <Card className="w-full h-[45%] border">
        <CardContent className="w-full flex flex-col items-start justify-start gap-4">
          <div className="w-full flex flex-col space-y-1.5">
            <Label htmlFor="deliveryOption">Delivery Options</Label>
            <Select value={deliveryOption} onValueChange={setDeliveryOption}>
              <SelectTrigger id="deliveryOption" className="w-full">
                <SelectValue placeholder="Choose Delivery Option" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="Overnight">Overnight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex flex-col space-y-1.5">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod" className="w-full">
                <SelectValue placeholder="Choose Payment Method" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="COD">COD (cash on delivery)</SelectItem>
                <SelectItem value="ONLINE">Online (stripe)</SelectItem>
                <SelectItem value="CARD">Card (credit/debit card)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Address;
