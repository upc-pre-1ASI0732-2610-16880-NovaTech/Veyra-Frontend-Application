import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { loadStripe, Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';
import { PaymentStore } from '../../../application/payment.store';

@Component({
  selector: 'payment-checkout',
  templateUrl: './payment-checkout.html',
  styleUrls: ['./payment-checkout.css'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule, TranslatePipe,
    MatFormFieldModule, MatButtonModule, MatCardModule,
    MatIconModule, MatProgressSpinnerModule, MatDividerModule, MatCheckboxModule
  ]
})
export class PaymentCheckoutPage implements OnInit, AfterViewInit, OnDestroy {
  protected paymentStore = inject(PaymentStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('cardNumberElement') cardNumberElementRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cardExpiryElement') cardExpiryElementRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cardCvcElement') cardCvcElementRef!: ElementRef<HTMLDivElement>;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardNumberElement: StripeCardNumberElement | null = null;
  private cardExpiryElement: StripeCardExpiryElement | null = null;
  private cardCvcElement: StripeCardCvcElement | null = null;

  planTitle = '';
  planType = '';
  period: 'MONTHLY' | 'ANNUALLY' = 'MONTHLY';
  planPrice = 0;
  currency = 'USD';

  cardBrand = 'generic';
  cardElementsReady = false;
  stripeInitError: string | null = null;

  isProcessing = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  form = new FormGroup({
    cardholderName:  new FormControl('', [Validators.required, Validators.minLength(3)]),
    acceptNoRefund:  new FormControl(false, [Validators.requiredTrue])
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

  async ngAfterViewInit(): Promise<void> {
    this.stripe = await loadStripe(environment.stripePublicKey);
    if (!this.stripe) {
      this.stripeInitError = 'No se pudo inicializar Stripe. Verifica la clave pública configurada.';
      return;
    }

    this.elements = this.stripe.elements();
    const style = {
      base: {
        fontSize: '16px',
        color: '#1a1a1a',
        fontFamily: 'Roboto, sans-serif',
        '::placeholder': { color: '#9e9e9e' }
      },
      invalid: { color: '#c62828' }
    };

    this.cardNumberElement = this.elements.create('cardNumber', { style, showIcon: true });
    this.cardNumberElement.mount(this.cardNumberElementRef.nativeElement);
    this.cardNumberElement.on('change', event => {
      this.cardBrand = event.brand ?? 'generic';
      this.stripeInitError = event.error ? event.error.message : null;
    });

    this.cardExpiryElement = this.elements.create('cardExpiry', { style });
    this.cardExpiryElement.mount(this.cardExpiryElementRef.nativeElement);
    this.cardExpiryElement.on('change', event => {
      if (event.error) this.stripeInitError = event.error.message;
    });

    this.cardCvcElement = this.elements.create('cardCvc', { style });
    this.cardCvcElement.mount(this.cardCvcElementRef.nativeElement);
    this.cardCvcElement.on('change', event => {
      if (event.error) this.stripeInitError = event.error.message;
    });

    this.cardElementsReady = true;
  }

  ngOnDestroy(): void {
    this.cardNumberElement?.destroy();
    this.cardExpiryElement?.destroy();
    this.cardCvcElement?.destroy();
  }

  async submitPayment(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.stripe || !this.cardNumberElement) {
      this.errorMessage = 'El formulario de pago aún no está listo. Intenta nuevamente en unos segundos.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardNumberElement,
      billing_details: { name: this.form.value.cardholderName ?? undefined }
    });

    if (error || !paymentMethod) {
      this.isProcessing = false;
      this.errorMessage = error?.message ?? 'No se pudo procesar la tarjeta.';
      return;
    }

    this.paymentStore.createSubscription(paymentMethod.id, this.planType, this.period, () => {
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
    return this.cardBrand;
  }
}
