import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@tips/app-config';
import { Company } from '@tips/data/models';

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private url: string;
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private config: any
  ) {
    this.url = `${config.backendURL}/companies`;
  }

  public getAll = () => this.http.get<Company[]>(this.url);

  public post = (company: Company) =>
    this.http.post<Company>(this.url, company);

  public patch = (id: string, company: Partial<Company>) =>
    this.http.patch<Company>(`${this.url}/${id}`, company);

  public delete = (id: string) => this.http.delete(`${this.url}/${id}`);
}
