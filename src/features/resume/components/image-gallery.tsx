import { useState } from "react"

import { cn } from "@/lib/utils"

import { resolveImage } from "../content"
import type { ProjectImage } from "../types"

type ImageGalleryProps = {
  images: Array<ProjectImage>
  wide?: boolean
}

export function ImageGallery({ images, wide }: ImageGalleryProps) {
  const [open, setOpen] = useState<ProjectImage | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <figure key={image.cap} className={cn("m-0", wide && index === 0 && "sm:col-span-2")}>
            {resolveImage(image.src) ? (
              <button
                type="button"
                onClick={() => setOpen(image)}
                className="block w-full cursor-zoom-in overflow-hidden rounded-md border border-border bg-card p-0"
              >
                <img src={resolveImage(image.src) ?? ""} alt={image.cap} className="block w-full" />
              </button>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-muted text-caption text-muted-foreground">
                이미지 준비 중
              </div>
            )}
            <figcaption className="mt-2 text-caption text-muted-foreground">{image.cap}</figcaption>
          </figure>
        ))}
      </div>

      {open && resolveImage(open.src) && (
        <dialog
          open
          aria-label={open.cap}
          className="fixed inset-0 z-[100] m-0 flex size-full max-h-none max-w-none items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(null)}
            className="absolute inset-0 cursor-zoom-out border-0 bg-transparent"
          />
          <img
            src={resolveImage(open.src) ?? ""}
            alt={open.cap}
            className="relative max-h-full max-w-full object-contain"
          />
        </dialog>
      )}
    </>
  )
}
