import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CalendarView, DAYS_OF_WEEK } from 'angular-calendar';

@Component({
  selector: 'tips-project-schedule',
  templateUrl: './project-schedule.component.html',
  styleUrls: ['./project-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectScheduleComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  viewDate: Date = new Date();

  weekStartsOn = DAYS_OF_WEEK.SUNDAY;

  constructor() {}

  ngOnInit(): void {}

  setView(view: CalendarView) {
    this.view = view;
  }
}
