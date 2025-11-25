"use client";

import { useEffect, useState } from "react";

export default function usePaymentStatus(paymentId, interval = 4000) {
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/payments/status/${paymentId}`);
        const data = await res.json();

        if (!data.success) return;

        if (isMounted) {
          setStatus(data.status);
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    }

    // Check immediately, then every X seconds
    checkStatus();
    const timer = setInterval(checkStatus, interval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [paymentId, interval]);

  return status;
}
