import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'tips-companies-form',
  templateUrl: './companies-form.component.html',
  styleUrls: ['./companies-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesFormComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
