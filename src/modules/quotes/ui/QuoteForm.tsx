"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import type { QuoteResponse } from "../models/ui";
import {
  backButtonStyle,
  cardStyle,
  errorAlertStyle,
  formContainerStyle,
  headerFlexStyle,
  inputStyle,
  labelStyle,
  offerCardStyle,
  readOnlyInputStyle,
  statCardContainerStyle,
  statLabelStyle,
  statValueStyle,
  submitButtonStyle,
} from "./quoteStyles";

const schema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  address: z.string().min(3),
  monthlyConsumptionKwh: z.coerce.number().positive(),
  systemSizeKw: z.coerce.number().positive(),
  downPayment: z.coerce.number().nonnegative().optional(),
});

export function QuoteForm({
  user,
  onBack,
}: {
  user?: { fullName?: string | null; email?: string | null };
  onBack?: () => void;
}) {
  const [res, setRes] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setRes(null);
    setIsSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parseResult = schema.safeParse(data);

    if (!parseResult.success) {
      setError(
        "Validation failed: " +
          parseResult.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(", "),
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const r = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      const json = await r.json();

      if (!r.ok) {
        setError(json.error || "Failed to submit quote");
        return;
      }

      setRes(json as QuoteResponse);
    } catch (err) {
      setError("An unexpected network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }
  // Styles extracted to quoteStyles.ts

  return (
    <div style={formContainerStyle}>
      <div style={headerFlexStyle}>
        <h2 style={{ margin: 0, color: "#111827" }}>
          {res ? "Quote Results" : "Create New Quote"}
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            style={backButtonStyle}
          >
            ← Back to My Quotes
          </button>
        )}
      </div>

      {error && (
        <div style={errorAlertStyle}>
          {error}
        </div>
      )}

      {!res ? (
        <form
          onSubmit={submit}
          style={cardStyle}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <label style={labelStyle}>
              Full Name
              <input
                name="fullName"
                defaultValue={user?.fullName || "Current User"}
                readOnly
                style={readOnlyInputStyle}
              />
            </label>
            <label style={labelStyle}>
              Email Address
              <input
                name="email"
                defaultValue={user?.email || "user@test.com"}
                readOnly
                style={readOnlyInputStyle}
              />
            </label>

            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              Installation Address
              <input
                name="address"
                placeholder="123 Green Way, Austin, TX"
                required
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Monthly Consumption (kWh)
              <input
                name="monthlyConsumptionKwh"
                type="number"
                placeholder="e.g., 900"
                required
                min="1"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              System Size (kW)
              <input
                name="systemSizeKw"
                type="number"
                step="0.01"
                placeholder="e.g., 6.5"
                required
                min="0.1"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Down Payment ($)
              <input
                name="downPayment"
                type="number"
                step="0.01"
                defaultValue="0"
                min="0"
                style={inputStyle}
              />
            </label>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              disabled={isSubmitting}
              style={{
                ...submitButtonStyle,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Processing..." : "Get Pre-Qualification"}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                ...statCardContainerStyle,
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              <div
                style={{
                  ...statLabelStyle,
                  color: "#166534",
                }}
              >
                System Price
              </div>
              <div
                style={{
                  ...statValueStyle,
                  color: "#15803d",
                }}
              >
                ${res.derived?.systemPrice}
              </div>
            </div>
            <div
              style={{
                ...statCardContainerStyle,
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  ...statLabelStyle,
                  color: "#4b5563",
                }}
              >
                Risk Band
              </div>
              <div
                style={{
                  ...statValueStyle,
                  color: "#374151",
                }}
              >
                {res.derived?.riskBand}
              </div>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: "18px",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Financing Offers
            </h3>
            <div style={{ display: "grid", gap: "16px" }}>
              {res.offers?.map((o) => (
                <div
                  key={o.termYears}
                  style={offerCardStyle}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {o.termYears} Year Term
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      Fixed rate financing
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#059669",
                      }}
                    >
                      ${o.monthlyPayment}
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#6b7280",
                          fontWeight: "normal",
                        }}
                      >
                        /mo
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
