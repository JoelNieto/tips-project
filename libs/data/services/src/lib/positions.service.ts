import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Position } from '@tips/data/models';

@Injectable({ providedIn: 'root' })
export class PositionsService {
  private url: string;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {
    this.url = `${config.backendURL}/positions`;
  }

  public getCompanyPositions = (id: string | undefined) =>
    this.http.get<Position[]>(
      `${this.config.backendURL}/companies/${id}/positions`
    );

  public getAll = () => this.http.get<Position[]>(this.url);

  public post = (position: Position) =>
    this.http.post<Position>(this.url, position);

  public patch = (id: string, position: Partial<Position>) =>
    this.http.patch<Position>(`${this.url}/${id}`, position);

  public delete = (id: string) => this.http.delete(`${this.url}/${id}`);
}
