import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

import { SURVEYS_QUERY } from '../surveys/graphql/surveys.graphql';
import {
  ASSIGN_SURVEY_TO_ORGANIZATION_MUTATION,
  ORGANIZATION_SURVEYS_QUERY,
  ORGANIZATIONS_QUERY,
  REMOVE_SURVEY_FROM_ORGANIZATION_MUTATION,
} from './graphql/organizations.graphql';

interface SurveyOption {
  id: string;
  title: string;
}

interface AssignedSurvey {
  id: string;
  surveyId: string;
}

@Component({
  selector: 'app-organization-detail',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/organizations"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ organizationName() }}
          </h2>
          <p class="text-slate-500 mt-1">
            {{ 'organizations.detail.subtitle' | translate }}
          </p>
        </div>
      </div>

      <section
        class="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        <h3 class="text-lg font-semibold text-slate-900">
          {{ 'organizations.detail.assignSurvey' | translate }}
        </h3>
        <form
          (ngSubmit)="assignSurvey()"
          class="flex flex-col sm:flex-row gap-3"
        >
          <select
            [(ngModel)]="selectedSurveyId"
            name="surveyId"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">{{ 'organizations.detail.selectSurvey' | translate }}</option>
            @for (survey of surveys(); track survey.id) {
              <option [value]="survey.id">{{ survey.title }}</option>
            }
          </select>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
          >
            {{ 'organizations.detail.assign' | translate }}
          </button>
        </form>
      </section>

      <section
        class="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900">
            {{ 'organizations.detail.assignedSurveys' | translate }}
          </h3>
        </div>
        <ul class="divide-y divide-slate-200">
          @for (item of assignedSurveys(); track item.id) {
            <li class="px-6 py-4 flex items-center justify-between gap-4">
              <span class="text-sm text-slate-700">{{
                surveyTitle(item.surveyId)
              }}</span>
              <button
                type="button"
                (click)="removeAssignment(item.id)"
                class="text-sm text-red-600 hover:text-red-700"
              >
                {{ 'organizations.detail.remove' | translate }}
              </button>
            </li>
          } @empty {
            <li class="px-6 py-8 text-center text-slate-500">
              {{ 'organizations.detail.noSurveysAssigned' | translate }}
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export default class OrganizationDetailComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  id = input.required<string>();

  protected readonly organizationName = signal(
    this.translate.instant('organizations.detail.defaultName'),
  );
  protected readonly surveys = signal<SurveyOption[]>([]);
  protected readonly assignedSurveys = signal<AssignedSurvey[]>([]);
  protected selectedSurveyId = '';

  constructor() {
    effect(() => {
      const organizationId = this.id();
      if (!organizationId) {
        return;
      }

      this.apollo
        .watchQuery<{ organizationSurveys: AssignedSurvey[] }>({
          query: ORGANIZATION_SURVEYS_QUERY,
          variables: { organizationId },
        })
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          this.assignedSurveys.set(
            (result.data?.organizationSurveys ?? []) as AssignedSurvey[],
          );
        });
    });

    this.apollo
      .watchQuery<{ surveys: SurveyOption[] }>({ query: SURVEYS_QUERY })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) =>
        this.surveys.set((result.data?.surveys ?? []) as SurveyOption[]),
      );

    this.apollo
      .watchQuery<{ organizations: { id: string; name: string }[] }>({
        query: ORGANIZATIONS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const org = result.data?.organizations?.find(
          (item) => item.id === this.id(),
        );
        if (org?.name) {
          this.organizationName.set(org.name);
        }
      });
  }

  protected surveyTitle(surveyId: string): string {
    return (
      this.surveys().find((survey) => survey.id === surveyId)?.title ?? surveyId
    );
  }

  async assignSurvey() {
    if (!this.selectedSurveyId) {
      return;
    }

    await firstValueFrom(
      this.apollo.mutate({
        mutation: ASSIGN_SURVEY_TO_ORGANIZATION_MUTATION,
        variables: {
          input: {
            organizationId: this.id(),
            surveyId: this.selectedSurveyId,
          },
        },
        refetchQueries: [
          {
            query: ORGANIZATION_SURVEYS_QUERY,
            variables: { organizationId: this.id() },
          },
        ],
      }),
    );
    this.selectedSurveyId = '';
  }

  async removeAssignment(assignmentId: string) {
    await firstValueFrom(
      this.apollo.mutate({
        mutation: REMOVE_SURVEY_FROM_ORGANIZATION_MUTATION,
        variables: { id: assignmentId },
        refetchQueries: [
          {
            query: ORGANIZATION_SURVEYS_QUERY,
            variables: { organizationId: this.id() },
          },
        ],
      }),
    );
  }
}
