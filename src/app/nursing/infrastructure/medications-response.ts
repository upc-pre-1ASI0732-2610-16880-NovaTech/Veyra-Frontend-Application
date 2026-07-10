import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface MedicationResource extends BaseResource {
  id: number;
  nursingHomeId: number;
  name: string;
  description: string;
  amount: number;
  expirationDate: Date;
  drugPresentation: string;
  dosage: string;
  lot: string;
}

export interface MedicationsResponse extends BaseResponse {
  medication: MedicationResource[];
}
