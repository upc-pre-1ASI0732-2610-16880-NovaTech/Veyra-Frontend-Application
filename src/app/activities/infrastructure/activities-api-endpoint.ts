import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityResponse } from './activity-response';

const base = environment.platformProviderApiBaseUrl;
const path = environment.platformProviderNursingHomeActivitiesEndpointPath;

export class ActivitiesApiEndpoint {
  constructor(private http: HttpClient) {}

  getAll(nursingHomeId: number, date?: string): Observable<ActivityResponse[]> {
    const url = `${base}${path}`.replace('{nursingHomeId}', nursingHomeId.toString());
    const params = date ? `?date=${date}` : '';
    return this.http.get<ActivityResponse[]>(`${url}${params}`);
  }

  create(nursingHomeId: number, body: {
    name: string;
    activityDate: string;
    startTime: string;
    endTime: string;
    area: string;
    residentId: number;
    attendantId: number;
  }): Observable<number> {
    const url = `${base}${path}`.replace('{nursingHomeId}', nursingHomeId.toString());
    return this.http.post<number>(url, body);
  }
}
