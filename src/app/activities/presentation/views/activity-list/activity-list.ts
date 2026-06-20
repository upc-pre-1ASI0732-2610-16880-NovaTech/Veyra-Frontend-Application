import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { LayoutNursingHome } from '../../../../shared/presentation/components/layout-nursing-home/layout-nursing-home';
import { ActivitiesStore } from '../../../application/activities.store';
import { StatusTranslatePipe } from '../../../../shared/presentation/pipes/status-translate.pipe';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe, StatusTranslatePipe,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCardModule, MatProgressSpinnerModule, MatChipsModule,
    LayoutNursingHome
  ],
  templateUrl: './activity-list.html',
  styleUrls: ['./activity-list.css']
})
export class ActivityList implements OnInit {
  protected store = inject(ActivitiesStore);
  private router  = inject(Router);

  nursingHomeId    = Number(localStorage.getItem('nursingHomeId'));
  selectedDate     = new Date().toISOString().slice(0, 10);
  displayedColumns = ['hour', 'activityName', 'areaToDevelop', 'attendantName', 'status'];

  ngOnInit(): void { this.loadForDate(); }

  loadForDate(): void {
    this.store.loadActivities(this.nursingHomeId, this.selectedDate);
  }

  navigateToCreate(): void {
    this.router.navigate(['/activities/new']).then();
  }
}
