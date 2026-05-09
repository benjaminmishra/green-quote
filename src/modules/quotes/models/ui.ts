export type QuoteResponse = {
  derived?: { systemPrice: string; riskBand: string };
  offers?: Array<{ termYears: number; monthlyPayment: string }>;
};

export type QuoteRow = {
  id: string;
  createdAt: string;
  systemSizeKw: string | number;
  systemPrice: string | number;
  riskBand: string;
  user?: { email?: string | null; fullName?: string | null } | null;
};
