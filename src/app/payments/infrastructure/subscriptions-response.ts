export interface SubscriptionResponse {
  id: number;
  userId: number;
  stripeSubscriptionId: string;
  planType: string;
  period: 'MONTHLY' | 'ANNUALLY';
  amount: number;
  currency: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'TRIALING' | 'UNPAID';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}
