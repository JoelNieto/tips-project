import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Project } from '@tips/data/models';

import { ProjectsActions } from './projects.actions';

export const PROJECTS_FEATURE_KEY = 'projects';

export interface State extends EntityState<Project> {
  selectedId?: string | number; // which Projects record has been selected
  loaded: boolean; // has the Projects list been loaded
  error?: string | null; // last known error (if any)
}

export interface ProjectsPartialState {
  readonly [PROJECTS_FEATURE_KEY]: State;
}

const selectId = (x: Project) => x._id;
export const projectsAdapter: EntityAdapter<Project> =
  createEntityAdapter<Project>({ selectId });

export const initialState: State = projectsAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const projectsReducer = createReducer(
  initialState,
  on(
    ProjectsActions.init,
    (state): State => ({
      ...state,
      loaded: false,
      error: null,
    })
  ),
  on(
    ProjectsActions.loadProjectsSuccess,
    (state, { payload }): State =>
      projectsAdapter.setAll(payload, { ...state, loaded: true })
  ),
  on(
    ProjectsActions.setProject,
    (state, { id }): State => ({ ...state, selectedId: id })
  ),
  on(
    ProjectsActions.loadProjectsFailure,
    (state, { error }): State => ({
      ...state,
      error,
    })
  ),
  on(
    ProjectsActions.createProjectSuccess,
    (state, { payload }): State => projectsAdapter.addOne(payload, state)
  ),
  on(
    ProjectsActions.updateProjectSuccess,
    (state, { id, changes }): State =>
      projectsAdapter.updateOne({ id, changes }, state)
  )
);

export function reducer(state: State | undefined, action: Action) {
  return projectsReducer(state, action);
}
