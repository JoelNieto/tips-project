import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Project } from '@tips/data/models';
import { filter } from 'rxjs';

import { ProjectsFacade } from '../../+state/projects/projects.facade';
import { ProjectsFormComponent } from '../../projects-form/projects-form.component';

@Component({
  selector: 'tips-company-projects',
  templateUrl: './company-projects.component.html',
  styleUrls: ['./company-projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyProjectsComponent implements OnInit {
  dataSource = new MatTableDataSource<Project>();
  constructor(
    private readonly store: ProjectsFacade,
    private readonly dialog: MatDialog
  ) {}

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.store.allProjects$.subscribe({
      next: (projects) => {
        this.dataSource.data = projects;
        this.dataSource.sort = this.sort;
      },
    });
    this.store.selectedCompany$
      .pipe(filter((company) => company !== undefined))
      .subscribe({ next: () => this.store.init() });
  }

  createProject() {
    this.dialog.open(ProjectsFormComponent, { panelClass: 'medium-dialog' });
  }

  editProject(project: Project) {
    this.dialog.open(ProjectsFormComponent, {
      panelClass: 'medium-dialog',
      data: project,
    });
  }
}
