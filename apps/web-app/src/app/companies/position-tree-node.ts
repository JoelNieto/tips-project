import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
} from '@angular/core';

export interface PositionNode {
  id: string;
  name: string;
  code: string;
  parentPositionId: string | null;
  children: PositionNode[];
}

@Component({
  selector: 'app-position-tree-node',
  standalone: true,
  imports: [forwardRef(() => PositionTreeNodeComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div
        class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
        [style.margin-left.px]="depth() * 24"
      >
        @if (node().children.length > 0) {
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
            (click)="toggleExpanded.emit(node().id)"
            [attr.aria-expanded]="expanded()"
            [attr.aria-label]="expanded() ? 'Collapse' : 'Expand'"
          >
            <span class="material-symbols-outlined text-[18px]">
              {{ expanded() ? 'expand_more' : 'chevron_right' }}
            </span>
          </button>
        } @else {
          <span class="inline-block h-6 w-6 shrink-0"></span>
        }

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-900">{{ node().name }}</p>
        </div>

        <span
          class="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
        >
          {{ node().code }}
        </span>

        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
          (click)="editPosition.emit(node().id)"
          aria-label="Edit position"
        >
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>

        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
          (click)="deletePosition.emit(node().id)"
          aria-label="Delete position"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      @if (expanded() && node().children.length > 0) {
        <div class="mt-2 space-y-2">
          @for (child of node().children; track child.id) {
            <app-position-tree-node
              [node]="child"
              [depth]="depth() + 1"
              [expandedIds]="expandedIds()"
              (toggleExpanded)="toggleExpanded.emit($event)"
              (editPosition)="editPosition.emit($event)"
              (deletePosition)="deletePosition.emit($event)"
            />
          }
        </div>
      }
    </div>
  `,
})
export default class PositionTreeNodeComponent {
  readonly node = input.required<PositionNode>();
  readonly depth = input(0);
  readonly expandedIds = input.required<Set<string>>();

  readonly toggleExpanded = output<string>();
  readonly editPosition = output<string>();
  readonly deletePosition = output<string>();

  protected readonly expanded = computed(() =>
    this.expandedIds().has(this.node().id)
  );
}
