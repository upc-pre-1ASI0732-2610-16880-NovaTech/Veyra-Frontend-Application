import { Routes } from '@angular/router';

const questionList = () =>
  import('./views/question-list/question-list').then(m => m.QuestionList);

const baseTitle = 'Veyra';

export const questionsRoutes: Routes = [
  { path: '', loadComponent: questionList, title: `Family Questions | ${baseTitle}` }
];
