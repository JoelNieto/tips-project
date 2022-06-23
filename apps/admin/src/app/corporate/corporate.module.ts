import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { CompaniesEffects } from './+state/companies.effects';
import { CompaniesFacade } from './+state/companies.facade';
import * as fromCompanies from './+state/companies.reducer';
import { CompaniesFormComponent } from './companies-form/companies-form.component';
import { CompaniesComponent } from './companies/companies.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { CorporateRoutingModule } from './corporate-routing.module';
import { CorporateComponent } from './corporate.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    CorporateComponent,
    HomeComponent,
    CompaniesComponent,
    CompaniesFormComponent,
    CompanyDetailsComponent,
  ],
  imports: [
    CommonModule,
    CorporateRoutingModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule,
    TranslateModule,
    StoreModule.forFeature(
      fromCompanies.COMPANIES_FEATURE_KEY,
      fromCompanies.reducer
    ),
    EffectsModule.forFeature([CompaniesEffects]),
  ],
  providers: [CompaniesFacade],
})
export class CorporateModule {}
