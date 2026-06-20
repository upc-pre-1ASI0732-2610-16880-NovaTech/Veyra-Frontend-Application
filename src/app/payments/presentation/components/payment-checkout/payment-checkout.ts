import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';
import { PaymentStore } from '../../../application/payment.store';

@Component({
  selector: 'payment-checkout',
  templateUrl: './payment-checkout.html',
  styleUrls: ['./payment-checkout.css'],
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TranslatePipe]
})
export class PaymentCheckoutPage implements OnInit, OnDestroy {
  @ViewChild('cardElement', { static: true }) cardElementRef!: ElementRef;

  protected paymentStore = inject(PaymentStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  planTitle = '';
  planType = '';
  period: 'MONTHLY' | 'ANNUALLY' = 'MONTHLY';
  planPrice = 0;
  currency = 'USD';

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;

  isProcessing = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async p => {
      const type = p['type'] as string;
      const cycle = p['cycle'] as string;

      this.planType = type === 'family' ? 'FAMILY' : 'NURSING_HOME';
      this.period = cycle === 'annual' ? 'ANNUALLY' : 'MONTHLY';
      this.planTitle = type === 'family' ? 'Family Plan' : 'Nursing Home Plan';

      const plan = this.paymentStore.plans().find(pl => pl.id === this.planType);
      if (plan) {
        this.planPrice = this.period === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
        this.currency = plan.currency;
      } else {
        this.planPrice = this.planType === 'FAMILY'
          ? (this.period === 'MONTHLY' ? 30 : 300)
          : (this.period === 'MONTHLY' ? 300 : 3000);
      }
    });

    this.stripe = await loadStripe(environment.stripePublicKey);
    if (this.stripe) {
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#333',
            '::placeholder': { color: '#aaa' }
          }
        }
      });
      this.cardElement.mount(this.cardElementRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.cardElement?.destroy();
  }

  async submitPayment(): Promise<void> {
    if (!this.stripe || !this.cardElement) {
      this.errorMessage = 'Stripe no está disponible. Recarga la página.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement
    });

    if (error) {
      this.errorMessage = error.message ?? 'Error al procesar la tarjeta.';
      this.isProcessing = false;
      return;
    }

    this.paymentStore.createSubscription(paymentMethod!.id, this.planType, this.period, () => {
      this.isProcessing = false;
      this.successMessage = 'Suscripción creada exitosamente.';
      setTimeout(() => this.router.navigate(['/nursing/nursing-homes/new']), 2000);
    }, (err: string) => {
      this.isProcessing = false;
      this.errorMessage = err;
    });
  }

  cancel(): void {
    history.back();
  }
}
