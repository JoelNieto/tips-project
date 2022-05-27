import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { AuthEffects } from './+state/auth.effects';
import { AuthFacade } from './+state/auth.facade';
import * as fromAuth from './+state/auth.reducer';
import { SignInComponent } from './components/sign-in/sign-in.component';

const authRoutes: Routes = [
  { path: 'sign-in', component: SignInComponent },
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(authRoutes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    StoreModule.forFeature(fromAuth.AUTH_FEATURE_KEY, fromAuth.reducer),
    EffectsModule.forFeature([AuthEffects]),
    ReactiveFormsModule,
  ],
  declarations: [SignInComponent],
  providers: [AuthFacade],
})
export class AuthModule {}
