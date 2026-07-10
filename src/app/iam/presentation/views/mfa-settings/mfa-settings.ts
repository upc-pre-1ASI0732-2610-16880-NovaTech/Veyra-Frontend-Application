import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam.store';

type SetupMode = 'idle' | 'totp' | 'sms';

@Component({
  selector: 'app-mfa-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mfa-settings.html',
  styleUrls: ['./mfa-settings.css']
})
export class MfaSettings implements OnInit {
  protected store = inject(IamStore);
  private router = inject(Router);

  mode = signal<SetupMode>('idle');

  phoneForm = new FormGroup({
    phoneNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+[1-9]\d{6,14}$/)]
    })
  });

  codeForm = new FormGroup({
    code: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)]
    })
  });

  ngOnInit(): void {
    this.store.loadMfaStatus();
  }

  startTotpSetup(): void {
    this.mode.set('totp');
    this.store.setupMfa();
  }

  startSmsSetup(): void {
    this.mode.set('sms');
  }

  sendSmsCode(): void {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }
    this.store.setupSmsMfa(this.phoneForm.value.phoneNumber!);
  }

  confirmCode(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.store.enableMfa(this.codeForm.value.code!, this.router);
  }

  disable(): void {
    this.store.disableMfa(this.router);
  }

  cancel(): void {
    this.mode.set('idle');
  }
}
