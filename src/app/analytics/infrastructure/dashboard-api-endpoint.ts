import { environment } from '../../../environments/environment';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Occupancy } from '../domain/model/occupancy.entity';
import { MedicationAlert } from '../domain/model/medication-alert.entity';

const occupancyEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderNursingHomeOccupancyEndpointPath}`;
const alertsEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderNursingHomeAlertsEndpointPath}`;

interface OccupancyResource {
  totalCapacity: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyRate: number;
}

interface MedicationAlertResource {
  medicationId: number;
  medicationName: string;
  alertType: string;
  message: string;
}

export class DashboardApiEndpoint extends ErrorHandlingEnabledBaseType {
  constructor(private http: HttpClient) {
    super();
  }

  getOccupancy(nursingHomeId: number): Observable<Occupancy> {
    const url = occupancyEndpointUrl.replace('{nursingHomeId}', nursingHomeId.toString());
    return this.http.get<OccupancyResource>(url).pipe(
      map(resource => new Occupancy(resource)),
      catchError(this.handleError(`Failed to fetch occupancy for nursing home ID ${nursingHomeId}`))
    );
  }

  getAlerts(nursingHomeId: number): Observable<MedicationAlert[]> {
    const url = alertsEndpointUrl.replace('{nursingHomeId}', nursingHomeId.toString());
    return this.http.get<MedicationAlertResource[]>(url).pipe(
      map(resources => resources.map(resource => new MedicationAlert(resource))),
      catchError(this.handleError(`Failed to fetch alerts for nursing home ID ${nursingHomeId}`))
    );
  }
}
