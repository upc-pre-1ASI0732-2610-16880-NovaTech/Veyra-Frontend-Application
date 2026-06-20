import { Routes } from '@angular/router';

const activityList = () =>
  import('./views/activity-list/activity-list').then(m => m.ActivityList);
const activityForm = () =>
  import('./views/activity-form/activity-form').then(m => m.ActivityForm);

const baseTitle = 'Veyra';

export const activitiesRoutes: Routes = [
  { path: '', loadComponent: activityList, title: `Activities | ${baseTitle}` },
  { path: 'new', loadComponent: activityForm, title: `New Activity | ${baseTitle}` }
];
