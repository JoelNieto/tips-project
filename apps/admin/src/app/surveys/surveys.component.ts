import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Survey } from '@tips/data/models';

import { SurveysFacade } from './+state/surveys.facade';

@Component({
  selector: 'tips-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
})
export class SurveysComponent implements OnInit {
  dataSource = new MatTableDataSource<Survey>();
  constructor(private readonly store: SurveysFacade) {}

  ngOnInit(): void {
    this.store.init();
    this.store.allSurveys$.subscribe((surveys) => {
      this.dataSource.data = surveys;
    });
  }
}
