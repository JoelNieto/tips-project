import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { CompaniesFacade } from '../+state/companies.facade';

@Component({
  selector: 'tips-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
  company$ = this.store.selectedCompanies$;
  subscription$ = new Subscription();
  constructor(
    private readonly store: CompaniesFacade,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription$.add(
      this.route.params.subscribe({
        next: (params) => {
          this.store.selectCompany(params['id']);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
    this.store.selectCompany(undefined);
  }
}
