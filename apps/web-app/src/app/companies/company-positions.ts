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
import { Apollo } from 'apollo-angular';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';
import PositionTreeNodeComponent, {
  type PositionNode,
} from './position-tree-node';
import {
  CREATE_POSITION_MUTATION,
  DELETE_POSITION_MUTATION,
  POSITIONS_QUERY,
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
  imports: [PositionTreeNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-medium text-slate-900">Organization hierarchy</h3>
          <p class="mt-1 text-sm text-slate-500">
            Define positions and reporting lines for this company.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          (click)="toggleForm()"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Add position
        </button>
      </div>

      @if (showForm()) {
        <form
          (submit)="onSubmit($event)"
          class="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="position-name" class="block text-sm font-medium text-slate-700">
                Name *
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
                Code *
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
              Reports to
            </label>
            <select
              id="position-parent"
              [value]="formParentId()"
              (change)="formParentId.set($any($event.target).value)"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">None (top level)</option>
              @for (position of positions(); track position.id) {
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
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              [disabled]="submitting() || !formName().trim() || !formCode().trim()"
            >
              {{ submitting() ? 'Saving...' : 'Save position' }}
            </button>
          </div>
        </form>
      }

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading positions...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load positions</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (positionTree().length === 0) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No positions yet. Add the first position to start building the hierarchy.
        </div>
      } @else {
        <div class="space-y-2">
          @for (node of positionTree(); track node.id) {
            <app-position-tree-node
              [node]="node"
              [expandedIds]="expandedIds()"
              (toggleExpanded)="toggleNode($event)"
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

  readonly companyId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly positions = signal<Position[]>([]);
  protected readonly expandedIds = signal<Set<string>>(new Set());
  protected readonly showForm = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly formName = signal('');
  protected readonly formCode = signal('');
  protected readonly formParentId = signal('');

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

  protected toggleForm(): void {
    this.showForm.update((value) => !value);
    if (!this.showForm()) {
      this.resetForm();
    }
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
    const parentPositionId = this.formParentId() || undefined;

    if (!name || !code) {
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    this.apollo
      .mutate<{ createPosition: Position }>({
        mutation: CREATE_POSITION_MUTATION,
        variables: {
          input: {
            name,
            code,
            companyId: this.companyId(),
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
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to create position');
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
        title: 'Delete position',
        message: `Are you sure you want to delete "${position.name}"?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
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
          this.error.set(err.message ?? 'Failed to delete position');
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
          this.error.set(err.message ?? 'Failed to load positions');
        },
      });
  }

  private resetForm(): void {
    this.formName.set('');
    this.formCode.set('');
    this.formParentId.set('');
    this.submitError.set(null);
  }
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
