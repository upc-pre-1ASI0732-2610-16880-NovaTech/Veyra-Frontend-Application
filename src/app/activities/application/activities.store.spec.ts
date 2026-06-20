import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivitiesStore } from './activities.store';
import { ActivitiesApi } from '../infrastructure/activities-api';
import { ActivityResponse } from '../infrastructure/activity-response';
import { CreateActivityCommand } from '../domain/model/create-activity.command';

const makeResponse = (overrides: Partial<ActivityResponse> = {}): ActivityResponse => ({
  activityId: 1,
  hour: '09:00',
  attendantName: 'Dr. Smith',
  activityName: 'Morning Exercise',
  areaToDevelop: 'Physical',
  status: 'PENDING',
  ...overrides
});

const makeCommand = (): CreateActivityCommand => new CreateActivityCommand(
  'Morning Exercise', '2026-06-20', '09:00:00', '10:00:00', 'Physical', 1, 2
);

describe('ActivitiesStore', () => {
  let store: ActivitiesStore;
  let api: jasmine.SpyObj<ActivitiesApi>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ActivitiesApi', ['getActivities', 'createActivity']);

    TestBed.configureTestingModule({
      providers: [ActivitiesStore, { provide: ActivitiesApi, useValue: api }]
    });

    store = TestBed.inject(ActivitiesStore);
  });

  // ─── Initial state ───────────────────────────────────────────────────────────
  it('starts with empty activities, no error, not loading', () => {
    expect(store.activities()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  // ─── loadActivities ──────────────────────────────────────────────────────────
  describe('loadActivities()', () => {
    it('maps API response to Activity entities', () => {
      api.getActivities.and.returnValue(of([makeResponse({ activityId: 5, activityName: 'Yoga' })]));

      store.loadActivities(1, '2026-06-20');

      expect(store.activities().length).toBe(1);
      expect(store.activities()[0].activityId).toBe(5);
      expect(store.activities()[0].activityName).toBe('Yoga');
    });

    it('sets loading to false after success', () => {
      api.getActivities.and.returnValue(of([]));
      store.loadActivities(1);
      expect(store.loading()).toBeFalse();
    });

    it('passes nursingHomeId and date to the API', () => {
      api.getActivities.and.returnValue(of([]));

      store.loadActivities(42, '2026-06-20');

      expect(api.getActivities).toHaveBeenCalledWith(42, '2026-06-20');
    });

    it('clears previous activities on each load', () => {
      api.getActivities.and.returnValue(of([makeResponse(), makeResponse({ activityId: 2 })]));
      store.loadActivities(1);
      api.getActivities.and.returnValue(of([makeResponse({ activityId: 3 })]));
      store.loadActivities(1);

      expect(store.activities().length).toBe(1);
      expect(store.activities()[0].activityId).toBe(3);
    });

    it('sets error signal on API failure', () => {
      api.getActivities.and.returnValue(throwError(() => new Error('Network error')));

      store.loadActivities(1);

      expect(store.error()).toBe('Network error');
      expect(store.loading()).toBeFalse();
    });

    it('clears error before each new load attempt', () => {
      api.getActivities.and.returnValue(throwError(() => new Error('fail')));
      store.loadActivities(1);
      api.getActivities.and.returnValue(of([makeResponse()]));
      store.loadActivities(1);

      expect(store.error()).toBeNull();
    });

    it('maps all fields from ActivityResponse correctly', () => {
      const response = makeResponse({
        activityId: 7, hour: '14:30', attendantName: 'Nurse Ana',
        activityName: 'Painting', areaToDevelop: 'Cognitive', status: 'COMPLETED'
      });
      api.getActivities.and.returnValue(of([response]));

      store.loadActivities(1);

      const a = store.activities()[0];
      expect(a.hour).toBe('14:30');
      expect(a.attendantName).toBe('Nurse Ana');
      expect(a.areaToDevelop).toBe('Cognitive');
      expect(a.status).toBe('COMPLETED');
    });
  });

  // ─── addActivity ─────────────────────────────────────────────────────────────
  describe('addActivity()', () => {
    it('calls onSuccess callback after successful creation', () => {
      api.createActivity.and.returnValue(of(1));
      api.getActivities.and.returnValue(of([]));
      const onSuccess = jasmine.createSpy('onSuccess');

      store.addActivity(1, makeCommand(), onSuccess);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('reloads activities for the same nursingHomeId after creation', () => {
      api.createActivity.and.returnValue(of(42));
      api.getActivities.and.returnValue(of([]));

      store.addActivity(7, makeCommand());

      expect(api.getActivities).toHaveBeenCalledWith(7, jasmine.any(String));
    });

    it('sets error signal and does not call onSuccess on API failure', () => {
      api.createActivity.and.returnValue(throwError(() => new Error('Creation failed')));
      const onSuccess = jasmine.createSpy('onSuccess');

      store.addActivity(1, makeCommand(), onSuccess);

      expect(store.error()).toBe('Creation failed');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('sets loading to false on API failure', () => {
      api.createActivity.and.returnValue(throwError(() => new Error('fail')));

      store.addActivity(1, makeCommand());

      expect(store.loading()).toBeFalse();
    });
  });
});
