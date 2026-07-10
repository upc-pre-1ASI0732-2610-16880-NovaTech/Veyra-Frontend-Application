import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { MedicationAdministration } from '../domain/model/medication-administration.entity';
import { AdministerMedicationCommand } from '../domain/model/administer-medication.command';
import { MedicationAdministrationResource } from './medication-administrations-response';
import { AdministerMedicationCommandAssembler, MedicationAdministrationAssembler } from './medication-administration-assembler';

const medicationAdministrationsEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderMedicationAdministrationsEndpointPath}`;

export class MedicationAdministrationsApiEndpoint extends ErrorHandlingEnabledBaseType {
  private readonly administrationAssembler = new MedicationAdministrationAssembler();
  private readonly administerCommandAssembler = new AdministerMedicationCommandAssembler();

  constructor(private http: HttpClient) {
    super();
  }

  private buildUrl(residentId: number, medicationId: number): string {
    return medicationAdministrationsEndpointUrl
      .replace('{residentId}', residentId.toString())
      .replace('{medicationId}', medicationId.toString());
  }

  /** GET: /api/v1/residents/{residentId}/medications/{medicationId}/administrations */
  getAll(residentId: number, medicationId: number): Observable<MedicationAdministration[]> {
    const url = this.buildUrl(residentId, medicationId);
    return this.http.get<MedicationAdministrationResource[]>(url).pipe(
      map(response => this.administrationAssembler.toEntitiesFromResources(response)),
      catchError(this.handleError('Failed to fetch medication administrations'))
    );
  }

  /** POST: /api/v1/residents/{residentId}/medications/{medicationId}/administrations */
  administer(residentId: number, medicationId: number, command: AdministerMedicationCommand): Observable<void> {
    const resource = this.administerCommandAssembler.toResourceFromEntity(command);
    const url = this.buildUrl(residentId, medicationId);
    return this.http.post<void>(url, resource).pipe(
      catchError(this.handleError('Failed to register medication intake'))
    );
  }
}
