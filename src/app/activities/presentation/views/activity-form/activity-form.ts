import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { LayoutNursingHome } from '../../../../shared/presentation/components/layout-nursing-home/layout-nursing-home';
import { ActivitiesStore } from '../../../application/activities.store';
import { CreateActivityCommand } from '../../../domain/model/create-activity.command';
import { NursingStore } from '../../../../nursing/application/nursing.store';
import { HcmStore } from '../../../../hcm/application/hcm.store';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslatePipe,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule,
    LayoutNursingHome
  ],
  templateUrl: './activity-form.html',
  styleUrls: ['./activity-form.css']
})
export class ActivityForm {
  protected store        = inject(ActivitiesStore);
  protected nursingStore = inject(NursingStore);
  protected hcmStore     = inject(HcmStore);
  private router         = inject(Router);

  nursingHomeId = Number(localStorage.getItem('nursingHomeId'));

  hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minutes = ['00', '15', '30', '45'];

  form = new FormGroup({
    name:        new FormControl<string>('',     { nonNullable: true, validators: [Validators.required] }),
    activityDate:new FormControl<Date | null>(null, { validators: [Validators.required] }),
    startHour:   new FormControl<string>('',     { nonNullable: true, validators: [Validators.required] }),
    startMinute: new FormControl<string>('00',   { nonNullable: true, validators: [Validators.required] }),
    endHour:     new FormControl<string>('',     { nonNullable: true, validators: [Validators.required] }),
    endMinute:   new FormControl<string>('00',   { nonNullable: true, validators: [Validators.required] }),
    area:        new FormControl<string>('',     { nonNullable: true, validators: [Validators.required] }),
    residentId:  new FormControl<number | null>(null, { validators: [Validators.required] }),
    attendantId: new FormControl<number | null>(null, { validators: [Validators.required] })
  });

  constructor() {
    this.nursingStore.loadResidentsByNursingHome(this.nursingHomeId);
    this.hcmStore.loadStaff(this.nursingHomeId);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.getRawValue();
      const activityDate = this.formatDate(v.activityDate!);
      const startTime    = `${v.startHour}:${v.startMinute}`;
      const endTime      = `${v.endHour}:${v.endMinute}`;

      const command = new CreateActivityCommand(
        v.name, activityDate,
        startTime, endTime,
        v.area, v.residentId!, v.attendantId!
      );
      this.store.addActivity(this.nursingHomeId, command, () => {
        this.router.navigate(['/activities']).then();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void { this.router.navigate(['/activities']).then(); }
}
