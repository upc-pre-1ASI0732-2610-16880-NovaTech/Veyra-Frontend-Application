export interface MedicationAdministrationResource {
  id: number;
  medicationId: number;
  medicationName: string;
  residentId: number;
  quantity: number;
  administeredAt: Date;
}

export interface AdministerMedicationCommandResource {
  quantity: number;
}
