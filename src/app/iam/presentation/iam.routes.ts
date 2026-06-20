import {Routes} from '@angular/router';

const signInForm = () =>
  import('./views/sign-in-form/sign-in-form').then(m => m.SignInForm);
const signUpForm = () =>
  import('./views/sign-up-form/sign-up-form').then(m => m.SignUpForm);
const mfaVerifyForm = () =>
  import('./views/mfa-verify-form/mfa-verify-form').then(m => m.MfaVerifyForm);

const baseTitle = 'Veyra';
const iamRoutes: Routes = [
  { path: 'sign-in', loadComponent: signInForm, title: `Sign In | ${baseTitle}` },
  { path: 'sign-up', loadComponent: signUpForm, title: `Sign Up | ${baseTitle}` },
  { path: 'mfa-verify', loadComponent: mfaVerifyForm, title: `Verify Identity | ${baseTitle}` }
];

export { iamRoutes };
