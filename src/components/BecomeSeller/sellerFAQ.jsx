"use client";
import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetFAQsSellerQuery } from "../../redux/policies&faqApi/policies&faqApi";
import useToast from "../../hooks/useShowToast";
export default function SellerFAQ() {
  const [openFAQ, setOpenFAQ] = useState(1);
  const { data: faqs, isLoading, error } = useGetFAQsSellerQuery();
  const toast = useToast();

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      // Extract error message from different possible error structures
      let errorMessage = "Failed to fetch FAQs";

      if (error.data?.errorMessages && error.data.errorMessages.length > 0) {
        // Handle errorMessages array format: [{ path: "...", message: "API DOESN'T EXIST" }]
        errorMessage = error.data.errorMessages[0].message;
      } else if (error.data?.message) {
        // Handle direct message format
        errorMessage = error.data.message;
      } else if (error.message) {
        // Handle standard error message
        errorMessage = error.message;
      }

      toast.showError("Failed to fetch FAQs: " + errorMessage);
    }
  }, [error, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // console.log("faqs", faqs)
  const faqItems =
    faqs?.data?.faqs?.map((faq) => ({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
    })) || [];
  console.log("faqItems", faqItems);

  // Function to toggle FAQ open/close
  const toggleFAQ = (id) => {
    if (openFAQ === id) {
      setOpenFAQ(null); // Close if already open
    } else {
      setOpenFAQ(id); // Open the clicked FAQ
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl lg:text-4xl text-center mb-10 font-comfortaa font-extrabold md:leading-14">
        Seller Frequently Asked
        <br className="hidden sm:block " /> Questions (FAQs)
      </h2>

      <div className="space-y-4">
        {faqItems.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-md shadow-sm overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none transition-colors hover:bg-gray-50"
              onClick={() => toggleFAQ(faq.id)}
              aria-expanded={openFAQ === faq.id}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <span className="text-base md:text-lg font-bold font-comfortaa">
                {faq.question}
              </span>
              <motion.span
                className="flex-shrink-0 ml-2"
                animate={{ rotate: openFAQ === faq.id ? 0 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {openFAQ === faq.id ? (
                  <motion.div
                    className="bg-red-700 p-1 text-white rounded-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Minus size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-white border border-red-700 p-1 text-red-700 rounded-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={16} />
                  </motion.div>
                )}
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {openFAQ === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.3, ease: "easeOut" },
                      opacity: { duration: 0.25, delay: 0.05 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.3, ease: "easeIn" },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  id={`faq-answer-${faq.id}`}
                  className="overflow-hidden"
                >
                  <div className="p-4 md:p-5 pt-2 text-sm md:text-base text-gray-600 border-t border-gray-100 font-comfortaa">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
