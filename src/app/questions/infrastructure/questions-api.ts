import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuestionResponse } from './question-response';

const base = environment.platformProviderApiBaseUrl;

@Injectable({ providedIn: 'root' })
export class QuestionsApi {
  constructor(private http: HttpClient) {}

  getByNursingHome(nursingHomeId: number): Observable<QuestionResponse[]> {
    const url = `${base}${environment.platformProviderNursingHomeQuestionsEndpointPath}`.replace('{nursingHomeId}', nursingHomeId.toString());
    return this.http.get<QuestionResponse[]>(url);
  }

  answerQuestion(nursingHomeId: number, questionId: number, answer: string): Observable<QuestionResponse> {
    const url = `${base}${environment.platformProviderNursingHomeQuestionsEndpointPath}/${questionId}/answer`.replace('{nursingHomeId}', nursingHomeId.toString());
    return this.http.patch<QuestionResponse>(url, { answer });
  }
}
