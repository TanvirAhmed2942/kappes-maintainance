"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const ConnectStripeForSellerModal = ({
  open,
  onOpenChange,
  onContinue,
  onNotNow,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Connect Stripe Account
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isLoading ? (
              "You will be redirected to Stripe shortly"
            ) : (
              <>
                You must connect Stripe Account Otherwise You can not add
                product and get payments and orders.
                <br />
                <br />
                Do you want to Continue or Connect it Later?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onNotNow}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Not Now
          </Button>
          <Button
            type="button"
            onClick={onContinue}
            disabled={isLoading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectStripeForSellerModal;
