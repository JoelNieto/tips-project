import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent implements OnInit {
  survey$ = this.store.selectedSurveys$;
  constructor(
    private store: SurveysFacade,
    private route: ActivatedRoute,
    private readonly title: Title
  ) {}

  @ViewChild(MatAccordion) accordion!: MatAccordion;

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => this.store.setSurvey(params['id']),
    });

    this.survey$.subscribe({
      next: (survey) => [this.title.setTitle(survey?.title ?? '')],
    });
  }
}
