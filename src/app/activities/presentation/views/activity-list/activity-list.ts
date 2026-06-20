import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivitiesStore } from '../../../application/activities.store';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-list.html',
  styleUrls: ['./activity-list.css']
})
export class ActivityList implements OnInit {
  protected store = inject(ActivitiesStore);
  private router = inject(Router);

  nursingHomeId: number = Number(localStorage.getItem('nursingHomeId'));
  selectedDate: string = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.loadForDate();
  }

  loadForDate(): void {
    this.store.loadActivities(this.nursingHomeId, this.selectedDate);
  }

  navigateToCreate(): void {
    this.router.navigate(['/activities/new']).then();
  }
}
