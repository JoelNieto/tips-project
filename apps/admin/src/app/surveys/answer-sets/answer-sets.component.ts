import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AnswersSet } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-answer-sets',
  templateUrl: './answer-sets.component.html',
  styleUrls: ['./answer-sets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerSetsComponent implements OnInit {
  sets$ = this.state.allAnswers$;

  dataSource = new MatTableDataSource<AnswersSet>();

  constructor(private readonly state: SurveysFacade) {}

  ngOnInit(): void {
    this.sets$.subscribe({ next: (sets) => (this.dataSource.data = sets) });
    this.state.loadAnswers();
  }
}
