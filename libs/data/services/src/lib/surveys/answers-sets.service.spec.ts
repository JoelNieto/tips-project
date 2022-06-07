import { TestBed } from '@angular/core/testing';

import { AnswersSetsService } from './answers-sets.service';

describe('AnswersSetsService', () => {
  let service: AnswersSetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnswersSetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
