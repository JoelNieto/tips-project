import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SurveyType } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';
import { TypesFormComponent } from '../types-form/types-form.component';

@Component({
  selector: 'tips-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesComponent implements OnInit {
  types$ = this.state.allTypes$;
  displayColumns = [
    'name',
    'prefix',
    'measureName',
    'subMeasureName',
    'createdAt',
    'updatedAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<SurveyType>();
  constructor(
    private dialog: MatDialog,
    private readonly state: SurveysFacade
  ) {}

  ngOnInit(): void {
    this.types$.subscribe({
      next: (types) => {
        this.dataSource.data = types;
      },
    });
    this.state.loadTypes();
  }

  newType(): void {
    this.dialog.open(TypesFormComponent, {
      width: '40vw',
    });
  }

  editType(type: SurveyType): void {
    this.dialog.open(TypesFormComponent, {
      data: type,
      width: '40vw',
    });
  }
}
