import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Message } from '@tips/api-interfaces';

@Component({
  selector: 'tips-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  hello$ = this.http.get<Message>('/api/hello');
  constructor(private http: HttpClient) {}
}
