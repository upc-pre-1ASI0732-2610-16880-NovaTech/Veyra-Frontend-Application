export class CreateMedicationCommand {
  private _name: string;
  private _description: string;
  private _amount: number;
  private _expirationDate: string;
  private _drugPresentation: string;
  private _dosage: string;
  private _lot: string;

  constructor(medicationCommand: {
    name: string;
    description: string;
    amount: number;
    expirationDate: string;
    drugPresentation: string;
    dosage: string;
    lot: string;
  }) {
    this._name = medicationCommand.name;
    this._description = medicationCommand.description;
    this._amount = medicationCommand.amount;
    this._expirationDate = medicationCommand.expirationDate;
    this._drugPresentation = medicationCommand.drugPresentation;
    this._dosage = medicationCommand.dosage;
    this._lot = medicationCommand.lot;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = value;
  }

  get expirationDate(): string {
    return this._expirationDate;
  }

  set expirationDate(value: string) {
    this._expirationDate = value;
  }

  get drugPresentation(): string {
    return this._drugPresentation;
  }

  set drugPresentation(value: string) {
    this._drugPresentation = value;
  }

  get dosage(): string {
    return this._dosage;
  }

  set dosage(value: string) {
    this._dosage = value;
  }

  get lot(): string {
    return this._lot;
  }

  set lot(value: string) {
    this._lot = value;
  }
}
