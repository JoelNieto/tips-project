import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@angular/cdk/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';
import PositionTreeNodeComponent, {
  type PositionNode,
} from './position-tree-node';
import {
  CREATE_POSITION_MUTATION,
  DELETE_POSITION_MUTATION,
  POSITIONS_QUERY,
  UPDATE_POSITION_MUTATION,
} from './graphql/positions.graphql';

interface Position {
  id: string;
  name: string;
  code: string;
  companyId: string;
  parentPositionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-company-positions',
  standalone: true,
  imports: [PositionTreeNodeComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-medium text-slate-900">{{ 'companies.positions.title' | translate }}</h3>
          <p class="mt-1 text-sm text-slate-500">
            {{ 'companies.positions.subtitle' | translate }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          (click)="openCreateForm()"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          {{ 'companies.positions.addPosition' | translate }}
        </button>
      </div>

      @if (showForm()) {
        <form
          (submit)="onSubmit($event)"
          class="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h4 class="text-base font-medium text-slate-900">
            {{
              isEditMode()
                ? ('companies.positions.editPosition' | translate)
                : ('companies.positions.addPositionTitle' | translate)
            }}
          </h4>

          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="position-name" class="block text-sm font-medium text-slate-700">
                {{ 'companies.positions.name' | translate }} *
              </label>
              <input
                id="position-name"
                type="text"
                [value]="formName()"
                (input)="formName.set($any($event.target).value)"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label for="position-code" class="block text-sm font-medium text-slate-700">
                {{ 'companies.positions.code' | translate }} *
              </label>
              <input
                id="position-code"
                type="text"
                [value]="formCode()"
                (input)="formCode.set($any($event.target).value)"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="position-parent" class="block text-sm font-medium text-slate-700">
              {{ 'companies.positions.reportsTo' | translate }}
            </label>
            <select
              id="position-parent"
              [value]="formParentId()"
              (change)="formParentId.set($any($event.target).value)"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">{{ 'companies.positions.topLevel' | translate }}</option>
              @for (position of parentOptions(); track position.id) {
                <option [value]="position.id">
                  {{ position.name }} ({{ position.code }})
                </option>
              }
            </select>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              (click)="cancelForm()"
            >
              {{ 'common.cancel' | translate }}
            </button>
            <button
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              [disabled]="submitting() || !formName().trim() || !formCode().trim()"
            >
              {{
                submitting()
                  ? ('companies.positions.saving' | translate)
                  : isEditMode()
                    ? ('companies.positions.updatePosition' | translate)
                    : ('companies.positions.savePosition' | translate)
              }}
            </button>
          </div>
        </form>
      }

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'companies.positions.loading' | translate }}
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">{{ 'companies.positions.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (positionTree().length === 0) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'companies.positions.empty' | translate }}
        </div>
      } @else {
        <div class="space-y-2">
          @for (node of positionTree(); track node.id) {
            <app-position-tree-node
              [node]="node"
              [expandedIds]="expandedIds()"
              (toggleExpanded)="toggleNode($event)"
              (editPosition)="openEditForm($event)"
              (deletePosition)="confirmDelete($event)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class CompanyPositionsComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  private readonly translate = inject(TranslateService);

  readonly companyId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly positions = signal<Position[]>([]);
  protected readonly expandedIds = signal<Set<string>>(new Set());
  protected readonly showForm = signal(false);
  protected readonly editingPositionId = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly formName = signal('');
  protected readonly formCode = signal('');
  protected readonly formParentId = signal('');

  protected readonly isEditMode = computed(() => this.editingPositionId() !== null);

  protected readonly parentOptions = computed(() => {
    const editingId = this.editingPositionId();
    if (!editingId) {
      return this.positions();
    }

    const excludedIds = collectDescendantIds(editingId, this.positions());
    excludedIds.add(editingId);

    return this.positions().filter((position) => !excludedIds.has(position.id));
  });

  protected readonly positionTree = computed(() =>
    buildPositionTree(this.positions())
  );

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      if (companyId) {
        this.loadPositions(companyId);
      }
    });
  }

  protected openCreateForm(): void {
    this.resetForm();
    this.editingPositionId.set(null);
    this.showForm.set(true);
  }

  protected openEditForm(id: string): void {
    const position = this.positions().find((item) => item.id === id);
    if (!position) {
      return;
    }

    this.editingPositionId.set(id);
    this.formName.set(position.name);
    this.formCode.set(position.code);
    this.formParentId.set(position.parentPositionId ?? '');
    this.submitError.set(null);
    this.showForm.set(true);
  }

  protected cancelForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  protected toggleNode(id: string): void {
    this.expandedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const name = this.formName().trim();
    const code = this.formCode().trim();
    const parentPositionId = this.formParentId() || null;
    const editingId = this.editingPositionId();

    if (!name || !code) {
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    if (editingId) {
      this.apollo
        .mutate<{ updatePosition: Position }>({
          mutation: UPDATE_POSITION_MUTATION,
          variables: {
            id: editingId,
            input: {
              name,
              code,
              parentPositionId,
            },
          },
          refetchQueries: [
            {
              query: POSITIONS_QUERY,
              variables: { companyId: this.companyId() },
            },
          ],
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.showForm.set(false);
            this.resetForm();
          },
          error: (err: Error) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('companies.positions.updateFailed'),
            );
          },
        });
      return;
    }

    this.apollo
      .mutate<{ createPosition: Position }>({
        mutation: CREATE_POSITION_MUTATION,
        variables: {
          input: {
            name,
            code,
            companyId: this.companyId(),
            parentPositionId: parentPositionId ?? undefined,
          },
        },
        refetchQueries: [
          {
            query: POSITIONS_QUERY,
            variables: { companyId: this.companyId() },
          },
        ],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.resetForm();
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.submitError.set(
            err.message ?? this.translate.instant('companies.positions.createFailed'),
          );
        },
      });
  }

  protected confirmDelete(id: string): void {
    const position = this.positions().find((item) => item.id === id);
    if (!position) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('companies.positions.deleteTitle'),
        message: this.translate.instant('companies.positions.deleteMessageNamed', {
          name: position.name,
        }),
        confirmLabel: this.translate.instant('companies.form.deleteConfirm'),
        cancelLabel: this.translate.instant('common.cancel'),
      },
    });

    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        this.deletePosition(id);
      }
    });
  }

  private deletePosition(id: string): void {
    this.apollo
      .mutate({
        mutation: DELETE_POSITION_MUTATION,
        variables: { id },
        refetchQueries: [
          {
            query: POSITIONS_QUERY,
            variables: { companyId: this.companyId() },
          },
        ],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          this.error.set(
            err.message ?? this.translate.instant('companies.positions.deleteFailed'),
          );
        },
      });
  }

  private loadPositions(companyId: string): void {
    this.loading.set(true);

    this.apollo
      .watchQuery<{ positions: Position[] }>({
        query: POSITIONS_QUERY,
        variables: { companyId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const positions = (result.data?.positions ?? []).filter(isPosition);
          this.positions.set(positions);
          this.expandedIds.set(new Set(positions.map((position) => position.id)));
          this.error.set(result.error?.message ?? null);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('companies.positions.loadFailed'),
          );
        },
      });
  }

  private resetForm(): void {
    this.editingPositionId.set(null);
    this.formName.set('');
    this.formCode.set('');
    this.formParentId.set('');
    this.submitError.set(null);
  }
}

function collectDescendantIds(positionId: string, positions: Position[]): Set<string> {
  const childrenByParent = new Map<string, string[]>();

  for (const position of positions) {
    if (!position.parentPositionId) {
      continue;
    }

    const siblings = childrenByParent.get(position.parentPositionId) ?? [];
    siblings.push(position.id);
    childrenByParent.set(position.parentPositionId, siblings);
  }

  const descendants = new Set<string>();
  const queue = [...(childrenByParent.get(positionId) ?? [])];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    descendants.add(currentId);
    queue.push(...(childrenByParent.get(currentId) ?? []));
  }

  return descendants;
}

function buildPositionTree(positions: Position[]): PositionNode[] {
  const nodes = new Map<string, PositionNode>();

  for (const position of positions) {
    nodes.set(position.id, {
      id: position.id,
      name: position.name,
      code: position.code,
      parentPositionId: position.parentPositionId ?? null,
      children: [],
    });
  }

  const roots: PositionNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentPositionId && nodes.has(node.parentPositionId)) {
      nodes.get(node.parentPositionId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: PositionNode[]): PositionNode[] =>
    [...items]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        ...item,
        children: sortNodes(item.children),
      }));

  return sortNodes(roots);
}

function isPosition(value: unknown): value is Position {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record['id'] === 'string' &&
    typeof record['name'] === 'string' &&
    typeof record['code'] === 'string' &&
    typeof record['companyId'] === 'string' &&
    typeof record['createdAt'] === 'string' &&
    typeof record['updatedAt'] === 'string'
  );
}
