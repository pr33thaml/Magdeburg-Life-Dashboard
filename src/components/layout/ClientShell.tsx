"use client";

import { useEffect } from "react";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { MobileNav } from "@/components/layout/MobileNav";

function useDevChunkRecovery() {
  useEffect(() => {
    const reloadOnStaleChunk = (message: string) => {
      if (
        message.includes("__webpack_modules__") ||
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk")
      ) {
        window.location.reload();
      }
    };

    const onError = (event: ErrorEvent) => {
      reloadOnStaleChunk(event.message ?? "");
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : "";
      reloadOnStaleChunk(message);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
}

export function ClientShell() {
  useDevChunkRecovery();
  return (
    <>
      <CustomCursor />
      <LanguageSwitch />
      <MobileNav />
    </>
  );
}
