"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Upload, Clock } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { useRouter } from "next/navigation";
import { useAddBusinessMutation } from "../../redux/servicesApi/servicsApi";
import useToast from "../../hooks/useShowToast";

// Business type options
const businessTypes = ["Retail", "Wholesale"];

// Province options
const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
];

// Territories
const territories = ["Northwest Territories", "Nunavut", "Yukon"];

// City options (simplified)
const cities = [
  "Toronto",
  "Montreal",
  "Vancouver",
  "Calgary",
  "Edmonton",
  "Ottawa",
  "Quebec City",
  "Winnipeg",
  "Halifax",
  "Victoria",
];

// Days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function BusinessListingForm() {
  const router = useRouter();
  const toast = useToast();
  const [addBusiness, { isLoading }] = useAddBusinessMutation();
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFiles, setBannerFiles] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  // Business hours state - array of objects for each day
  const [businessHours, setBusinessHours] = useState(
    daysOfWeek.map((day) => ({
      day,
      isOpen: true,
      startTime: "09:00",
      endTime: "17:00",
    }))
  );

  const form = useForm({
    defaultValues: {
      businessName: "",
      businessType: "",
      businessEmail: "",
      phone: "",
      shortDescription: "",
      service: "",
      province: "",
      territory: "",
      city: "",
      detailAddress: "",
      country: "Canada",
      website: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Create FormData object
      const formData = new FormData();

      // Prepare the business data object matching API structure
      const businessData = {
        name: data.businessName,
        type: data.businessType === "Retail" ? "RETAIL" : "WHOLESALE",

        email: data.businessEmail,
        phone: data.phone,
        description: data.shortDescription,
        address: {
          province: data.province || "",
          city: data.city || "",
          territory: data.territory || "",
          country: data.country || "Canada",
          detail_address: data.detailAddress || "",
        },
        service: data.service || "",
        website: data.website || "",
        working_hours: businessHours
          .filter((hour) => hour.isOpen)
          .map((hour) => ({
            day: hour.day,
            start: hour.startTime,
            end: hour.endTime,
          })),
      };

      // Add the data as JSON string under 'data' key
      formData.append("data", JSON.stringify(businessData));

      // Add files if they exist
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (bannerFiles.length > 0) {
        bannerFiles.forEach((file, index) => {
          formData.append("banner", file);
        });
      }
      if (coverFile) {
        formData.append("coverPhoto", coverFile);
      }

      // Log FormData for debugging
      console.log("Business FormData:");
      for (let [key, value] of formData.entries()) {
        if (key === "data") {
          console.log(key, JSON.parse(value));
        } else {
          console.log(key, value instanceof File ? value.name : value);
        }
      }

      const response = await addBusiness({ data: formData }).unwrap();
      console.log("Success:", response);

      if (response?.success) {
        toast.showSuccess(
          response.message || "Business listing created successfully!"
        );
        // Navigate to verification page after successful submission
        router.push(
          `/business-listing/verification?email=${response?.data?.email}`
        );
      } else {
        toast.showError(
          response?.message || "Failed to create business listing"
        );
      }
    } catch (error) {
      console.error("Error submitting business:", error);
      // Extract error message
      let errorMessage = "Failed to create business listing";
      if (error?.data?.errorMessages && error.data.errorMessages.length > 0) {
        errorMessage = error.data.errorMessages[0].message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.showError(errorMessage);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setBannerFiles(filesArray);
    }
  };

  const removeBannerFile = (indexToRemove) => {
    setBannerFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  // Business hours handlers
  const handleDayToggle = (dayIndex) => {
    setBusinessHours((prev) =>
      prev.map((hour, index) =>
        index === dayIndex ? { ...hour, isOpen: !hour.isOpen } : hour
      )
    );
  };

  const handleTimeChange = (dayIndex, timeType, value) => {
    setBusinessHours((prev) =>
      prev.map((hour, index) =>
        index === dayIndex ? { ...hour, [timeType]: value } : hour
      )
    );
  };

  const getHoursDisplayText = () => {
    const openDays = businessHours.filter((hour) => hour.isOpen);
    if (openDays.length === 0) return "Closed all days";
    if (openDays.length === 7) return "Open all days";
    return `Open ${openDays.length} days`;
  };

  return (
    <div className="flex flex-col items-center w-full p-4 ">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-red-700">
            Add Your Business Listing
          </h1>
          <p className="text-gray-600">
            Join Our Directory and Connect with Thousands of Customers
          </p>
        </div>

        <Card className="w-full bg-[#f9f5f4] border-none">
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Add Business Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="businessName"
                      rules={{ required: "Business name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your Business name"
                              {...field}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      rules={{ required: "Business type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select business category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessEmail"
                      rules={{
                        required: "Business email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your business email address"
                              {...field}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      rules={{
                        required: "Phone number is required",
                        minLength: {
                          value: 10,
                          message: "Phone number must be at least 10 digits",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone*</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-gray-100 flex items-center px-3 border border-r-0 rounded-l">
                                <span>🇨🇦</span>
                              </div>
                              <Input
                                className="rounded-l-none bg-white"
                                placeholder="Enter your business phone number"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service"
                      rules={{ required: "Service is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your service name"
                              {...field}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="logo"
                      render={() => (
                        <FormItem>
                          <FormLabel>Business logo*</FormLabel>
                          <FormControl>
                            <div
                              className="border rounded flex items-center justify-center p-2 h-10 bg-white cursor-pointer"
                              onClick={() =>
                                document.getElementById("logo-upload").click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              <span className="text-sm">Upload logo</span>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden bg-white"
                                onChange={handleLogoChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {logoFile && (
                            <p className="text-xs text-gray-500 mt-1">
                              {logoFile.name}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="banner"
                      render={() => (
                        <FormItem>
                          <FormLabel>Banner Images*</FormLabel>
                          <FormControl>
                            <div
                              className="border rounded flex items-center justify-center p-2 h-10 bg-white cursor-pointer"
                              onClick={() =>
                                document.getElementById("banner-upload").click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                Upload banner images
                              </span>
                              <input
                                id="banner-upload"
                                type="file"
                                accept="image/*"
                                multiple={true}
                                className="hidden bg-white"
                                onChange={handleBannerChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {bannerFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-600 font-medium">
                                Selected files ({bannerFiles.length}):
                              </p>
                              {bannerFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
                                >
                                  <span className="text-gray-700 truncate">
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeBannerFile(index)}
                                    className="text-red-500 hover:text-red-700 ml-2 font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="coverPhoto"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cover Photo*</FormLabel>
                          <FormControl>
                            <div
                              className="border rounded flex items-center justify-center p-2 h-10 bg-white cursor-pointer"
                              onClick={() =>
                                document.getElementById("cover-upload").click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                Upload cover photo
                              </span>
                              <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {coverFile && (
                            <p className="text-xs text-gray-500 mt-1">
                              {coverFile.name}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="shortDescription"
                      rules={{
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Description must be at least 10 characters",
                        },
                        maxLength: {
                          value: 500,
                          message: "Description must not exceed 500 characters",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description*</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your business in a few sentences"
                              {...field}
                              className="resize-none bg-white"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Add Business Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="province"
                      rules={{ required: "Province is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Please choose your Province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="territory"
                      rules={{ required: "Territory is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Territory*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Please choose your territory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {territories.map((territory) => (
                                <SelectItem key={territory} value={territory}>
                                  {territory}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Please choose your city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="detailAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detail Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your detail address"
                              {...field}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Add Working Hours & Website
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Business Hours Modal Trigger */}
                    <FormItem>
                      <FormLabel>Working Hours*</FormLabel>
                      <Dialog
                        open={isHoursModalOpen}
                        onOpenChange={setIsHoursModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start bg-white h-10"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {getHoursDisplayText()}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Set Business Hours</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            {businessHours.map((dayHour, index) => (
                              <div key={dayHour.day} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">
                                    {dayHour.day}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={dayHour.isOpen}
                                      onChange={() => handleDayToggle(index)}
                                      className="rounded"
                                    />
                                    <span className="text-xs text-gray-500">
                                      {dayHour.isOpen ? "Open" : "Closed"}
                                    </span>
                                  </div>
                                </div>

                                {dayHour.isOpen && (
                                  <div className="flex items-center space-x-2 ml-4">
                                    <div className="flex-1">
                                      <label className="text-xs text-gray-500 block mb-1">
                                        Start Time
                                      </label>
                                      <input
                                        type="time"
                                        value={dayHour.startTime}
                                        onChange={(e) =>
                                          handleTimeChange(
                                            index,
                                            "startTime",
                                            e.target.value
                                          )
                                        }
                                        className="w-full p-1 border rounded text-sm"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-xs text-gray-500 block mb-1">
                                        End Time
                                      </label>
                                      <input
                                        type="time"
                                        value={dayHour.endTime}
                                        onChange={(e) =>
                                          handleTimeChange(
                                            index,
                                            "endTime",
                                            e.target.value
                                          )
                                        }
                                        className="w-full p-1 border rounded text-sm"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}

                            <div className="flex justify-end pt-4">
                              <Button
                                type="button"
                                onClick={() => setIsHoursModalOpen(false)}
                                className="bg-red-700 hover:bg-red-800 text-white"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your website URL"
                              {...field}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-700 hover:bg-red-800 text-white px-8 disabled:opacity-50"
                  >
                    {isLoading ? "Submitting..." : "Continue"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
