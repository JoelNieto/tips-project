import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  types$ = this.state.allTypes$;
  constructor(private readonly state: SurveysFacade) {}

  ngOnInit(): void {}
}
