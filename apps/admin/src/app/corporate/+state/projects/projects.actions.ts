import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Project } from '@tips/data/models';

export const ProjectsActions = createActionGroup({
  source: 'Company/Projects',
  events: {
    Init: emptyProps(),
    'Load Projects Success': props<{ payload: Project[] }>(),
    'Load Projects Failure': props<{ error: any }>(),
    'Create Project': props<{ request: Project }>(),
    'Create Project Success': props<{ payload: Project }>(),
    'Update Project': props<{ id: string; request: Partial<Project> }>(),
    'Update Project Success': props<{ id: string; changes: Project }>(),
  },
});
