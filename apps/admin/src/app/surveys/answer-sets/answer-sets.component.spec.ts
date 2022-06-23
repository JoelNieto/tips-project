import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerSetsComponent } from './answer-sets.component';

describe('AnswerSetsComponent', () => {
  let component: AnswerSetsComponent;
  let fixture: ComponentFixture<AnswerSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerSetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
