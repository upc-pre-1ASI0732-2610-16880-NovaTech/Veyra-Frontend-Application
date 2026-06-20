import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PaymentStore } from '../../../application/payment.store';

@Component({
  selector: 'payment-checkout',
  templateUrl: './payment-checkout.html',
  styleUrls: ['./payment-checkout.css'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule, TranslatePipe,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule,
    MatIconModule, MatProgressSpinnerModule, MatDividerModule
  ]
})
export class PaymentCheckoutPage implements OnInit {
  protected paymentStore = inject(PaymentStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  planTitle = '';
  planType = '';
  period: 'MONTHLY' | 'ANNUALLY' = 'MONTHLY';
  planPrice = 0;
  currency = 'USD';

  isProcessing = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  form = new FormGroup({
    cardholderName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    cardNumber:     new FormControl('', [Validators.required]),
    expiry:         new FormControl('', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]),
    cvc:            new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(4)])
  });

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      const type  = p['type']  as string;
      const cycle = p['cycle'] as string;

      this.planType  = type === 'family' ? 'FAMILY' : 'NURSING_HOME';
      this.period    = cycle === 'annual' ? 'ANNUALLY' : 'MONTHLY';
      this.planTitle = type === 'family' ? 'Family Plan' : 'Nursing Home Plan';

      const plan = this.paymentStore.plans().find(pl => pl.id === this.planType);
      if (plan) {
        this.planPrice = this.period === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
        this.currency  = plan.currency;
      } else {
        this.planPrice = this.planType === 'FAMILY'
          ? (this.period === 'MONTHLY' ? 30  : 300)
          : (this.period === 'MONTHLY' ? 300 : 3000);
      }
    });
  }

  onCardNumberInput(event: Event): void {
    const input  = event.target as HTMLInputElement;
    const raw    = input.value.replace(/\D/g, '').slice(0, 16);
    const pretty = raw.match(/.{1,4}/g)?.join(' ') ?? raw;
    this.form.get('cardNumber')!.setValue(pretty, { emitEvent: false });
    input.value = pretty;
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw     = input.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) raw = raw.slice(0, 2) + '/' + raw.slice(2);
    this.form.get('expiry')!.setValue(raw, { emitEvent: false });
    input.value = raw;
  }

  onCvcInput(event: Event): void {
    const input  = event.target as HTMLInputElement;
    input.value  = input.value.replace(/\D/g, '').slice(0, 4);
    this.form.get('cvc')!.setValue(input.value, { emitEvent: false });
  }

  submitPayment(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isProcessing = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Use Stripe test token so any card number is accepted in the UI
    const mockId = `pm_card_visa`;

    this.paymentStore.createSubscription(mockId, this.planType, this.period, () => {
      this.isProcessing  = false;
      this.successMessage = '¡Suscripción creada exitosamente!';
      setTimeout(() => this.router.navigate(['/nursing/nursing-homes/new']), 2000);
    }, (err: string) => {
      this.isProcessing  = false;
      this.errorMessage = err;
    });
  }

  cancel(): void { history.back(); }

  get cardType(): string {
    const n = (this.form.get('cardNumber')?.value ?? '').replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    return 'generic';
  }
}
