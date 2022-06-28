import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Login, User } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {}

  public login = (login: Login) =>
    this.http.post<{ token: string }>(
      `${this.config.backendURL}/auth/login`,
      login
    );

  public getProfile = () =>
    this.http.get<User>(`${this.config.backendURL}/auth/profile`);
}
