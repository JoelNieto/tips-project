import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';

import { CompaniesFormComponent } from './companies-form/companies-form.component';
import { CompaniesComponent } from './companies/companies.component';
import { CorporateRoutingModule } from './corporate-routing.module';
import { CorporateComponent } from './corporate.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    CorporateComponent,
    HomeComponent,
    CompaniesComponent,
    CompaniesFormComponent,
  ],
  imports: [
    CommonModule,
    CorporateRoutingModule,
    MatTabsModule,
    TranslateModule,
  ],
})
export class CorporateModule {}
