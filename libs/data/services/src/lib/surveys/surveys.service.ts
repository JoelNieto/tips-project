import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Survey } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class SurveysService {
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {}

  public getAll = () =>
    this.http.get<Survey[]>(`${this.config.backendURL}/surveys`);
}
