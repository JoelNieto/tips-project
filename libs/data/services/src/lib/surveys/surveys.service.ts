import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Survey } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class SurveysService {
  constructor(private readonly http: HttpClient) {}

  public getAll = () => this.http.get<Survey[]>('/api/surveys');
}
