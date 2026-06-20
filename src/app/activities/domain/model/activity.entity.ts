export class Activity {
  constructor(
    public activityId: number,
    public hour: string,
    public attendantName: string,
    public activityName: string,
    public areaToDevelop: string,
    public status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  ) {}
}
