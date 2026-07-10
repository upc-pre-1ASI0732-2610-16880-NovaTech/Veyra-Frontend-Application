import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Shared toast/snackbar service so error and success feedback is visible and
 * consistent across the app, instead of failing silently or only via inline banners.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Shows an error toast. If `onRetry` is provided, a "Retry" action button is shown
   * and the toast stays open until the user dismisses or retries it.
   */
  showError(message: string, onRetry?: () => void): void {
    const ref = this.snackBar.open(message, onRetry ? 'Retry' : 'Dismiss', {
      duration: onRetry ? undefined : 6000,
      panelClass: ['app-snackbar', 'app-snackbar-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    if (onRetry) {
      ref.onAction().subscribe(() => onRetry());
    }
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      panelClass: ['app-snackbar', 'app-snackbar-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
