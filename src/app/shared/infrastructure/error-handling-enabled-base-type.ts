import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

/**
 * Abstract base class providing error handling functionality for HTTP operations.
 */
export abstract class ErrorHandlingEnabledBaseType {

  /**
   * Handles HTTP errors and returns an observable that throws an error.
   * @param operation - The name of the operation that failed.
   * @returns A function that takes an HttpErrorResponse and returns an Observable that throws an error.
   */
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage: string;
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.status === 404) {
        errorMessage = `Recurso no encontrado (${operation})`;
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string' && error.error.length > 0) {
        errorMessage = error.error;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText || 'Error inesperado'} (${operation})`;
      }
      console.error(`[${operation}] HTTP ${error.status}:`, error.error);
      return throwError(() => new Error(errorMessage));
    }
  }
}
