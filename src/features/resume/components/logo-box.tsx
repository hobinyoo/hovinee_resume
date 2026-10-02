import { resolveImage } from "../content"

type LogoBoxProps = {
  label: string
  logo: string | null
}

export function LogoBox({ label, logo }: LogoBoxProps) {
  const url = resolveImage(logo)
  return (
    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted px-1 text-center text-caption font-bold text-muted-foreground">
      {url ? <img src={url} alt={label} className="size-full object-contain" /> : label}
    </div>
  )
}
