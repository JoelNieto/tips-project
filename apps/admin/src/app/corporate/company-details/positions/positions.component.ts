import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Position } from '@tips/data/models';
import { filter } from 'rxjs';

import { PositionsFacade } from '../../+state/positions/positions.facade';
import { PositionsFormComponent } from '../../positions-form/positions-form.component';

@Component({
  selector: 'tips-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionsComponent implements OnInit {
  dataSource = new MatTableDataSource<Position>();
  constructor(
    private readonly store: PositionsFacade,
    private readonly dialog: MatDialog
  ) {}

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.store.allPositions$.subscribe({
      next: (positions) => {
        this.dataSource.data = positions;
        this.dataSource.sort = this.sort;
      },
    });

    this.store.selectedCompany$
      .pipe(filter((company) => company !== undefined))
      .subscribe({ next: () => this.store.init() });
  }

  createPosition() {
    this.dialog.open(PositionsFormComponent, { width: '40vw' });
  }

  editPosition(position: Position) {
    this.dialog.open(PositionsFormComponent, {
      panelClass: 'medium-dialog',
      data: position,
    });
  }
}
