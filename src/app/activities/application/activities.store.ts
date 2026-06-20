import { Injectable, signal } from '@angular/core';
import { ActivitiesApi } from '../infrastructure/activities-api';
import { Activity } from '../domain/model/activity.entity';
import { CreateActivityCommand } from '../domain/model/create-activity.command';
import { ActivityResponse } from '../infrastructure/activity-response';

@Injectable({ providedIn: 'root' })
export class ActivitiesStore {
  private readonly _activitiesSignal = signal<Activity[]>([]);
  private readonly _loadingSignal = signal<boolean>(false);
  private readonly _errorSignal = signal<string | null>(null);

  readonly activities = this._activitiesSignal.asReadonly();
  readonly loading = this._loadingSignal.asReadonly();
  readonly error = this._errorSignal.asReadonly();

  constructor(private api: ActivitiesApi) {}

  loadActivities(nursingHomeId: number, date?: string): void {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.getActivities(nursingHomeId, date).subscribe({
      next: (data) => {
        this._activitiesSignal.set(data.map(r => this.toEntity(r)));
        this._loadingSignal.set(false);
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to load activities.');
        this._loadingSignal.set(false);
      }
    });
  }

  addActivity(nursingHomeId: number, command: CreateActivityCommand, onSuccess?: () => void): void {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.createActivity(nursingHomeId, command).subscribe({
      next: () => {
        this.loadActivities(nursingHomeId, command.activityDate);
        if (onSuccess) onSuccess();
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to create activity.');
        this._loadingSignal.set(false);
      }
    });
  }

  private toEntity(r: ActivityResponse): Activity {
    return new Activity(r.activityId, r.hour, r.attendantName, r.activityName, r.areaToDevelop, r.status);
  }
}
