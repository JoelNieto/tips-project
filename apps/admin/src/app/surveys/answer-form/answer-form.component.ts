import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tips-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: ['./answer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerFormComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
