"use client";

import { useEffect } from "react";
import { Settings } from "@/types";

export function useNotifications(settings: Settings["notifications"]) {
  useEffect(() => {
    if (!settings.enabled || typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
  }, [settings.enabled]);

  const sendTestReminder = () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("Habit check-in", { body: "A tiny win is waiting for you." });
    } else {
      Notification.requestPermission();
    }
  };

  return { sendTestReminder };
}
