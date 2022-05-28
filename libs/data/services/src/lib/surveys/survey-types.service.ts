import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveyType } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class SurveyTypesService {
  constructor(private readonly http: HttpClient) {}

  public getAll = () => this.http.get<SurveyType[]>('/api/survey-types');
  public post = (type: SurveyType) =>
    this.http.post<SurveyType>('/api/survey-types', type);
}
