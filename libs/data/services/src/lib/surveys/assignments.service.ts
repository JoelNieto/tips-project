import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Assignment } from '@tips/data/models';

@Injectable({ providedIn: 'root' })
export class AssignmentsService {
  api = `${this.config.backendURL}/assignments`;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {}

  public getAll = () => this.http.get<Assignment[]>(this.api);

  public post = (assignment: Assignment) =>
    this.http.post<Assignment>(this.api, assignment);

  public update = (id: string, assignment: Partial<Assignment>) =>
    this.http.patch<Assignment>(`${this.api}/${id}`, assignment);
}
