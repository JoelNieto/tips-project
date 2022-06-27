import { Component, OnInit } from '@angular/core';

import { CompaniesFacade } from './+state/companies.facade';
import { ProjectsFacade } from './+state/projects/projects.facade';

@Component({
  selector: 'tips-corporate',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.scss'],
})
export class CorporateComponent implements OnInit {
  constructor(
    private readonly store: CompaniesFacade,
    private readonly projects: ProjectsFacade
  ) {}

  ngOnInit(): void {
    this.store.init();
    this.projects.init();
  }
}
