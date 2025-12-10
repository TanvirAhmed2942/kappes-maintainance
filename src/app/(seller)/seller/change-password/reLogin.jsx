"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";

const ReLogin = ({ open, onOpenChange }) => {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/auth/become-seller-login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Password Changed Successfully</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Your password has been changed successfully. You must re-login to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center sm:justify-center pt-4">
          <Button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white px-8"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReLogin;
