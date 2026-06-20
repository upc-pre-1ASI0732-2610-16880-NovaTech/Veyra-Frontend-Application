export interface QuestionResponse {
  id: number;
  relativeId: number;
  residentId: number;
  nursingHomeId: number;
  body: string;
  answer: string | null;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  updatedAt: string;
}
