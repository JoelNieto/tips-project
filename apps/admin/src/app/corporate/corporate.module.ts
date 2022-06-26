import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { CompaniesEffects } from './+state/companies.effects';
import { CompaniesFacade } from './+state/companies.facade';
import * as fromCompanies from './+state/companies.reducer';
import { EmployeesEffects } from './+state/employees/employees.effects';
import { EmployeesFacade } from './+state/employees/employees.facade';
import * as fromEmployees from './+state/employees/employees.reducer';
import { PositionsEffects } from './+state/positions/positions.effects';
import { PositionsFacade } from './+state/positions/positions.facade';
import * as fromPositions from './+state/positions/positions.reducer';
import { CompaniesFormComponent } from './companies-form/companies-form.component';
import { CompaniesComponent } from './companies/companies.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { CompanyEmployeesComponent } from './company-details/company-employees/company-employees.component';
import { PositionsComponent } from './company-details/positions/positions.component';
import { CorporateRoutingModule } from './corporate-routing.module';
import { CorporateComponent } from './corporate.component';
import { EmployeesFormComponent } from './employees-form/employees-form.component';
import { HomeComponent } from './home/home.component';
import { PositionsFormComponent } from './positions-form/positions-form.component';

@NgModule({
  declarations: [
    CorporateComponent,
    HomeComponent,
    CompaniesComponent,
    CompanyEmployeesComponent,
    CompaniesFormComponent,
    CompanyDetailsComponent,
    PositionsComponent,
    PositionsFormComponent,
    EmployeesFormComponent,
  ],
  imports: [
    CommonModule,
    CorporateRoutingModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
    MatSortModule,
    ReactiveFormsModule,
    TranslateModule,
    StoreModule.forFeature(
      fromCompanies.COMPANIES_FEATURE_KEY,
      fromCompanies.reducer
    ),
    EffectsModule.forFeature([CompaniesEffects]),
    StoreModule.forFeature(
      fromEmployees.EMPLOYEES_FEATURE_KEY,
      fromEmployees.reducer
    ),
    EffectsModule.forFeature([EmployeesEffects]),
    StoreModule.forFeature(
      fromPositions.POSITIONS_FEATURE_KEY,
      fromPositions.reducer
    ),
    EffectsModule.forFeature([PositionsEffects]),
  ],
  providers: [CompaniesFacade, EmployeesFacade, PositionsFacade],
})
export class CorporateModule {}
