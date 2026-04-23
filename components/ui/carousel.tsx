"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
  type EmblaOptionsType
} from "embla-carousel-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CarouselApi = UseEmblaCarouselType[1]

const CarouselContext = React.createContext<{
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi | undefined
} | null>(null)

export function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

export interface CarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  opts?: EmblaOptionsType
  orientation?: "horizontal" | "vertical"
}

export function Carousel({
  orientation = "horizontal",
  opts,
  className,
  children,
  ...props
}: CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel({
    axis: orientation === "horizontal" ? "x" : "y",
    ...opts
  })

  return (
    <CarouselContext.Provider value={{ carouselRef, api }}>
      <div
        className={cn("relative", className)}
        {...props}
      >
        <div
          className={cn(
            "overflow-hidden",
            orientation === "vertical" && "h-full"
          )}
          ref={carouselRef}
        >
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-ml-4 flex", className)}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { api } = useCarousel()
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const update = () => setCanScrollPrev(api.canScrollPrev())

    update()
    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      type="button"
      className={cn(
        "absolute size-8 rounded-full",
        className
      )}
      disabled={!canScrollPrev}
      onClick={() => api?.scrollPrev()}
      {...props}
    >
      <ChevronLeft />
      <span className="sr-only">Slide anterior</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { api } = useCarousel()
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const update = () => setCanScrollNext(api.canScrollNext())

    update()
    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      type="button"
      className={cn(
        "absolute size-8 rounded-full",
        className
      )}
      disabled={!canScrollNext}
      onClick={() => api?.scrollNext()}
      {...props}
    >
      <ChevronRight />
      <span className="sr-only">Próximo slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

