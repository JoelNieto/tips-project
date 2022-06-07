import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { AnswersSet } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class AnswersSetsService {
  api = `${this.config.backendURL}/answer-sets`;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {}

  public getAll = () => this.http.get<AnswersSet[]>(this.api);
  public post = (set: AnswersSet) => this.http.post<AnswersSet>(this.api, set);

  public update = (id: string, type: Partial<AnswersSet>) =>
    this.http.patch<AnswersSet>(`${this.api}/${id}`, type);
}
