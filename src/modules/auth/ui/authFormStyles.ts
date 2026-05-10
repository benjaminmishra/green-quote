import type { CSSProperties } from "react";

export const authPageStyle: CSSProperties = {
  minHeight: "calc(100vh - 40px)",
  display: "grid",
  placeItems: "center",
  background: "#f4f7fb",
};

export const formStyle: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "grid",
  gap: 16,
  padding: 28,
  border: "1px solid #dbe6f3",
  borderRadius: 8,
  background: "#ffffff",
  boxShadow: "0 18px 45px rgba(24, 52, 92, 0.1)",
};

export const headerStyle: CSSProperties = {
  display: "grid",
  gap: 6,
};

export const titleStyle: CSSProperties = {
  margin: 0,
  color: "#172b4d",
  fontSize: 28,
  lineHeight: 1.15,
};

export const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#5d6b82",
  fontSize: 14,
  lineHeight: 1.45,
};

export const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 6,
};

export const labelStyle: CSSProperties = {
  color: "#1f365c",
  fontSize: 14,
  fontWeight: 600,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd8ea",
  borderRadius: 6,
  padding: "11px 12px",
  color: "#172b4d",
  fontSize: 15,
  outlineColor: "#2563eb",
};

export const errorStyle: CSSProperties = {
  margin: 0,
  color: "#b42318",
  fontSize: 13,
  lineHeight: 1.35,
};

export const alertStyle: CSSProperties = {
  ...errorStyle,
  padding: "10px 12px",
  border: "1px solid #f5c2bd",
  borderRadius: 6,
  background: "#fff4f2",
};

export const buttonStyle: CSSProperties = {
  border: 0,
  borderRadius: 6,
  padding: "12px 14px",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 700,
};

export const footerTextStyle: CSSProperties = {
  margin: 0,
  color: "#5d6b82",
  fontSize: 14,
  textAlign: "center",
};

export const linkStyle: CSSProperties = {
  color: "#1d4ed8",
  fontWeight: 700,
  textDecoration: "none",
};
