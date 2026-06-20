export class CreateActivityCommand {
  constructor(
    public name: string,
    public activityDate: string,
    public startTime: string,
    public endTime: string,
    public area: string,
    public residentId: number,
    public attendantId: number
  ) {}
}
