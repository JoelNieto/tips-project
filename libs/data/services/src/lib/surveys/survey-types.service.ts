import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { SurveyType } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class SurveyTypesService {
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {}

  public getAll = () =>
    this.http.get<SurveyType[]>(`${this.config.backendURL}/survey-types`);
  public post = (type: SurveyType) =>
    this.http.post<SurveyType>(`${this.config.backendURL}/survey-types'`, type);
}
