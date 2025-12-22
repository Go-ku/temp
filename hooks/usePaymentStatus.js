"use client";

import { useEffect, useState } from "react";

export default function usePaymentStatus(paymentId, interval = 4000) {
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      if (!paymentId) return;

      try {
        const res = await fetch(`/api/payments/status/${paymentId}`);
        const isJson = res.headers
          .get("content-type")
          ?.includes("application/json");

        if (!res.ok || !isJson) {
          // If the endpoint fails or returns no JSON, keep last status.
          console.warn("Status check returned non-JSON or error", res.status);
          return;
        }

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
