import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { MetricsApiEndpoint } from './metrics-api-endpoint';
import { DashboardApiEndpoint } from './dashboard-api-endpoint';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApi extends BaseApi {
  private readonly _metricsApiEndpoint: MetricsApiEndpoint;
  private readonly _dashboardApiEndpoint: DashboardApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this._metricsApiEndpoint = new MetricsApiEndpoint(http);
    this._dashboardApiEndpoint = new DashboardApiEndpoint(http);
  }

  getOccupancy(nursingHomeId: number) {
    return this._dashboardApiEndpoint.getOccupancy(nursingHomeId);
  }

  getAlerts(nursingHomeId: number) {
    return this._dashboardApiEndpoint.getAlerts(nursingHomeId);
  }

  getStaffTerminations(nursingHomeId: number, year: number) {
    return this._metricsApiEndpoint.getStaffTerminations(nursingHomeId, year);
  }

  getStaffHires(nursingHomeId: number, year: number) {
    return this._metricsApiEndpoint.getStaffHires(nursingHomeId, year);
  }

  getResidentsAdmissions(nursingHomeId: number, year: number) {
    return this._metricsApiEndpoint.getResidentsAdmissions(nursingHomeId, year);
  }
}
