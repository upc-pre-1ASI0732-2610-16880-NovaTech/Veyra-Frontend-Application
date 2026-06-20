import { SubscriptionResponse } from '../../infrastructure/subscriptions-response';

export class Subscription {
  constructor(
    public id: number,
    public userId: number,
    public stripeSubscriptionId: string,
    public planType: string,
    public period: 'MONTHLY' | 'ANNUALLY',
    public amount: number,
    public currency: string,
    public status: string,
    public currentPeriodStart: string,
    public currentPeriodEnd: string,
    public createdAt: string
  ) {}

  static fromResponse(data: SubscriptionResponse): Subscription {
    return new Subscription(
      data.id, data.userId, data.stripeSubscriptionId, data.planType,
      data.period, data.amount, data.currency, data.status,
      data.currentPeriodStart, data.currentPeriodEnd, data.createdAt
    );
  }
}
