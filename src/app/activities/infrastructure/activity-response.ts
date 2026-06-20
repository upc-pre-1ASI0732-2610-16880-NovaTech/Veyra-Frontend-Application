export interface ActivityResponse {
  activityId: number;
  hour: string;
  attendantName: string;
  activityName: string;
  areaToDevelop: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
