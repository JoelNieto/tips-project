import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Assignment } from '@tips/data/models';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import { map, Observable } from 'rxjs';

import { AssignmentsFacade } from '../+state/assignments.facade';

@Component({
  selector: 'tips-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events$!: Observable<CalendarEvent<{ assignment: Assignment }>[]>;
  activeDayIsOpen = false;

  constructor(
    private readonly state: AssignmentsFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents() {
    this.events$ = this.state.allAssignments$.pipe(
      map((res) =>
        res.map((assignment) => ({
          id: assignment._id,
          title: assignment.title,
          allDay: true,
          start: new Date(assignment.startDate),
          end: assignment.endDate
            ? new Date(assignment.endDate)
            : new Date(assignment.startDate),
          meta: {
            assignment,
          },
        }))
      )
    );
  }

  dayClicked({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent<{ assignment: Assignment }>[];
  }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  eventClicked(event: CalendarEvent) {
    this.router.navigate([event.id], { relativeTo: this.route });
  }
}
