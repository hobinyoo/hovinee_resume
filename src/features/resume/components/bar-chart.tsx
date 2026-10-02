import type { Project } from "../types"

type BarChartProps = {
  chart: NonNullable<Project["chart"]>
}

export function BarChart({ chart }: BarChartProps) {
  const max = Math.max(...chart.values)
  return (
    <div>
      <p className="m-0 mb-3 text-body-sm font-bold text-foreground">{chart.title}</p>
      <div className="flex h-44 items-end gap-1.5" role="img" aria-label={chart.title}>
        {chart.values.map((value, index) => (
          <div
            key={chart.labels[index]}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-caption text-muted-foreground">{value}</span>
            <div
              className={
                index < chart.split
                  ? "w-full rounded-t bg-border"
                  : "w-full rounded-t bg-foreground"
              }
              style={{ height: `${(value / max) * 100}%` }}
            />
            <span className="text-caption text-muted-foreground">{chart.labels[index]}</span>
          </div>
        ))}
      </div>
      <p className="m-0 mt-3 flex flex-wrap gap-4 text-caption text-muted-foreground">
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-border" />
          {chart.before}
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-foreground" />
          {chart.after}
        </span>
      </p>
    </div>
  )
}
