import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentStore } from '../../../application/payment.store';

@Component({
  standalone: true,
  selector: 'app-subscription-choose',
  templateUrl: './subscription-choose.html',
  styleUrls: ['./subscription-choose.css'],
  imports: [
    CommonModule, CurrencyPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule
  ]
})
export class SubscriptionChoosePage implements OnInit {
  protected store = inject(PaymentStore);
  private router = inject(Router);

  ngOnInit(): void { this.store.loadPlans(); }

  get familyPlan()  { return this.store.plans().find(p => p.id === 'FAMILY')       ?? null; }
  get nursingPlan() { return this.store.plans().find(p => p.id === 'NURSING_HOME') ?? null; }

  choosePlan(type: 'family' | 'nursing-home', cycle: 'monthly' | 'annual'): void {
    this.router.navigate(['/payments/checkout', type, cycle]);
  }
}
