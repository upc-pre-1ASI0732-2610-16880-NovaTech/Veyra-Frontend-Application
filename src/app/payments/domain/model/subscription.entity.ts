import { SubscriptionResponse } from '../../infrastructure/subscriptions-response';

export class Subscription {
  constructor(
    public id: number,
    public userId: number,
    public planType: string,
    public period: 'MONTHLY' | 'ANNUALLY',
    public status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE',
    public stripeSubscriptionId: string,
    public currentPeriodStart: string,
    public currentPeriodEnd: string
  ) {}

  static fromResponse(data: SubscriptionResponse): Subscription {
    return new Subscription(
      data.id,
      data.userId,
      data.planType,
      data.period,
      data.status,
      data.stripeSubscriptionId,
      data.currentPeriodStart,
      data.currentPeriodEnd
    );
  }
}
