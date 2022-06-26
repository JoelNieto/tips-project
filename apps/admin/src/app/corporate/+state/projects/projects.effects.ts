import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { ProjectsService } from '@tips/data/services';
import { map, switchMap } from 'rxjs';

import { ProjectsActions } from './projects.actions';
import { ProjectsFacade } from './projects.facade';

@Injectable()
export class ProjectsEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectsActions.init),
      concatLatestFrom(() => this.store.selectedCompany$),
      switchMap(([, company]) =>
        this.service
          .getCompanyProjects(company?._id)
          .pipe(
            map((payload) => ProjectsActions.loadProjectsSuccess({ payload }))
          )
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectsActions.createProject),
      switchMap(({ request }) =>
        this.service
          .post(request)
          .pipe(
            map((payload) => ProjectsActions.createProjectSuccess({ payload }))
          )
      )
    );
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectsActions.updateProject),
      switchMap(({ id, request }) =>
        this.service
          .patch(id, request)
          .pipe(
            map((changes) =>
              ProjectsActions.updateProjectSuccess({ id, changes })
            )
          )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private service: ProjectsService,
    private store: ProjectsFacade
  ) {}
}
