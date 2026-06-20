import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivitiesStore } from '../../../application/activities.store';
import { CreateActivityCommand } from '../../../domain/model/create-activity.command';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './activity-form.html',
  styleUrls: ['./activity-form.css']
})
export class ActivityForm {
  protected store = inject(ActivitiesStore);
  private router = inject(Router);

  nursingHomeId: number = Number(localStorage.getItem('nursingHomeId'));

  form = new FormGroup({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    startTime: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    endTime: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.getRawValue();
      const command = new CreateActivityCommand(v.title, v.description, v.startTime, v.endTime, v.date);
      this.store.addActivity(this.nursingHomeId, command);
      this.router.navigate(['/activities']).then();
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/activities']).then();
  }
}
