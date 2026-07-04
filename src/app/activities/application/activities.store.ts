import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
    console.log('[ActivityForm] Enviando al API:', { nursingHomeId, ...command });
    this.api.createActivity(nursingHomeId, command).subscribe({
      next: () => {
        this.loadActivities(nursingHomeId, command.activityDate);
        if (onSuccess) onSuccess();
      },
      error: (e: HttpErrorResponse) => {
        const body = e.error;
        let msg: string;
        if (typeof body === 'string') {
          msg = body;
        } else if (body?.message) {
          msg = body.message;
        } else if (body?.detail) {
          msg = body.detail;
        } else if (body?.errors) {
          msg = JSON.stringify(body.errors);
        } else {
          msg = `Error ${e.status}: ${e.statusText}`;
        }
        this._errorSignal.set(msg);
        this._loadingSignal.set(false);
      }
    });
  }

  private toEntity(r: ActivityResponse): Activity {
    return new Activity(r.activityId, r.hour, r.attendantName, r.activityName, r.areaToDevelop, r.status);
  }
}
