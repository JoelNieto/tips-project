import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Profile } from '@tips/data/models';

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private url: string;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {
    this.url = `${config.backendURL}/profiles`;
  }

  public getCompanyProfiles = (id: string | undefined) =>
    this.http.get<Profile[]>(
      `${this.config.backendURL}/companies/${id}/profiles`
    );

  public getAll = () => this.http.get<Profile[]>(this.url);

  public post = (profile: Profile) =>
    this.http.post<Profile>(this.url, profile);

  public patch = (id: string, profile: Partial<Profile>) =>
    this.http.patch<Profile>(`${this.url}/${id}`, profile);

  public delete = (id: string) => this.http.delete(`${this.url}/${id}`);
}
