import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-plan-nursing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plan-nursing.html',
  styleUrls: ['./subscription-plan-nursing.css']
})
export class SubscriptionPlanNursing {

  constructor(private router: Router) {}

  choosePlan(cycle: 'monthly' | 'annual') {
    this.router.navigate(['/payments/checkout', 'nursing-home', cycle]);
  }

  goBack() {
    this.router.navigate(['/payments/choose']);
  }
}
