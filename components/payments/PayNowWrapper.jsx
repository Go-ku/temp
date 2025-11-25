"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import PayNowModal from "./PayNowModal";

export default function PayNowWrapper({ invoice }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Pay Now
      </Button>

      <PayNowModal
        invoice={invoice}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
