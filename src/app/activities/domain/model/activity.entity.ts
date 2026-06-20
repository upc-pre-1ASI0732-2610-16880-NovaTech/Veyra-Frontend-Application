export class Activity {
  constructor(
    public id: number,
    public nursingHomeId: number,
    public title: string,
    public description: string,
    public startTime: string,
    public endTime: string,
    public date: string
  ) {}
}
