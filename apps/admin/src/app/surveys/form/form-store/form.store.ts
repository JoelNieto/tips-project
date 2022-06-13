import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Survey } from '@tips/data/models';

export interface FormStoreState {
  current: undefined | Survey;
  id: undefined | string;
}

const initialState: FormStoreState = {
  current: undefined,
  id: undefined,
};

@Injectable()
export class FormStore extends ComponentStore<FormStoreState> {
  survey$ = this.select((state) => state.current);
  constructor() {
    super(initialState);
  }
}
