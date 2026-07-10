import { MedicationAdministration } from '../domain/model/medication-administration.entity';
import { AdministerMedicationCommand } from '../domain/model/administer-medication.command';
import { AdministerMedicationCommandResource, MedicationAdministrationResource } from './medication-administrations-response';

export class MedicationAdministrationAssembler {
  toEntityFromResource(resource: MedicationAdministrationResource): MedicationAdministration {
    return new MedicationAdministration({
      id: resource.id,
      medicationId: resource.medicationId,
      medicationName: resource.medicationName,
      residentId: resource.residentId,
      quantity: resource.quantity,
      administeredAt: resource.administeredAt
    });
  }

  toEntitiesFromResources(resources: MedicationAdministrationResource[]): MedicationAdministration[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}

export class AdministerMedicationCommandAssembler {
  toResourceFromEntity(command: AdministerMedicationCommand): AdministerMedicationCommandResource {
    return {
      quantity: command.quantity
    } as AdministerMedicationCommandResource;
  }
}
