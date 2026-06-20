import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export interface RadarSeries {
  label: string;
  color: string;
  values: number[];
}

interface RadarPoint {
  x: number;
  y: number;
}

interface RenderedSeries {
  label: string;
  color: string;
  points: RadarPoint[];
  polygonPoints: string;
}

const VIEW_SIZE = 320;
const CENTER = VIEW_SIZE / 2;
const RADIUS = 110;
const LABEL_OFFSET = 22;
const RING_COUNT = 4;

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (axes().length < 3) {
      <p class="text-center text-sm text-slate-500 py-8">
        A radar chart requires at least 3 categories.
      </p>
    } @else {
      <div class="flex flex-col items-center gap-4">
        <svg
          [attr.viewBox]="viewBox()"
          class="w-full max-w-md"
          role="img"
          [attr.aria-label]="chartAriaLabel()"
        >
          <!-- Concentric rings -->
          @for (ring of rings(); track ring) {
            <polygon
              [attr.points]="ring"
              fill="none"
              stroke="#e2e8f0"
              stroke-width="1"
            />
          }

          <!-- Axis spokes -->
          @for (spoke of spokes(); track spoke.index) {
            <line
              [attr.x1]="center"
              [attr.y1]="center"
              [attr.x2]="spoke.x"
              [attr.y2]="spoke.y"
              stroke="#e2e8f0"
              stroke-width="1"
            />
          }

          <!-- Data series -->
          @for (s of renderedSeries(); track s.label) {
            <polygon
              [attr.points]="s.polygonPoints"
              [attr.fill]="s.color"
              fill-opacity="0.15"
              [attr.stroke]="s.color"
              stroke-width="2"
              stroke-linejoin="round"
            />
            @for (point of s.points; track $index) {
              <circle
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                r="3.5"
                [attr.fill]="s.color"
                stroke="white"
                stroke-width="1.5"
              />
            }
          }

          <!-- Axis labels -->
          @for (label of axisLabels(); track label.text) {
            <text
              [attr.x]="label.x"
              [attr.y]="label.y"
              [attr.text-anchor]="label.anchor"
              [attr.dominant-baseline]="label.baseline"
              class="fill-slate-600 text-[11px]"
            >
              {{ label.text }}
            </text>
          }
        </svg>

        <!-- Legend -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          @for (s of series(); track s.label) {
            <div class="flex items-center gap-2 text-sm text-slate-700">
              <span
                class="inline-block h-2.5 w-2.5 rounded-full"
                [style.background-color]="s.color"
              ></span>
              <span>{{ s.label }}</span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class RadarChartComponent {
  readonly axes = input.required<string[]>();
  readonly series = input.required<RadarSeries[]>();
  readonly max = input<number>();

  protected readonly center = CENTER;
  protected readonly viewBox = computed(
    () => `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`
  );

  protected readonly chartMax = computed(() => {
    const explicitMax = this.max();
    if (explicitMax != null && explicitMax > 0) {
      return explicitMax;
    }

    const allValues = this.series().flatMap((s) => s.values);
    const dataMax = allValues.length > 0 ? Math.max(...allValues) : 0;
    return dataMax > 0 ? dataMax : 1;
  });

  protected readonly rings = computed(() => {
    const count = this.axes().length;
    if (count < 3) return [];

    return Array.from({ length: RING_COUNT }, (_, ringIndex) => {
      const scale = (ringIndex + 1) / RING_COUNT;
      return this.polygonPoints(count, RADIUS * scale);
    });
  });

  protected readonly spokes = computed(() => {
    const count = this.axes().length;
    if (count < 3) return [];

    return Array.from({ length: count }, (_, index) => {
      const point = this.pointAt(index, count, RADIUS);
      return { index, x: point.x, y: point.y };
    });
  });

  protected readonly axisLabels = computed(() => {
    const labels = this.axes();
    const count = labels.length;
    if (count < 3) return [];

    return labels.map((text, index) => {
      const point = this.pointAt(index, count, RADIUS + LABEL_OFFSET);
      const angle = this.angleForIndex(index, count);
      const anchor =
        Math.abs(Math.cos(angle)) < 0.2
          ? 'middle'
          : Math.cos(angle) > 0
            ? 'start'
            : 'end';
      const baseline =
        Math.abs(Math.sin(angle)) < 0.2
          ? 'middle'
          : Math.sin(angle) > 0
            ? 'hanging'
            : 'auto';

      return { text, x: point.x, y: point.y, anchor, baseline };
    });
  });

  protected readonly renderedSeries = computed((): RenderedSeries[] => {
    const count = this.axes().length;
    if (count < 3) return [];

    const max = this.chartMax();
    return this.series().map((s) => {
      const points = s.values.map((value, index) =>
        this.pointAt(index, count, (value / max) * RADIUS)
      );
      const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');
      return {
        label: s.label,
        color: s.color,
        points,
        polygonPoints,
      };
    });
  });

  protected chartAriaLabel(): string {
    const axes = this.axes();
    const series = this.series();
    return `Radar chart with ${axes.length} categories and ${series.length} series`;
  }

  private angleForIndex(index: number, count: number): number {
    return (-Math.PI / 2) + (index * 2 * Math.PI) / count;
  }

  private pointAt(index: number, count: number, radius: number): RadarPoint {
    const angle = this.angleForIndex(index, count);
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    };
  }

  private polygonPoints(count: number, radius: number): string {
    return Array.from({ length: count }, (_, index) => {
      const point = this.pointAt(index, count, radius);
      return `${point.x},${point.y}`;
    }).join(' ');
  }
}
