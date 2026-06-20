export class CreateActivityCommand {
  constructor(
    public title: string,
    public description: string,
    public startTime: string,
    public endTime: string,
    public date: string
  ) {}
}
