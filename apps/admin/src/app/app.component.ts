import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthFacade } from '@tips/auth';

@Component({
  selector: 'tips-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private http: HttpClient, private auth: AuthFacade) {
    this.auth.loadProfile();
  }
}
