export class AdministerMedicationCommand {
  private _quantity: number;

  constructor(command: { quantity: number }) {
    this._quantity = command.quantity;
  }

  get quantity(): number {
    return this._quantity;
  }

  set quantity(value: number) {
    this._quantity = value;
  }
}
