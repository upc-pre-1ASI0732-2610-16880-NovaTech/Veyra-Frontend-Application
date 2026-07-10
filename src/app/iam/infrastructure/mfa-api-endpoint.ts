import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const base = environment.platformProviderApiBaseUrl;

export interface MfaSetupResource {
  secret: string;
  otpAuthUrl: string;
}

export interface MfaVerifyResource {
  token: string;
}

export interface MfaStatusResource {
  enabled: boolean;
  method: string;
}

export class MfaApiEndpoint {
  constructor(private http: HttpClient) {}

  setup(): Observable<MfaSetupResource> {
    return this.http.post<MfaSetupResource>(`${base}${environment.platformProviderMfaSetupEndpointPath}`, {});
  }

  setupSms(phoneNumber: string): Observable<void> {
    return this.http.post<void>(`${base}${environment.platformProviderMfaSmsSetupEndpointPath}`, { phoneNumber });
  }

  enable(code: string): Observable<void> {
    return this.http.post<void>(`${base}${environment.platformProviderMfaEnableEndpointPath}`, { code });
  }

  disable(): Observable<void> {
    return this.http.delete<void>(`${base}${environment.platformProviderMfaDisableEndpointPath}`);
  }

  verify(userId: number, code: string): Observable<MfaVerifyResource> {
    return this.http.post<MfaVerifyResource>(`${base}${environment.platformProviderMfaVerifyEndpointPath}`, { userId, code });
  }

  status(): Observable<MfaStatusResource> {
    return this.http.get<MfaStatusResource>(`${base}${environment.platformProviderMfaStatusEndpointPath}`);
  }
}
