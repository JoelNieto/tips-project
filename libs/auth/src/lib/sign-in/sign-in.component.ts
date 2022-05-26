import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthFacade } from '../+state/auth.facade';

@Component({
  selector: 'tips-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  constructor(
    private readonly facade: AuthFacade,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.facade.init();
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  login(): void {
    this.facade.login(this.form.value);
  }
}
