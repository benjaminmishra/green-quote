"use client";
import { useState } from "react";
import { QuoteForm } from "./QuoteForm";
import { QuotesTable } from "./QuotesTable";

export function QuotesDashboard({
  user,
}: {
  user?: { fullName?: string | null; email?: string | null };
}) {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <QuoteForm user={user} onBack={() => setIsCreating(false)} />;
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#4b5563", margin: 0 }}>
          View and manage your recent quotes below.
        </p>
        <button
          onClick={() => setIsCreating(true)}
          style={{
            backgroundColor: "#059669",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#047857")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#059669")
          }
        >
          + Create New Quote
        </button>
      </div>
      <QuotesTable />
    </div>
  );
}
