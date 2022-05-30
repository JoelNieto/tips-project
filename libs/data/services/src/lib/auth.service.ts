import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login, User } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  public login = (login: Login) =>
    this.http.post<{ access_token: string }>(`/api/auth/login`, login);

  public getProfile = () => this.http.get<User>('/api/auth/profile');
}
