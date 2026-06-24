import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { BarChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type {
  ResultsChartSeries,
  ResultsChartType,
} from '../../survey-assignations/survey-results-chart.utils';

echarts.use([
  BarChart,
  RadarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-survey-results-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (chartType() === 'radar' && axes().length < 3) {
      <p class="text-center text-sm text-slate-500 py-8">
        A radar chart requires at least 3 categories.
      </p>
    } @else if (series().length === 0) {
      <p class="text-center text-sm text-slate-500 py-8">
        Select an invitee to view their results, or enable group average
        comparison.
      </p>
    } @else if (isBrowser) {
      <div
        echarts
        [options]="chartOptions()"
        class="h-[360px] w-full"
        role="img"
        [attr.aria-label]="chartAriaLabel()"
      ></div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class SurveyResultsChartComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly chartType = input.required<ResultsChartType>();
  readonly axes = input.required<string[]>();
  readonly series = input.required<ResultsChartSeries[]>();
  readonly max = input<number>();

  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly chartMax = computed(() => {
    const explicitMax = this.max();
    if (explicitMax != null && explicitMax > 0) {
      return explicitMax;
    }

    const allValues = this.series().flatMap((s) => s.values);
    const dataMax = allValues.length > 0 ? Math.max(...allValues) : 0;
    return dataMax > 0 ? dataMax : 1;
  });

  protected readonly chartOptions = computed((): EChartsCoreOption => {
    const type = this.chartType();
    const axes = this.axes();
    const series = this.series();
    const max = this.chartMax();

    if (type === 'bar') {
      return {
        animationDuration: 800,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          bottom: 0,
          textStyle: { color: '#334155' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '14%',
          top: '8%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: axes,
          axisLabel: {
            color: '#475569',
            interval: 0,
            rotate: axes.length > 6 ? 30 : 0,
          },
          axisLine: { lineStyle: { color: '#e2e8f0' } },
        },
        yAxis: {
          type: 'value',
          max,
          axisLabel: { color: '#64748b' },
          splitLine: { lineStyle: { color: '#f1f5f9' } },
        },
        series: series.map((s) => ({
          name: s.label,
          type: 'bar' as const,
          data: s.values,
          itemStyle: { color: s.color },
          emphasis: { focus: 'series' as const },
        })),
      };
    }

    return {
      animationDuration: 800,
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#334155' },
      },
      radar: {
        indicator: axes.map((name) => ({ name, max })),
        axisName: { color: '#475569', fontSize: 11 },
        splitLine: { lineStyle: { color: '#e2e8f0' } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      series: [
        {
          type: 'radar' as const,
          data: series.map((s) => ({
            name: s.label,
            value: s.values,
            lineStyle: { color: s.color, width: 2 },
            itemStyle: { color: s.color },
            areaStyle: { color: s.color, opacity: 0.15 },
          })),
        },
      ],
    };
  });

  protected chartAriaLabel(): string {
    const axes = this.axes();
    const series = this.series();
    return `${this.chartType()} chart with ${axes.length} categories and ${series.length} series`;
  }
}
