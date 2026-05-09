"use client";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  address: z.string().min(3),
  monthlyConsumptionKwh: z.coerce.number().positive(),
  systemSizeKw: z.coerce.number().positive(),
  downPayment: z.coerce.number().nonnegative().optional(),
});

export function QuoteForm() {
  const [res, setRes] = useState<any>();
  async function submit(e: any) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.parse(data);
    const r = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    setRes(await r.json());
  }
  return (
    <div>
      <form onSubmit={submit}>
        <input name="fullName" defaultValue="Current User" readOnly />
        <input name="email" defaultValue="user@test.com" readOnly />
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
            {res.offers?.map((o: any) => (
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
