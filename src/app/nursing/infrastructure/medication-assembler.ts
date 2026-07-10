import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Medication} from '../domain/model/medication.entity';
import {MedicationResource, MedicationsResponse} from './medications-response';

export class MedicationAssembler implements BaseAssembler<Medication, MedicationResource, MedicationsResponse> {
  toEntitiesFromResponse(response: MedicationsResponse): Medication[] {
    return response.medication.map(medication => this.toEntityFromResource(medication));
  }

  toEntityFromResource(resource: MedicationResource): Medication {
    return new Medication({
      id: resource.id,
      nursingHomeId: resource.nursingHomeId,
      name: resource.name,
      description: resource.description,
      amount: resource.amount,
      expirationDate: resource.expirationDate,
      drugPresentation: resource.drugPresentation,
      dosage: resource.dosage,
      lot: resource.lot
    });
  }

  toResourceFromEntity(entity: Medication): MedicationResource {
    return {
      id: entity.id,
      nursingHomeId: entity.nursingHomeId,
      name: entity.name,
      description: entity.description,
      amount: entity.amount,
      expirationDate: entity.expirationDate,
      drugPresentation: entity.drugPresentation,
      dosage: entity.dosage,
      lot: entity.lot
    } as MedicationResource;
  }
}
