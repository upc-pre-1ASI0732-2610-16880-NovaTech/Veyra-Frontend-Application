import { computed, Injectable, signal } from '@angular/core';
import { User } from '../domain/model/user.entity';
import { SignInCommand } from '../domain/model/sign-in.command';
import { Router } from '@angular/router';
import { IamApi } from '../infrastructure/iam-api';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { CreateAdministratorCommand } from '../domain/model/create-administrator.command';
import { MfaSetupResource } from '../infrastructure/mfa-api-endpoint';

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly _loadingSignal = signal<boolean>(false);
  private readonly _errorSignal = signal<string | null>(null);
  private readonly isSignedInSignal = signal<boolean>(false);
  private readonly currentUsernameSignal = signal<string | null>(null);
  private readonly currentUserIdSignal = signal<number | null>(null);
  private readonly usersSignal = signal<Array<User>>([]);
  private readonly mfaSetupDataSignal = signal<MfaSetupResource | null>(null);

  readonly isSignedIn = this.isSignedInSignal.asReadonly();
  readonly loadingUsers = signal<boolean>(false);
  readonly currentUsername = this.currentUsernameSignal.asReadonly();
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  readonly currentToken = computed(() => this.isSignedIn() ? localStorage.getItem('token') : null);
  readonly users = this.usersSignal.asReadonly();
  readonly loading = this._loadingSignal.asReadonly();
  readonly error = this._errorSignal.asReadonly();
  readonly isLoadingUsers = this.loadingUsers.asReadonly();
  readonly mfaSetupData = this.mfaSetupDataSignal.asReadonly();

    constructor(private iamApi: IamApi) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username'); // Recuperamos el username también

    if (token && userId) {
        // Si el token existe, restauramos la sesión en las Signals
        this.isSignedInSignal.set(true);
        this.currentUserIdSignal.set(Number(userId));
        this.currentUsernameSignal.set(username);
      } else {

        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
      }
    }

  createAdministrator(createAdministratorCommand: CreateAdministratorCommand, router: Router) {
    this.iamApi.createAdministrator(createAdministratorCommand).subscribe({
      next: (administratorResource) => {
        console.log('Administrator created successfully:', administratorResource);
        router.navigate(['/iam/sign-in']).then();
      },
      error: (err) => {
        console.error('Administrator creation failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/iam/sign-up'], {
          queryParams: { role: 'admin' }
        }).then();
      }
    })
  }

  signIn(signInCommand: SignInCommand, router: Router) {
    this.iamApi.signIn(signInCommand).subscribe({
      next: (signInResource) => {
        if (signInResource.mfaRequired) {
          localStorage.setItem('mfa_pending_user_id', signInResource.id.toString());
          router.navigate(['/iam/mfa-verify']).then();
          return;
        }

        localStorage.setItem('token', signInResource.token);
        localStorage.setItem('userId', signInResource.id.toString());
        localStorage.setItem('username', signInResource.username);

        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(signInResource.username);
        this.currentUserIdSignal.set(signInResource.id);

        if (signInResource.roles.includes('ROLE_ADMIN')) {
          router.navigate(['/nursing/nursing-homes/new']).then();
        } else {
          router.navigate(['/analytics/dashboard']).then();
        }
      },
      error: (err) => {
        console.error('Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/iam/sign-in']).then();
      }
    });
  }

  verifyMfa(code: string, router: Router) {
    const userId = Number(localStorage.getItem('mfa_pending_user_id'));
    if (!userId) {
      router.navigate(['/iam/sign-in']).then();
      return;
    }
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.iamApi.mfaVerify(userId, code).subscribe({
      next: (res) => {
        localStorage.removeItem('mfa_pending_user_id');
        localStorage.setItem('token', res.token);
        this.isSignedInSignal.set(true);
        this._loadingSignal.set(false);
        router.navigate(['/analytics/dashboard']).then();
      },
      error: (err) => {
        this._errorSignal.set('Invalid TOTP code. Please try again.');
        this._loadingSignal.set(false);
      }
    });
  }

  setupMfa() {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.iamApi.mfaSetup().subscribe({
      next: (res) => {
        this.mfaSetupDataSignal.set(res);
        this._loadingSignal.set(false);
      },
      error: () => {
        this._errorSignal.set('Failed to initiate MFA setup.');
        this._loadingSignal.set(false);
      }
    });
  }

  enableMfa(code: string, router: Router) {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.iamApi.mfaEnable(code).subscribe({
      next: () => {
        this.mfaSetupDataSignal.set(null);
        this._loadingSignal.set(false);
        router.navigate(['/analytics/dashboard']).then();
      },
      error: () => {
        this._errorSignal.set('Invalid code. MFA not activated.');
        this._loadingSignal.set(false);
      }
    });
  }

  disableMfa(router: Router) {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.iamApi.mfaDisable().subscribe({
      next: () => {
        this._loadingSignal.set(false);
        router.navigate(['/analytics/dashboard']).then();
      },
      error: () => {
        this._errorSignal.set('Failed to disable MFA.');
        this._loadingSignal.set(false);
      }
    });
  }

  signUp(signUpCommand: SignUpCommand, router: Router) {
    this.iamApi.signUp(signUpCommand).subscribe({
      next: (signUpResource) => {
        console.log('Sign-up successful:', signUpResource);
        router.navigate(['/iam/sign-in']).then();
      },
      error: (err) => {
        console.error('Sign-up failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/iam/sign-up']).then();
      }
    });
  }

  signOut(router: Router) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('nursingHomeId');
    this.isSignedInSignal.set(false);
    this.currentUsernameSignal.set(null);
    this.currentUserIdSignal.set(null);
    router.navigate(['/home']).then();
  }
}
