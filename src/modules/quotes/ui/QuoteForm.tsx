"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import type { QuoteResponse } from "../models/ui";

const schema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  address: z.string().min(3),
  monthlyConsumptionKwh: z.coerce.number().positive(),
  systemSizeKw: z.coerce.number().positive(),
  downPayment: z.coerce.number().nonnegative().optional(),
});

export function QuoteForm({ user }: { user?: { fullName?: string | null; email?: string | null } }) {
  const [res, setRes] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setRes(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parseResult = schema.safeParse(data);
    
    if (!parseResult.success) {
      setError("Validation failed: " + parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(", "));
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
    }
  }
  return (
    <div>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={submit}>
        <input name="fullName" defaultValue={user?.fullName || "Current User"} readOnly />
        <input name="email" defaultValue={user?.email || "user@test.com"} readOnly />
        <input name="address" placeholder="address" />
        <input name="monthlyConsumptionKwh" type="number" />
        <input name="systemSizeKw" type="number" step="0.01" />
        <input name="downPayment" type="number" step="0.01" />
        <button>Get pre-qualification</button>
      </form>
      {res && (
        <div>
          <h3>Result</h3>
          <p>System Price: {res.derived?.systemPrice}</p>
          <p>Risk Band: {res.derived?.riskBand}</p>
          <ul>
            {res.offers?.map((o) => (
              <li key={o.termYears}>
                {o.termYears}y - {o.monthlyPayment}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
