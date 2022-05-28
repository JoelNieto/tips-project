import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TypesFormComponent } from '../types-form/types-form.component';

@Component({
  selector: 'tips-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  newType(): void {
    const dialogRef = this.dialog.open(TypesFormComponent, {
      width: '40vw',
    });
  }
}
