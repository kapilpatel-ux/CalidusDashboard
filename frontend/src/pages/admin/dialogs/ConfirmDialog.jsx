import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

export const ConfirmDialog = ({ confirmDialog, setConfirmDialog, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm?.();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog
      open={confirmDialog.open}
      onOpenChange={(open) => {
        if (isConfirming) return;
        setConfirmDialog({ ...confirmDialog, open });
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Confirm Action
          </DialogTitle>
          <DialogDescription className="pt-2">
            {confirmDialog.message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            disabled={isConfirming}
            data-testid="confirm-cancel-btn"
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            data-testid="confirm-action-btn"
          >
            {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
            {isConfirming ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
