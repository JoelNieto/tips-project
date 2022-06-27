import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyProjectsComponent } from './company-projects.component';

describe('ProjectsComponent', () => {
  let component: CompanyProjectsComponent;
  let fixture: ComponentFixture<CompanyProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanyProjectsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
