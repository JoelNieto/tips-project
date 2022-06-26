import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Position } from '@tips/data/models';
import { map } from 'rxjs';

import { PositionsFacade } from '../+state/positions/positions.facade';

@Component({
  selector: 'tips-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionsFormComponent implements OnInit {
  form!: FormGroup;
  positions$ = this.store.allPositions$.pipe(
    map((items) => items.filter((x) => x._id !== this.position?._id))
  );
  constructor(
    @Inject(MAT_DIALOG_DATA) public position: Position,
    private readonly _fb: FormBuilder,
    private readonly store: PositionsFacade,
    private readonly dialogRef: MatDialogRef<PositionsFormComponent>
  ) {}

  ngOnInit(): void {
    this.store.selectedCompany.subscribe({
      next: (company) => {
        this.form = this._fb.group({
          name: [this.position?.name ?? '', [Validators.required]],
          code: [this.position?.code ?? '', [Validators.required]],
          company: [company, [Validators.required]],
          parent: [this.position?.parent ?? null, []],
          isPosition: [this.position?.isPosition, []],
        });
      },
    });
  }

  saveChanges() {
    const { value } = this.form;
    if (this.position) {
      this.store.updatePosition(this.position._id, value);
    } else {
      this.store.createPosition(value);
    }

    this.dialogRef.close();
  }

  compareFn = (item1: any, item2: any) =>
    item1 && item2 ? item1._id === item2._id : item1 === item2;
}
