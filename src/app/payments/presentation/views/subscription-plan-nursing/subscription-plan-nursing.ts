import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PaymentStore } from '../../../application/payment.store';

@Component({
  selector: 'app-subscription-plan-nursing',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TranslatePipe, MatIconModule, MatButtonModule],
  templateUrl: './subscription-plan-nursing.html',
  styleUrls: ['./subscription-plan-nursing.css']
})
export class SubscriptionPlanNursing implements OnInit {
  protected store = inject(PaymentStore);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.store.plans().length === 0) {
      this.store.loadPlans();
    }
  }

  get plan() {
    return this.store.plans().find(p => p.id === 'NURSING_HOME') ?? null;
  }

  get monthlyPrice(): number { return this.plan?.monthlyPrice ?? 300; }
  get annualPrice(): number { return this.plan?.annualPrice ?? 3000; }
  get annualMonthly(): number { return Math.round(this.annualPrice / 12); }
  get currency(): string { return this.plan?.currency ?? 'USD'; }

  get includedFeatures() {
    return this.plan?.features.filter(f => f.included) ?? [];
  }

  choosePlan(cycle: 'monthly' | 'annual'): void {
    this.router.navigate(['/payments/checkout', 'nursing-home', cycle]);
  }

  goBack(): void {
    this.router.navigate(['/payments/choose']);
  }
}
