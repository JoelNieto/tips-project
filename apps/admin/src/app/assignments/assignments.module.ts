import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarModule } from 'angular-calendar';

import { AssignmentsEffects } from './+state/assignments.effects';
import { AssignmentsFacade } from './+state/assignments.facade';
import * as fromAssignments from './+state/assignments.reducer';
import { AssignmentsRoutingModule } from './assignments-routing.module';
import { AssignmentsComponent } from './assignments.component';
import { HomeComponent } from './home/home.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { AssignmentDetailsComponent } from './assignment-details/assignment-details.component';

@NgModule({
  declarations: [
    AssignmentsComponent,
    HomeComponent,
    ScheduleComponent,
    AssignmentDetailsComponent,
  ],
  imports: [
    CommonModule,
    AssignmentsRoutingModule,
    TranslateModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    CalendarModule,
    FormsModule,
    StoreModule.forFeature(
      fromAssignments.ASSIGNMENTS_FEATURE_KEY,
      fromAssignments.reducer
    ),
    EffectsModule.forFeature([AssignmentsEffects]),
  ],
  providers: [AssignmentsFacade],
})
export class AssignmentsModule {}
