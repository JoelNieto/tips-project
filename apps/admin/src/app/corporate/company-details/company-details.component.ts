import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CompaniesFacade } from '../+state/companies.facade';

@Component({
  selector: 'tips-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent implements OnInit {
  company$ = this.store.selectedCompanies$;
  constructor(
    private readonly store: CompaniesFacade,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => {
        this.store.selectCompany(params['id']);
      },
    });
  }
}
