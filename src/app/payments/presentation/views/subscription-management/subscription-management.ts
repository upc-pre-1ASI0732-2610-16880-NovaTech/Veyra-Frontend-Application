import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PaymentStore } from '../../../application/payment.store';
import { LayoutNursingHome } from '../../../../shared/presentation/components/layout-nursing-home/layout-nursing-home';
import { Plan } from '../../../domain/model/plan.entity';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, TranslatePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDividerModule, MatProgressSpinnerModule, MatDialogModule,
    LayoutNursingHome
  ],
  templateUrl: './subscription-management.html',
  styleUrls: ['./subscription-management.css']
})
export class SubscriptionManagement implements OnInit {
  protected store = inject(PaymentStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  confirmingCancel = false;

  ngOnInit(): void {
    this.store.loadActiveSubscription();
    if (this.store.plans().length === 0) {
      this.store.loadPlans();
    }
  }

  get subscription() { return this.store.subscription(); }

  get currentPlanLabel(): string {
    const planType = this.subscription?.planType ?? '';
    return this.planLabel(planType);
  }

  get otherPlans(): Plan[] {
    const currentType = this.subscription?.planType;
    return this.store.plans().filter(p => p.id !== currentType);
  }

  get samePlanOtherPeriod(): 'MONTHLY' | 'ANNUALLY' | null {
    const sub = this.subscription;
    if (!sub) return null;
    return sub.period === 'MONTHLY' ? 'ANNUALLY' : 'MONTHLY';
  }

  planLabel(planType: string): string {
    const map: Record<string, string> = {
      NURSING_HOME: 'Casa de Reposo',
      FAMILY: 'Familiar'
    };
    return map[planType] ?? planType;
  }

  periodLabel(period: string): string {
    return period === 'MONTHLY' ? 'Mensual' : 'Anual';
  }

  priceForPlan(plan: Plan, period: 'MONTHLY' | 'ANNUALLY'): number {
    return period === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
  }

  switchPeriod(): void {
    const sub = this.subscription;
    const target = this.samePlanOtherPeriod;
    if (!sub || !target) return;
    this.store.updateSubscription(sub.planType, target);
  }

  switchPlan(plan: Plan): void {
    const sub = this.subscription;
    if (!sub) return;
    this.store.updateSubscription(plan.id, sub.period);
  }

  requestCancel(): void {
    this.confirmingCancel = true;
  }

  confirmCancel(): void {
    this.store.cancelSubscription(() => {
      this.confirmingCancel = false;
    });
  }

  goToChoose(): void {
    this.router.navigate(['/payments/choose']);
  }
}
