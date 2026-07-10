export class MedicationAlert {
  private _medicationId: number;
  private _medicationName: string;
  private _alertType: string;
  private _message: string;

  constructor(alert: {
    medicationId: number;
    medicationName: string;
    alertType: string;
    message: string;
  }) {
    this._medicationId = alert.medicationId;
    this._medicationName = alert.medicationName;
    this._alertType = alert.alertType;
    this._message = alert.message;
  }

  get medicationId(): number {
    return this._medicationId;
  }

  get medicationName(): string {
    return this._medicationName;
  }

  get alertType(): string {
    return this._alertType;
  }

  get message(): string {
    return this._message;
  }
}
