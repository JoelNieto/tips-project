import { Component, OnInit } from '@angular/core';

import { CompaniesFacade } from './+state/companies.facade';

@Component({
  selector: 'tips-corporate',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.scss'],
})
export class CorporateComponent implements OnInit {
  constructor(private readonly store: CompaniesFacade) {}

  ngOnInit(): void {
    this.store.init();
  }
}
