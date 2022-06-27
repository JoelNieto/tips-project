import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Project } from '@tips/data/models';

import { ProjectsFacade } from '../+state/projects/projects.facade';

@Component({
  selector: 'tips-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit {
  dataSource = new MatTableDataSource<Project>();
  projects$ = this.store.allProjects$;

  constructor(private readonly store: ProjectsFacade) {}
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    this.store.allProjects$.subscribe({
      next: (projects) => {
        this.dataSource.data = projects;
        this.dataSource.sort = this.sort;
      },
    });
    this.store.init();
  }
}
