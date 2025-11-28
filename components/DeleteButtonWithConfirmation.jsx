'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Trash2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

// -----------------------------------------------------------
// 1. Submit Button Component (to show loading state inside form)
// -----------------------------------------------------------

function DeleteSubmitButton({ itemName }) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      variant="destructive" 
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      )}
      {pending ? `Deleting ${itemName}...` : `I Understand, Delete`}
    </Button>
  );
}

// -----------------------------------------------------------
// 2. Main Confirmation Dialog Component
// -----------------------------------------------------------


export default function DeleteButtonWithConfirmation({
  action,
  itemName,
  disabled,
  disabledTooltip,
}) {
  const [open, setOpen] = useState(false);

  // We wrap the button in a Tooltip provider if it's disabled
  const DeleteTrigger = (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => setOpen(true)}
      disabled={disabled}
      className="flex items-center gap-1"
    >
      <Trash2 className="h-4 w-4" /> Delete
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {disabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {DeleteTrigger}
            </TooltipTrigger>
            <TooltipContent className="bg-red-600 text-white border-red-600">
              <p>{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>
          {DeleteTrigger}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you absolutely sure you want to delete **{itemName}**? This action cannot be undone. 
            All associated data (invoices, maintenance logs, etc.) will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <form action={action} onSubmit={() => setOpen(false)}>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row-reverse sm:justify-between">
            <DeleteSubmitButton itemName={itemName} />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}