import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Survey } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {
  dataSource = new MatTableDataSource<Survey>();
  constructor(private readonly store: SurveysFacade) {}

  ngOnInit(): void {
    this.store.allSurveys$.subscribe({
      next: (surveys) => (this.dataSource.data = surveys),
    });
  }
}
