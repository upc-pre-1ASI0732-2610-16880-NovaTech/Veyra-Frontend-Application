import { Injectable, signal } from '@angular/core';
import { QuestionsApi } from '../infrastructure/questions-api';
import { Question } from '../domain/model/question.entity';
import { QuestionResponse } from '../infrastructure/question-response';

@Injectable({ providedIn: 'root' })
export class QuestionsStore {
  private readonly _questionsSignal = signal<Question[]>([]);
  private readonly _loadingSignal = signal<boolean>(false);
  private readonly _errorSignal = signal<string | null>(null);

  readonly questions = this._questionsSignal.asReadonly();
  readonly loading = this._loadingSignal.asReadonly();
  readonly error = this._errorSignal.asReadonly();

  constructor(private api: QuestionsApi) {}

  loadQuestions(nursingHomeId: number): void {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.getByNursingHome(nursingHomeId).subscribe({
      next: (data) => {
        this._questionsSignal.set(data.map(r => this.toEntity(r)));
        this._loadingSignal.set(false);
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to load questions.');
        this._loadingSignal.set(false);
      }
    });
  }

  answerQuestion(nursingHomeId: number, questionId: number, answer: string): void {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.answerQuestion(nursingHomeId, questionId, answer).subscribe({
      next: (updated) => {
        this._questionsSignal.update(qs =>
          qs.map(q => q.id === updated.id ? this.toEntity(updated) : q)
        );
        this._loadingSignal.set(false);
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to answer question.');
        this._loadingSignal.set(false);
      }
    });
  }

  private toEntity(r: QuestionResponse): Question {
    return new Question(r.id, r.relativeId, r.residentId, r.nursingHomeId, r.body, r.answer, r.status, r.createdAt, r.updatedAt);
  }
}
