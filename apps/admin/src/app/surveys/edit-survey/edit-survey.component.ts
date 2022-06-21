import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-edit-survey',
  templateUrl: './edit-survey.component.html',
  styleUrls: ['./edit-survey.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSurveyComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private readonly state: SurveysFacade
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => this.state.setSurvey(params['id']),
    });
  }
}