import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Survey } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class SurveysService {
  private url: string;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {
    this.url = `${config.backendURL}/surveys`;
  }

  public getAll = () => this.http.get<Survey[]>(this.url);

  public post = (survey: Survey) => this.http.post<Survey>(this.url, survey);

  public patch = (id: string, survey: Survey) =>
    this.http.patch<Survey>(`${this.url}/${id}`, survey);
}
