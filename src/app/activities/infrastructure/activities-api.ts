import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivitiesApiEndpoint } from './activities-api-endpoint';
import { ActivityResponse } from './activity-response';
import { CreateActivityCommand } from '../domain/model/create-activity.command';

@Injectable({ providedIn: 'root' })
export class ActivitiesApi {
  private endpoint: ActivitiesApiEndpoint;

  constructor(http: HttpClient) {
    this.endpoint = new ActivitiesApiEndpoint(http);
  }

  getActivities(nursingHomeId: number, date?: string): Observable<ActivityResponse[]> {
    return this.endpoint.getAll(nursingHomeId, date);
  }

  createActivity(nursingHomeId: number, command: CreateActivityCommand): Observable<number> {
    return this.endpoint.create(nursingHomeId, {
      name: command.name,
      activityPeriod: {
        activityDate: command.activityDate,
        startTime: command.startTime,
        endTime: command.endTime
      },
      area: command.area,
      residentId: command.residentId,
      attendantId: command.attendantId
    });
  }
}
