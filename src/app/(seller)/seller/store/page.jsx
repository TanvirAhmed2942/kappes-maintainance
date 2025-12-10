"use client";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { Upload, X } from "lucide-react";

import { useState, useEffect } from "react";
import {
  useGetStoreInfoQuery,
  useUpdateStoreInfoMutation,
} from "../../../../redux/sellerApi/storeInfoApi/storeInfoApi";
import { getImageUrl } from "../../../../redux/baseUrl";
import useToast from "../../../../hooks/useShowToast";
import { BiEdit } from "react-icons/bi";
import { setStoreInfo } from "../../../../features/sellerStoreSlice/sellerStoreSlice";
import { useDispatch } from "react-redux";
export default function EditStoreInfoForm() {
  const {
    data: storeInfo,
    isLoading: isLoadingStoreInfo,
    refetch,
  } = useGetStoreInfoQuery();
  const [updateStoreInfo, { isLoading: isUpdating }] =
    useUpdateStoreInfoMutation();
  const toast = useToast();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    territory: "",
    shortDescription: "",
    province: "",
    logo: null,
    city: "",
    coverPhoto: null,
    detailAddress: "",
  });
  const [initialFormData, setInitialFormData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [bannerPreviews, setBannerPreviews] = useState([]);
  const [bannerFiles, setBannerFiles] = useState([]);

  useEffect(() => {
    if (storeInfo?.data?.name) {
      dispatch(
        setStoreInfo({
          storeName: storeInfo.data.name,
          storeLogo: storeInfo.data.logo,
        })
      );
    }
  }, [storeInfo, dispatch]);

  // Sync formData when storeInfo loads
  useEffect(() => {
    if (storeInfo?.data) {
      const storeData = storeInfo.data;

      // Extract address fields - handle both object and direct fields
      const addressObj = storeData.address || {};
      const territory = addressObj.territory || storeData.territory || "";
      const province = addressObj.province || storeData.province || "";
      const city = addressObj.city || storeData.city || "";
      const detailAddress =
        addressObj.detail_address ||
        addressObj.detailAddress ||
        storeData.detailAddress ||
        "";

      const newFormData = {
        storeName: storeData.name || "",
        territory: territory,
        shortDescription:
          storeData.description || storeData.shortDescription || "",
        province: province,
        logo: null, // File is not pre-filled
        city: city,
        coverPhoto: null, // File is not pre-filled
        detailAddress: detailAddress,
      };

      console.log("Store data:", storeData);
      console.log("Extracted address:", {
        territory,
        province,
        city,
        detailAddress,
      });
      setFormData(newFormData);
      setInitialFormData(newFormData);

      // Set image previews from API
      if (storeData.logo) {
        const logoPath = String(storeData.logo).trim();
        if (logoPath) {
          const logoUrl = logoPath.startsWith("http")
            ? logoPath
            : `${getImageUrl}${
                logoPath.startsWith("/") ? logoPath.slice(1) : logoPath
              }`;
          setLogoPreview(logoUrl);
        }
      } else {
        setLogoPreview(null);
      }

      if (storeData.coverPhoto || storeData.cover) {
        const coverImage = String(
          storeData.coverPhoto || storeData.cover
        ).trim();
        if (coverImage) {
          const coverUrl = coverImage.startsWith("http")
            ? coverImage
            : `${getImageUrl}${
                coverImage.startsWith("/") ? coverImage.slice(1) : coverImage
              }`;
          setCoverPreview(coverUrl);
        }
      } else {
        setCoverPreview(null);
      }

      // Set banner previews from API (banner can be array or single image)
      if (storeData.banner) {
        const banners = Array.isArray(storeData.banner)
          ? storeData.banner
          : [storeData.banner];
        const bannerUrls = banners
          .map((banner) => {
            if (!banner) return null;
            const bannerPath = String(banner).trim();
            if (!bannerPath) return null;
            return bannerPath.startsWith("http")
              ? bannerPath
              : `${getImageUrl}${
                  bannerPath.startsWith("/") ? bannerPath.slice(1) : bannerPath
                }`;
          })
          .filter(Boolean); // Remove null values
        setBannerPreviews(bannerUrls);
      } else {
        setBannerPreviews([]);
      }
      setBannerFiles([]); // Reset new files
    }
  }, [storeInfo]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files for banner
    if (field === "banner") {
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.showError("Please select only image files");
          return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.showError("Image size should be less than 5MB");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setBannerFiles((prev) => [...prev, ...validFiles]);

        // Create previews for new files
        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setBannerPreviews((prev) => [...prev, reader.result]);
          };
          reader.readAsDataURL(file);
        });
      }
    } else {
      // Handle single file for logo and coverPhoto
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.showError("Please select an image file");
          return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.showError("Image size should be less than 5MB");
          return;
        }

        handleInputChange(field, file);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (field === "logo") {
            setLogoPreview(reader.result);
          } else if (field === "coverPhoto") {
            setCoverPreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const handleRemoveBanner = (index) => {
    setBannerPreviews((prev) => prev.filter((_, i) => i !== index));
    setBannerFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    const requiredFields = [
      "storeName",
      "territory",
      "shortDescription",
      "province",
      "city",
      "detailAddress",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.showError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Logo and coverPhoto are optional if they already exist
    if (!formData.logo && !logoPreview) {
      toast.showError("Please upload a logo");
      return;
    }
    if (!formData.coverPhoto && !coverPreview) {
      toast.showError("Please upload a cover photo");
      return;
    }

    try {
      const dataToSubmit = new FormData();

      // Construct address object
      const address = {
        province: formData.province || "",
        city: formData.city || "",
        territory: formData.territory || "",
        country: "Canada", // Default to Canada
        detail_address: formData.detailAddress || "",
      };

      const jsonData = {
        name: formData.storeName,
        territory: formData.territory,
        description: formData.shortDescription,
        province: formData.province,
        city: formData.city,
        address: address,
        detailAddress: formData.detailAddress,
      };
      dataToSubmit.append("data", JSON.stringify(jsonData));

      // Add logo if a new file is selected
      if (formData.logo && typeof formData.logo === "object") {
        dataToSubmit.append("logo", formData.logo);
      }

      // Add coverPhoto if a new file is selected
      if (formData.coverPhoto && typeof formData.coverPhoto === "object") {
        dataToSubmit.append("coverPhoto", formData.coverPhoto);
      }

      // Add banner files (multiple images)
      // Only send new files - don't include existing banner paths in JSON
      // Backend will handle existing banners from the database
      if (bannerFiles.length > 0) {
        bannerFiles.forEach((file) => {
          dataToSubmit.append("banner", file);
        });
      }

      const response = await updateStoreInfo({ data: dataToSubmit }).unwrap();

      if (response?.success) {
        toast.showSuccess(
          response.message || "Store info updated successfully!"
        );
        setIsEditing(false);
        refetch(); // Refetch to get the latest data
      } else {
        toast.showError(response?.message || "Failed to update store info.");
      }
    } catch (error) {
      console.error("Update store info error:", error);
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
          "An error occurred while updating store info.";
        toast.showError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      storeName: initialFormData.storeName || "",
      territory: initialFormData.territory || "",
      shortDescription: initialFormData.shortDescription || "",
      province: initialFormData.province || "",
      logo: null,
      city: initialFormData.city || "",
      coverPhoto: null,
      detailAddress: initialFormData.detailAddress || "",
    });

    // Reset image previews to original
    if (storeInfo?.data?.logo) {
      const logoImage = storeInfo.data.logo;
      const logoUrl = logoImage.startsWith("http")
        ? logoImage
        : `${getImageUrl}${
            logoImage.startsWith("/") ? logoImage.slice(1) : logoImage
          }`;
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview(null);
    }

    if (storeInfo?.data?.coverPhoto || storeInfo?.data?.cover) {
      const coverImage = storeInfo.data.coverPhoto || storeInfo.data.cover;
      const coverUrl = coverImage.startsWith("http")
        ? coverImage
        : `${getImageUrl}${
            coverImage.startsWith("/") ? coverImage.slice(1) : coverImage
          }`;
      setCoverPreview(coverUrl);
    } else {
      setCoverPreview(null);
    }

    // Reset banner previews to original
    if (storeInfo?.data?.banner) {
      const banners = Array.isArray(storeInfo.data.banner)
        ? storeInfo.data.banner
        : [storeInfo.data.banner];
      const bannerUrls = banners
        .map((banner) => {
          if (!banner) return null;
          return banner.startsWith("http")
            ? banner
            : `${getImageUrl}${
                banner.startsWith("/") ? banner.slice(1) : banner
              }`;
        })
        .filter(Boolean); // Remove null values
      setBannerPreviews(bannerUrls);
    } else {
      setBannerPreviews([]);
    }
    setBannerFiles([]);

    setIsEditing(false);
  };

  if (isLoadingStoreInfo) {
    return <div className="text-center py-8">Loading store information...</div>;
  }

  if (!storeInfo?.data) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading store information
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <div className="flex items-center mb-8 justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
            Edit Store Info
          </h1>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="text-base p-3 cursor-pointer border bg-red-700 hover:bg-red-800 flex items-center justify-center rounded-lg"
            >
              <BiEdit className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">Edit Mode</span>
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-base">
                Store Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeName"
                placeholder="Enter your store name"
                value={formData.storeName}
                onChange={(e) => handleInputChange("storeName", e.target.value)}
                className="h-14"
                disabled={!isEditing}
              />
            </div>

            {/* Territory */}
            <div className="space-y-2 w-full">
              <Label htmlFor="territory" className="text-base">
                Territory<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.territory}
                onValueChange={(value) => handleInputChange("territory", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="h-14 w-full">
                  <SelectValue placeholder="Choose territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northwest-territories">
                    Northwest Territories
                  </SelectItem>
                  <SelectItem value="nunavut">Nunavut</SelectItem>
                  <SelectItem value="yukon">Yukon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="text-base">
                Short Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="shortDescription"
                placeholder="Describe about your company"
                value={formData.shortDescription}
                onChange={(e) =>
                  handleInputChange("shortDescription", e.target.value)
                }
                className="min-h-14 resize-none"
                disabled={!isEditing}
              />
            </div>

            {/* Province */}
            <div className="space-y-2 w-full">
              <Label htmlFor="province" className="text-base">
                Province<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.province}
                onValueChange={(value) => handleInputChange("province", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="h-14 w-full">
                  <SelectValue placeholder="Choose Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alberta">Alberta</SelectItem>
                  <SelectItem value="british-columbia">
                    British Columbia
                  </SelectItem>
                  <SelectItem value="manitoba">Manitoba</SelectItem>
                  <SelectItem value="new-brunswick">New Brunswick</SelectItem>
                  <SelectItem value="newfoundland-and-labrador">
                    Newfoundland and Labrador
                  </SelectItem>
                  <SelectItem value="nova-scotia">Nova Scotia</SelectItem>
                  <SelectItem value="ontario">Ontario</SelectItem>
                  <SelectItem value="prince-edward-island">
                    Prince Edward Island
                  </SelectItem>
                  <SelectItem value="quebec">Quebec</SelectItem>
                  <SelectItem value="saskatchewan">Saskatchewan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-base">
                Logo <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                {isEditing && (
                  <input
                    type="file"
                    id="logo"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("logo", e)}
                  />
                )}
                <label
                  htmlFor="logo"
                  className={`flex items-center justify-center h-14 px-4 border-2 border-dashed border-gray-300 rounded-md transition-colors ${
                    isEditing
                      ? "cursor-pointer hover:border-gray-400"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-500">
                    {logoPreview ? "Change image" : "Upload image"}
                  </span>
                </label>
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* City */}
            <div className="space-y-2 w-full">
              <Label htmlFor="city" className="text-base">
                City<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleInputChange("city", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="h-14 w-full">
                  <SelectValue placeholder="Choose City" />
                </SelectTrigger>
                <SelectContent>
                  {/* Alberta */}
                  <SelectItem value="calgary">Calgary, AB</SelectItem>
                  <SelectItem value="edmonton">Edmonton, AB</SelectItem>
                  <SelectItem value="red-deer">Red Deer, AB</SelectItem>
                  <SelectItem value="lethbridge">Lethbridge, AB</SelectItem>
                  {/* British Columbia */}
                  <SelectItem value="vancouver">Vancouver, BC</SelectItem>
                  <SelectItem value="victoria">Victoria, BC</SelectItem>
                  <SelectItem value="surrey">Surrey, BC</SelectItem>
                  <SelectItem value="burnaby">Burnaby, BC</SelectItem>
                  <SelectItem value="richmond">Richmond, BC</SelectItem>
                  {/* Manitoba */}
                  <SelectItem value="winnipeg">Winnipeg, MB</SelectItem>
                  <SelectItem value="brandon">Brandon, MB</SelectItem>
                  {/* New Brunswick */}
                  <SelectItem value="saint-john">Saint John, NB</SelectItem>
                  <SelectItem value="moncton">Moncton, NB</SelectItem>
                  <SelectItem value="fredericton">Fredericton, NB</SelectItem>
                  {/* Newfoundland and Labrador */}
                  <SelectItem value="st-johns">St. John's, NL</SelectItem>
                  <SelectItem value="mount-pearl">Mount Pearl, NL</SelectItem>
                  {/* Nova Scotia */}
                  <SelectItem value="halifax">Halifax, NS</SelectItem>
                  <SelectItem value="dartmouth">Dartmouth, NS</SelectItem>
                  {/* Ontario */}
                  <SelectItem value="toronto">Toronto, ON</SelectItem>
                  <SelectItem value="ottawa">Ottawa, ON</SelectItem>
                  <SelectItem value="mississauga">Mississauga, ON</SelectItem>
                  <SelectItem value="brampton">Brampton, ON</SelectItem>
                  <SelectItem value="hamilton">Hamilton, ON</SelectItem>
                  <SelectItem value="london">London, ON</SelectItem>
                  <SelectItem value="markham">Markham, ON</SelectItem>
                  <SelectItem value="vaughan">Vaughan, ON</SelectItem>
                  <SelectItem value="kitchener">Kitchener, ON</SelectItem>
                  <SelectItem value="windsor">Windsor, ON</SelectItem>
                  {/* Prince Edward Island */}
                  <SelectItem value="charlottetown">
                    Charlottetown, PE
                  </SelectItem>
                  {/* Quebec */}
                  <SelectItem value="montreal">Montreal, QC</SelectItem>
                  <SelectItem value="quebec-city">Quebec City, QC</SelectItem>
                  <SelectItem value="laval">Laval, QC</SelectItem>
                  <SelectItem value="gatineau">Gatineau, QC</SelectItem>
                  <SelectItem value="longueuil">Longueuil, QC</SelectItem>
                  <SelectItem value="sherbrooke">Sherbrooke, QC</SelectItem>
                  {/* Saskatchewan */}
                  <SelectItem value="saskatoon">Saskatoon, SK</SelectItem>
                  <SelectItem value="regina">Regina, SK</SelectItem>
                  {/* Northwest Territories */}
                  <SelectItem value="yellowknife">Yellowknife, NT</SelectItem>
                  {/* Nunavut */}
                  <SelectItem value="iqaluit">Iqaluit, NU</SelectItem>
                  {/* Yukon */}
                  <SelectItem value="whitehorse">Whitehorse, YT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cover Photo */}
            <div className="space-y-2">
              <Label htmlFor="coverPhoto" className="text-base">
                Cover Photo <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                {isEditing && (
                  <input
                    type="file"
                    id="coverPhoto"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("coverPhoto", e)}
                  />
                )}
                <label
                  htmlFor="coverPhoto"
                  className={`flex items-center justify-center h-14 px-4 border-2 border-dashed border-gray-300 rounded-md transition-colors ${
                    isEditing
                      ? "cursor-pointer hover:border-gray-400"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-500">
                    {coverPreview ? "Change image" : "Upload image"}
                  </span>
                </label>
                {coverPreview && (
                  <div className="mt-2">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-20 w-auto object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Detail Address */}
            <div className="space-y-2">
              <Label htmlFor="detailAddress" className="text-base">
                Detail Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="detailAddress"
                placeholder="Enter details address"
                value={formData.detailAddress}
                onChange={(e) =>
                  handleInputChange("detailAddress", e.target.value)
                }
                className="h-14"
                disabled={!isEditing}
              />
            </div>

            {/* Banner - Multiple Images */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="banner" className="text-base">
                Banner Images
              </Label>
              <div className="relative">
                {isEditing && (
                  <input
                    type="file"
                    id="banner"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload("banner", e)}
                  />
                )}
                <label
                  htmlFor="banner"
                  className={`flex items-center justify-center h-14 px-4 border-2 border-dashed border-gray-300 rounded-md transition-colors ${
                    isEditing
                      ? "cursor-pointer hover:border-gray-400"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-500">
                    {bannerPreviews.length > 0
                      ? "Add more banner images"
                      : "Upload banner images (multiple)"}
                  </span>
                </label>
                {bannerPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {bannerPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`Banner ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBanner(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-12 h-12 text-base border-red-500 text-red-500 hover:bg-red-50"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                className="px-12 h-12 text-base bg-red-600 hover:bg-red-700"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
