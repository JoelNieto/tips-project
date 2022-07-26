import { Component, OnInit } from '@angular/core';

import { SurveysFacade } from './+state/surveys.facade';

@Component({
  selector: 'tips-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
})
export class SurveysComponent implements OnInit {
  constructor(private readonly store: SurveysFacade) {}

  ngOnInit(): void {
    this.store.init();
  }
}
