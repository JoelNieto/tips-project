import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tips-new-survey',
  templateUrl: './new-survey.component.html',
  styleUrls: ['./new-survey.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSurveyComponent {}
