import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Company } from '@tips/data/models';
import { Subscription } from 'rxjs';

import { CompaniesFacade } from '../+state/companies.facade';
import { CompaniesFormComponent } from '../companies-form/companies-form.component';

@Component({
  selector: 'tips-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesComponent implements OnInit, OnDestroy {
  companies$ = this.store.allCompanies$;
  dataSource = new MatTableDataSource<Company>();
  subscription$ = new Subscription();
  constructor(
    private readonly store: CompaniesFacade,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscription$.add(
      this.store.allCompanies$.subscribe({
        next: (companies) => (this.dataSource.data = companies),
      })
    );
  }

  createCompany() {
    this.dialog.open(CompaniesFormComponent, { panelClass: 'medium-dialog' });
  }

  editCompany(company: Company) {
    this.dialog.open(CompaniesFormComponent, {
      data: company,
      panelClass: 'medium-dialog',
    });
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
