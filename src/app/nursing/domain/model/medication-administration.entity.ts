export class MedicationAdministration {
  private _id: number;
  private _medicationId: number;
  private _medicationName: string;
  private _residentId: number;
  private _quantity: number;
  private _administeredAt: Date;

  constructor(administration: {
    id: number;
    medicationId: number;
    medicationName: string;
    residentId: number;
    quantity: number;
    administeredAt: Date;
  }) {
    this._id = administration.id;
    this._medicationId = administration.medicationId;
    this._medicationName = administration.medicationName;
    this._residentId = administration.residentId;
    this._quantity = administration.quantity;
    this._administeredAt = administration.administeredAt;
  }

  get id(): number {
    return this._id;
  }

  get medicationId(): number {
    return this._medicationId;
  }

  get medicationName(): string {
    return this._medicationName;
  }

  get residentId(): number {
    return this._residentId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get administeredAt(): Date {
    return this._administeredAt;
  }
}
