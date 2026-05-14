"use client";
import { useEffect, useState } from "react";
import type { QuoteRow } from "../models/ui";
import { QuoteDetailsModal } from "./QuoteDetailsModal";
import { getRiskBandBadgeStyle, linkButtonStyle, tdStyle, thStyle } from "./quoteStyles";

export function QuotesTable({ admin = false }: { admin?: boolean }) {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        setQuotes(data.items ?? []);
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
    (quote) =>
      !searchQuery ||
      quote.user?.email?.includes(searchQuery) ||
      quote.user?.fullName?.includes(searchQuery),
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
  if (error)
    return <div style={{ color: "red", padding: "1rem" }}>Error: {error}</div>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {admin && (
        <input
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      <div
        style={{
          overflowX: "auto",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <tr>
              <th style={thStyle}>
                Date
              </th>
              {admin && (
                <th style={thStyle}>
                  User
                </th>
              )}
              <th style={thStyle}>
                Size (kW)
              </th>
              <th style={thStyle}>
                Price
              </th>
              <th style={thStyle}>
                Risk Band
              </th>
              <th style={thStyle}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((quote, idx) => (
              <tr
                key={quote.id}
                style={{
                  borderBottom:
                    idx === rows.length - 1 ? "none" : "1px solid #e5e7eb",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td style={tdStyle}>
                  {new Date(quote.createdAt).toLocaleDateString()}
                </td>
                {admin && (
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: "500",
                    }}
                  >
                    {quote.user?.fullName || quote.user?.email || "Unknown"}
                  </td>
                )}
                <td style={tdStyle}>
                  {quote.systemSizeKw}
                </td>
                <td style={tdStyle}>
                  ${quote.systemPrice}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={getRiskBandBadgeStyle(quote.riskBand)}>
                    {quote.riskBand}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleOpenDetails(quote.id)}
                    style={linkButtonStyle}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={admin ? 6 : 5}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
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
