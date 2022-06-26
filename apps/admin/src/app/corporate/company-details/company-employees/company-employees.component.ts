import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Profile } from '@tips/data/models';
import { filter } from 'rxjs';

import { CompaniesFacade } from '../../+state/companies.facade';
import { EmployeesFacade } from '../../+state/employees/employees.facade';
import { EmployeesFormComponent } from '../../employees-form/employees-form.component';

@Component({
  selector: 'tips-company-employees',
  templateUrl: './company-employees.component.html',
  styleUrls: ['./company-employees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyEmployeesComponent implements OnInit {
  employees$ = this.store.selectedEmployees$;
  dataSource = new MatTableDataSource<Profile>();

  constructor(
    private readonly store: EmployeesFacade,
    private readonly companies: CompaniesFacade,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.allEmployees$.subscribe({
      next: (profiles) => (this.dataSource.data = profiles),
    });

    this.companies.selectedCompanies$
      .pipe(filter((company) => company !== undefined))
      .subscribe({ next: () => this.store.init() });
  }

  createEmployee() {
    this.dialog.open(EmployeesFormComponent, { panelClass: 'large-dialog' });
  }

  editEmployee(employee: Profile) {
    this.dialog.open(EmployeesFormComponent, {
      panelClass: 'large-dialog',
      data: employee,
    });
  }
}
