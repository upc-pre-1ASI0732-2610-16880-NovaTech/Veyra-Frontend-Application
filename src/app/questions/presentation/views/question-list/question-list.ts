import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsStore } from '../../../application/questions.store';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-list.html',
  styleUrls: ['./question-list.css']
})
export class QuestionList implements OnInit {
  protected store = inject(QuestionsStore);

  nursingHomeId: number = Number(localStorage.getItem('nursingHomeId'));
  answerTexts = signal<Record<number, string>>({});

  ngOnInit(): void {
    this.store.loadQuestions(this.nursingHomeId);
  }

  setAnswer(questionId: number, text: string): void {
    this.answerTexts.update(m => ({ ...m, [questionId]: text }));
  }

  submitAnswer(questionId: number): void {
    const text = this.answerTexts()[questionId];
    if (text?.trim()) {
      this.store.answerQuestion(this.nursingHomeId, questionId, text.trim());
      this.answerTexts.update(m => { const copy = { ...m }; delete copy[questionId]; return copy; });
    }
  }
}
