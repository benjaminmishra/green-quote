"use client";
import { useEffect, useState } from "react";
import type { QuoteRow } from "../models/ui";

export function QuotesTable({ admin = false }: { admin?: boolean }) {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then(setQuotes);
  }, []);
  const rows = quotes.filter(
    (x) => !q || x.user?.email?.includes(q) || x.user?.fullName?.includes(q),
  );
  return (
    <div>
      {admin && (
        <input
          placeholder="search user"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      )}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Size</th>
            <th>Price</th>
            <th>Band</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td>{new Date(x.createdAt).toLocaleDateString()}</td>
              <td>{x.systemSizeKw}</td>
              <td>{x.systemPrice}</td>
              <td>{x.riskBand}</td>
              <td>
                <a href={`/quotes/${x.id}`}>Details</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
