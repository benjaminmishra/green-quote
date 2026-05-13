export type Offer = {
  termYears: number;
  apr: string;
  principalUsed: string;
  monthlyPayment: string;
};

export type QuoteDetail = {
  id: string;
  systemSizeKw: string;
  systemPrice: string;
  downPayment: string;
  riskBand: string;
  address: string;
  offers: Offer[];
};

export type QuoteResponse = {
  derived?: { systemPrice: string; riskBand: string };
  offers?: Array<{ termYears: number; monthlyPayment: string }>;
};

export type QuoteRow = {
  id: string;
  createdAt: string;
  systemSizeKw: string;
  systemPrice: string;
  riskBand: string;
  user?: { email?: string | null; fullName?: string | null } | null;
};
