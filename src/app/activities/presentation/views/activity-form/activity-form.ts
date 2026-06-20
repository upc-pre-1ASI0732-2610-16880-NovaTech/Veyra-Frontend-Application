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

  form = new FormGroup({
    name:         new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    activityDate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    startTime:    new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    endTime:      new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    area:         new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    residentId:   new FormControl<number | null>(null, { validators: [Validators.required] }),
    attendantId:  new FormControl<number | null>(null, { validators: [Validators.required] })
  });

  constructor() {
    this.nursingStore.loadResidentsByNursingHome(this.nursingHomeId);
    this.hcmStore.loadStaff(this.nursingHomeId);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.getRawValue();
      const command = new CreateActivityCommand(
        v.name, v.activityDate,
        v.startTime, v.endTime,
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
