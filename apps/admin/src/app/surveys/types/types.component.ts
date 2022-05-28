import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
  constructor(
    private dialog: MatDialog,
    private readonly state: SurveysFacade
  ) {}

  ngOnInit(): void {
    this.state.loadTypes();
  }

  newType(): void {
    const dialogRef = this.dialog.open(TypesFormComponent, {
      width: '40vw',
    });
  }
}
