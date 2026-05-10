"use client";
import { useState } from "react";

const buttonStyle = {
  border: "1px solid #cbd8ea",
  borderRadius: 6,
  padding: "9px 12px",
  background: "#ffffff",
  color: "#1d4ed8",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
};

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <button
      disabled={isLoggingOut}
      style={{
        ...buttonStyle,
        opacity: isLoggingOut ? 0.7 : 1,
        cursor: isLoggingOut ? "not-allowed" : "pointer",
      }}
      onClick={async () => {
        setIsLoggingOut(true);

        await fetch("/api/auth/logout", { method: "POST" });
        window.location.assign("/login");
      }}
    >
      {isLoggingOut ? "Logging out..." : "Log out"}
    </button>
  );
}
