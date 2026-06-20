import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { NursingStore } from '../../../application/nursing.store';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { LayoutNursingHome } from '../../../../shared/presentation/components/layout-nursing-home/layout-nursing-home';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCell, MatCellDef, MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatNoDataRow, MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatError, MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-medical-record-list',
  imports: [
    LayoutNursingHome, MatButton, MatCell, MatCellDef, MatColumnDef,
    MatError, MatFormField, MatHeaderCell, MatHeaderRow, MatHeaderRowDef,
    MatIcon, MatIconButton, MatInput, MatLabel, MatPaginator, MatPrefix,
    MatProgressSpinner, MatRow, MatRowDef, MatSuffix, MatTable,
    TranslatePipe, MatHeaderCellDef, MatNoDataRow
  ],
  templateUrl: './medical-record-list.html',
  styleUrl: './medical-record-list.css'
})
export class MedicalRecordList {
  readonly store = inject(NursingStore);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('allergyPaginator') allergyPaginator!: MatPaginator;

  displayedColumns: string[] = ['allergenName', 'reaction', 'severityLevel', 'typeOfAllergy'];

  residentId = signal<number | null>(null);
  searchTerm = signal('');
  selectedColumn = signal<string>('allergenName');
  sortDirection = signal<'asc' | 'desc'>('asc');

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'] ? +params['id'] : null;
      this.residentId.set(id);
      if (!id) {
        this.router.navigate(['/nursing/residents']).then();
        return;
      }
      this.store.loadAllergies(id);
    });
  }

  filteredAllergies = computed(() => {
    const term = this.removeAccents(this.searchTerm().toLowerCase().trim());
    const col = this.selectedColumn();
    const dir = this.sortDirection();
    let result = this.store.allergies().filter(a => a.residentId === this.residentId());

    if (term) {
      result = result.filter(m =>
        this.removeAccents(m.allergenName?.toLowerCase() || '').startsWith(term)
      );
    }

    return [...result].sort((a, b) => {
      let valA = (a as any)[col];
      let valB = (b as any)[col];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  });

  removeAccents(word: string) {
    return word.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
  }

  toggleSort(col: string) {
    if (this.selectedColumn() === col) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.selectedColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  navigateToNew(id: number) {
    this.router.navigate(['/nursing/residents', id, 'allergies', 'new']).then();
  }

  goBack() {
    this.router.navigate(['/nursing/residents', this.residentId(), 'show']).then();
  }
}
