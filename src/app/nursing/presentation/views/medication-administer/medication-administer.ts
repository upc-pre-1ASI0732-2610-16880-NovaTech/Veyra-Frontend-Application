import { Component, computed, inject } from '@angular/core';
import { NursingStore } from '../../../application/nursing.store';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdministerMedicationCommand } from '../../../domain/model/administer-medication.command';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { LayoutNursingHome } from '../../../../shared/presentation/components/layout-nursing-home/layout-nursing-home';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { NotificationService } from '../../../../shared/presentation/services/notification.service';

@Component({
  selector: 'app-medication-administer',
  imports: [
    MatCard,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatButton,
    MatInput,
    LayoutNursingHome
  ],
  templateUrl: './medication-administer.html',
  styleUrl: './medication-administer.css'
})
export class MedicationAdminister {
  protected store = inject(NursingStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  residentId: number | null = null;
  nursingHomeId: number = Number(localStorage.getItem('nursingHomeId'));
  submitted = false;

  form = new FormGroup({
    medicationId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    quantity: new FormControl<number | null>(1, { validators: [Validators.required, Validators.min(1)] })
  });

  resident = computed(() => {
    if (!this.residentId) return undefined;
    return this.store.residents().find(r => r.id === this.residentId);
  });

  medications = computed(() => this.store.medications());

  selectedMedication = computed(() => {
    const medicationId = this.form.value.medicationId;
    if (!medicationId) return null;
    return this.medications().find(m => m.id === medicationId) ?? null;
  });

  get loading() {
    return this.store.loading();
  }

  get error() {
    return this.store.error();
  }

  constructor() {
    this.route.params.subscribe(params => {
      this.residentId = +params['id'];
    });
    this.store.loadMedications(this.nursingHomeId);
  }

  submit() {
    if (this.form.invalid || !this.residentId) {
      this.form.markAllAsTouched();
      return;
    }

    const medicationId = this.form.value.medicationId!;
    const quantity = this.form.value.quantity!;
    const residentId = this.residentId;

    this.submitted = false;
    this.store.administerMedication(residentId, medicationId, this.nursingHomeId, new AdministerMedicationCommand({ quantity })).subscribe({
      next: () => {
        this.submitted = true;
        this.notification.showSuccess('Intake registered successfully.');
        this.form.reset({ medicationId: null, quantity: 1 });
      },
      error: () => {
        const message = this.store.error() ?? 'Failed to register medication intake.';
        this.notification.showError(message, () => this.submit());
      }
    });
  }

  onCancel() {
    this.router.navigate(['/nursing/residents']).then();
  }
}
