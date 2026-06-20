export class Question {
  constructor(
    public id: number,
    public relativeId: number,
    public residentId: number,
    public nursingHomeId: number,
    public body: string,
    public answer: string | null,
    public status: 'PENDING' | 'ANSWERED',
    public createdAt: string,
    public updatedAt: string
  ) {}
}
