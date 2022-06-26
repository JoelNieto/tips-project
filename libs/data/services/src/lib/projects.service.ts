import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Project } from '@tips/data/models';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private url: string;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {
    this.url = `${config.backendURL}/projects`;
  }

  public getCompanyProjects = (id: string | undefined) =>
    this.http.get<Project[]>(
      `${this.config.backendURL}/companies/${id}/projects`
    );

  public getAll = () => this.http.get<Project[]>(this.url);

  public post = (project: Project) =>
    this.http.post<Project>(this.url, project);

  public patch = (id: string, project: Partial<Project>) =>
    this.http.patch<Project>(`${this.url}/${id}`, project);

  public delete = (id: string) => this.http.delete(`${this.url}/${id}`);
}
