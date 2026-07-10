export class Occupancy {
  private _totalCapacity: number;
  private _occupiedSlots: number;
  private _availableSlots: number;
  private _occupancyRate: number;

  constructor(occupancy: {
    totalCapacity: number;
    occupiedSlots: number;
    availableSlots: number;
    occupancyRate: number;
  }) {
    this._totalCapacity = occupancy.totalCapacity;
    this._occupiedSlots = occupancy.occupiedSlots;
    this._availableSlots = occupancy.availableSlots;
    this._occupancyRate = occupancy.occupancyRate;
  }

  get totalCapacity(): number {
    return this._totalCapacity;
  }

  get occupiedSlots(): number {
    return this._occupiedSlots;
  }

  get availableSlots(): number {
    return this._availableSlots;
  }

  get occupancyRate(): number {
    return this._occupancyRate;
  }
}
