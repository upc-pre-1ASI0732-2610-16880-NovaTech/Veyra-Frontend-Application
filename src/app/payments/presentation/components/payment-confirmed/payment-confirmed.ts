import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-payment-confirmed',
  imports: [],
  templateUrl: './payment-confirmed.html',
  styleUrl: './payment-confirmed.css'
})
export class PaymentConfirmed implements OnInit {

  private router = inject(Router);

  ngOnInit(): void {
    // Redirección al cargar el componente
    this.router.navigate(['/iam/sign-in']);
  }

}
