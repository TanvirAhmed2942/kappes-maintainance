"use client";

import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useSendContactMessageMutation } from "../../redux/contactApi/contactApi";
import useToast from "../../hooks/useShowToast";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    phone: "",
    message: "",
  });

  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();
  const { showSuccess, showError } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.senderName ||
      !formData.senderEmail ||
      !formData.phone ||
      !formData.message
    ) {
      showError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.senderEmail)) {
      showError("Please enter a valid email address");
      return;
    }

    try {
      await sendContactMessage({ data: formData }).unwrap();
      showSuccess("Message sent successfully!");

      // Reset form
      setFormData({
        senderName: "",
        senderEmail: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      showError(
        error?.data?.message || "Failed to send message. Please try again."
      );
    }
  };
  return (
    <div className="relative w-full min-h-screen py-10 sm:py-16 lg:py-20 px-4 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/worldmap.png"
        alt="World map background"
        height={5000}
        width={5000}
        className=" object-scale-down opacity-30 h-[100%] w-[100%] absolute inset-0"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-white text-center space-y-6 sm:space-y-8 mt-8 sm:mt-16 lg:mt-24">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-comfortaa uppercase">
          Get in Touch
        </h2>

        <div className="space-y-3 sm:space-y-2 text-sm sm:text-base">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Phone size={16} />
            <span className="break-all sm:break-normal">+1 647 2737 6756</span>
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Mail size={16} />
            <a
              href="mailto:demo@thecanuckmall.com"
              className="text-red-700 hover:underline break-all sm:break-normal"
            >
              demo@thecanuckmall.com
            </a>
          </div>
          <div className="flex justify-center items-center gap-2 text-center flex-wrap">
            <MapPin size={16} />
            <span className="break-words">
              123 Main Street, Anytown, ON K1A 0A1, Canada
            </span>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:grid md:grid-cols-2 gap-4 mt-8 sm:mt-10"
        >
          <Input
            name="senderName"
            value={formData.senderName}
            onChange={handleInputChange}
            placeholder="Your Name *"
            className="md:col-span-1 bg-white/90 text-black placeholder:text-gray-600 h-12"
            required
          />
          <Input
            name="senderEmail"
            type="email"
            value={formData.senderEmail}
            onChange={handleInputChange}
            placeholder="Your Email *"
            className="md:col-span-1 md:order-2 bg-white/90 text-black placeholder:text-gray-600 h-12"
            required
          />
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Your Phone *"
            className="md:col-span-1 md:order-3 bg-white/90 text-black placeholder:text-gray-600 h-12"
            required
          />
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Your Message *"
            className="md:row-span-3 md:col-span-1 md:order-1 bg-white/90 text-black placeholder:text-gray-600 h-44 resize-none overflow-y-auto"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white md:col-span-full md:order-4 mt-2 py-3 px-8 font-semibold h-12"
          >
            {isLoading ? "SENDING..." : "SEND MESSAGE"}
          </Button>
        </form>
      </div>
    </div>
  );
}
