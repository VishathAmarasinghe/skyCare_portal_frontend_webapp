export const DASHBOARD_CHART_HEIGHT = 380;

export const verticalChartMargins = {
  top: 52,
  right: 24,
  bottom: 72,
  left: 72,
};

export const horizontalChartMargins = {
  top: 24,
  right: 32,
  bottom: 40,
  left: 168,
};

export const dashboardLegendSlotProps = {
  legend: {
    direction: "row" as const,
    position: { vertical: "top" as const, horizontal: "right" as const },
    padding: 0,
    itemMarkWidth: 12,
    itemMarkHeight: 12,
    labelStyle: { fontSize: 12 },
  },
};

export const axisTickLabelStyle = {
  fontSize: 12,
};

export const axisLabelStyle = {
  fontSize: 13,
  fontWeight: 500,
};

export const angledAxisTickLabelStyle = {
  fontSize: 11,
  angle: -40,
  textAnchor: "end" as const,
};

export function computeYAxisMax(values: number[]): number {
  const max = values.length ? Math.max(...values) : 0;
  if (max <= 0) {
    return 5;
  }
  return Math.max(Math.ceil(max * 1.2), max + 1);
}

export function hasChartData(values: number[]): boolean {
  return values.some((value) => value > 0);
}
