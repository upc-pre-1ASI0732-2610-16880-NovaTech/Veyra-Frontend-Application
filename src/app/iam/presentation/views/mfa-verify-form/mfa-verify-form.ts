import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam.store';

@Component({
  selector: 'app-mfa-verify-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mfa-verify-form.html',
  styleUrls: ['./mfa-verify-form.css']
})
export class MfaVerifyForm {
  protected store = inject(IamStore);
  private router = inject(Router);

  form = new FormGroup({
    code: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)]
    })
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.store.verifyMfa(this.form.value.code!, this.router);
    } else {
      this.form.markAllAsTouched();
    }
  }

  goBackToSignIn(): void {
    localStorage.removeItem('mfa_pending_user_id');
    this.router.navigate(['/iam/sign-in']).then();
  }
}
