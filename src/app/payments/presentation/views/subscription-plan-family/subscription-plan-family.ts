import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-plan-family',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plan-family.html',
  styleUrls: ['./subscription-plan-family.css']
})
export class SubscriptionPlanFamily {

  constructor(private router: Router) {}

  choosePlan(cycle: 'monthly' | 'annual') {
    this.router.navigate(['/payments/checkout', 'family', cycle]);
  }

  goBack() {
    this.router.navigate(['/payments/choose']);
  }
}
