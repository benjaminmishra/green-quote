"use client";
import { useEffect, useState } from "react";
import type { QuoteRow } from "../models/ui";
import { QuoteDetailsModal } from "./QuoteDetailsModal";

export function QuotesTable({ admin = false }: { admin?: boolean }) {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/quotes")
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text || "Failed to fetch quotes");
        }
        return r.json();
      })
      .then((data) => {
        setQuotes(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch quotes:", err);
        setError(err.message || "An unexpected error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const rows = quotes.filter(
    (x) => !q || x.user?.email?.includes(q) || x.user?.fullName?.includes(q),
  );

  const handleOpenDetails = (id: string) => {
    setSelectedQuoteId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedQuoteId(null), 200); // clear after animation
  };

  if (loading) return <div>Loading quotes...</div>;
  if (error) return <div style={{ color: "red", padding: "1rem" }}>Error: {error}</div>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {admin && (
        <input
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
          placeholder="Search user..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      )}
      
      <div style={{ overflowX: "auto", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <tr>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Date</th>
              {admin && <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>User</th>}
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Size (kW)</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Price</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Risk Band</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x, idx) => (
              <tr 
                key={x.id} 
                style={{ 
                  borderBottom: idx === rows.length - 1 ? "none" : "1px solid #e5e7eb",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>{new Date(x.createdAt).toLocaleDateString()}</td>
                {admin && (
                  <td style={{ padding: "12px 16px", color: "#4b5563", fontWeight: "500" }}>
                    {x.user?.fullName || x.user?.email || "Unknown"}
                  </td>
                )}
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>{x.systemSizeKw}</td>
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>${x.systemPrice}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "500",
                    backgroundColor: x.riskBand === 'A' ? '#d1fae5' : x.riskBand === 'B' ? '#fef3c7' : '#fee2e2',
                    color: x.riskBand === 'A' ? '#065f46' : x.riskBand === 'B' ? '#92400e' : '#991b1b'
                  }}>
                    {x.riskBand}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button 
                    onClick={() => handleOpenDetails(x.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      cursor: "pointer",
                      padding: "0",
                      font: "inherit",
                      textDecoration: "underline"
                    }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={admin ? 6 : 5} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                  No quotes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <QuoteDetailsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        quoteId={selectedQuoteId}
      />
    </div>
  );
}
