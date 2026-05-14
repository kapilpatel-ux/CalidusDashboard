import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export const ConfirmDialog = ({ confirmDialog, setConfirmDialog, onConfirm }) => {
  return (
    <Dialog
      open={confirmDialog.open}
      onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
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
            data-testid="confirm-cancel-btn"
          >
            Cancel
          </Button>

          <Button onClick={onConfirm} data-testid="confirm-action-btn">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};