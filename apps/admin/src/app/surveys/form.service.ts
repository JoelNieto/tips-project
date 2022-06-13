import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class FormService {
  public newQuestion = new Subject<number>();
  public removeQuestion = new Subject<{ measure: number; index: number }>();
}
