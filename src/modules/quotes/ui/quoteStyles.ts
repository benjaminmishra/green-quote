import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  width: "100%",
  boxSizing: "border-box",
  marginTop: "4px",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "16px",
};

export const formContainerStyle: CSSProperties = {
  fontFamily: "sans-serif",
  maxWidth: "800px",
  margin: "0 auto",
};

export const headerFlexStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

export const backButtonStyle: CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
};

export const errorAlertStyle: CSSProperties = {
  color: "#991b1b",
  backgroundColor: "#fee2e2",
  padding: "12px",
  borderRadius: "6px",
  marginBottom: "20px",
};

export const cardStyle: CSSProperties = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  border: "1px solid #e5e7eb",
};

export const readOnlyInputStyle: CSSProperties = {
  ...inputStyle,
  backgroundColor: "#f9fafb",
  color: "#6b7280",
};

export const submitButtonStyle: CSSProperties = {
  padding: "10px 24px",
  backgroundColor: "#059669",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
};

export const statCardContainerStyle: CSSProperties = {
  flex: 1,
  padding: "20px",
  borderRadius: "8px",
  textAlign: "center",
};

export const statLabelStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase",
};

export const statValueStyle: CSSProperties = {
  fontSize: "32px",
  fontWeight: "bold",
  marginTop: "8px",
};

export const offerCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

export const thStyle: CSSProperties = {
  padding: "12px 16px",
  fontWeight: "600",
  color: "#374151",
};

export const tdStyle: CSSProperties = {
  padding: "12px 16px",
  color: "#4b5563",
};

export const linkButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  padding: "0",
  font: "inherit",
  textDecoration: "underline",
};

export function getRiskBandBadgeStyle(band: string): CSSProperties {
  const isA = band === "A";
  const isB = band === "B";
  return {
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: isA ? "#d1fae5" : isB ? "#fef3c7" : "#fee2e2",
    color: isA ? "#065f46" : isB ? "#92400e" : "#991b1b",
  };
}

export const detailsModalStyle = {
  modal: {
    borderRadius: "8px",
    padding: "24px",
    minWidth: "400px",
    fontFamily: "sans-serif",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
};

export const detailsStatCardStyle: CSSProperties = {
  padding: "12px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
};

export const detailsStatLabelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase",
  fontWeight: "bold",
};

export const detailsStatValueStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: "500",
};

export const detailsOfferCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
};
