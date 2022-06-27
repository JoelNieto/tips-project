import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ProjectsFacade } from '../+state/projects/projects.facade';

@Component({
  selector: 'tips-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  project$ = this.store.selectedProjects$;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: ProjectsFacade
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.store.setProject(params['id']);
    });
  }

  ngOnDestroy(): void {
    this.store.setProject(undefined);
  }
}
