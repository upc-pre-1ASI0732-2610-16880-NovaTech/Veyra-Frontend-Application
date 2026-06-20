export interface PlanPrice {
  period: 'MONTHLY' | 'ANNUALLY';
  price: number;
  currency: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PlanResponse {
  id: string;
  displayName: string;
  description: string;
  prices: PlanPrice[];
  features: PlanFeature[];
}
