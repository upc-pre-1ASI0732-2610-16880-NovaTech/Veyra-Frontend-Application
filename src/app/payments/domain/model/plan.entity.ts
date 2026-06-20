import { PlanResponse, PlanFeature, PlanPrice } from '../../infrastructure/plans-response';

export class Plan {
  constructor(
    public id: string,
    public displayName: string,
    public description: string,
    public prices: PlanPrice[],
    public features: PlanFeature[]
  ) {}

  get monthlyPrice(): number {
    return this.prices.find(p => p.period === 'MONTHLY')?.price ?? 0;
  }

  get annualPrice(): number {
    return this.prices.find(p => p.period === 'ANNUALLY')?.price ?? 0;
  }

  get currency(): string {
    return this.prices[0]?.currency ?? 'USD';
  }

  static fromResponse(data: PlanResponse): Plan {
    return new Plan(data.id, data.displayName, data.description, data.prices, data.features);
  }
}
