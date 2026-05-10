import { useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";

export function QuoteDetailsModal({
  quoteId,
  isOpen,
  onClose,
}: {
  quoteId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quoteId) {
      setLoading(true);
      setError(null);
      fetch(`/api/quotes/${quoteId}`)
        .then(async (r) => {
          if (!r.ok) {
            const text = await r.text();
            throw new Error(text || "Failed to fetch quote details");
          }
          return r.json();
        })
        .then((data) => {
          setQuote(data);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "An unexpected error occurred");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setQuote(null);
    }
  }, [isOpen, quoteId]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      styles={{
        modal: {
          borderRadius: "8px",
          padding: "24px",
          minWidth: "400px",
          fontFamily: "sans-serif",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
        },
      }}
    >
      <h2 style={{ marginTop: 0, borderBottom: "1px solid #eaeaea", paddingBottom: "12px", marginBottom: "20px" }}>
        Quote Details
      </h2>
      
      {loading && <p style={{ color: "#666" }}>Loading quote details...</p>}
      
      {error && <p style={{ color: "red", padding: "12px", backgroundColor: "#ffebeb", borderRadius: "4px" }}>Error: {error}</p>}
      
      {!loading && !error && quote && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" }}>System Size</div>
              <div style={{ fontSize: "18px", fontWeight: "500" }}>{quote.systemSizeKw} kW</div>
            </div>
            
            <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" }}>System Price</div>
              <div style={{ fontSize: "18px", fontWeight: "500" }}>${quote.systemPrice}</div>
            </div>
            
            <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" }}>Down Payment</div>
              <div style={{ fontSize: "18px", fontWeight: "500" }}>${quote.downPayment}</div>
            </div>
            
            <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" }}>Risk Band</div>
              <div style={{ fontSize: "18px", fontWeight: "500", color: quote.riskBand === 'A' ? 'green' : quote.riskBand === 'B' ? 'orange' : 'red' }}>
                {quote.riskBand}
              </div>
            </div>
          </div>
          
          <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" }}>Address</div>
            <div style={{ fontSize: "16px" }}>{quote.address}</div>
          </div>

          <div>
            <h3 style={{ fontSize: "16px", marginTop: "12px", marginBottom: "12px" }}>Financing Offers</h3>
            {quote.offers && quote.offers.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {quote.offers.map((offer: any, idx: number) => (
                  <div key={idx} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    padding: "12px", 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "6px" 
                  }}>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{offer.termYears} Years</div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>APR: {offer.apr}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#059669" }}>${offer.monthlyPayment} / mo</div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>Principal: ${offer.principalUsed}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b7280", fontStyle: "italic" }}>No financing offers available.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
