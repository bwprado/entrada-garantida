import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { Bed } from "lucide-react"
import { Maximize } from "lucide-react"
import { Heart } from "lucide-react"

type ImovelCardProps = {
  id: string
  title: string
  location: string
  imageSrc: string
  status: string
  compartimentos: number
  areaM2: number
  priceBRL: number
  type: string
  href: string
}

export default function ImovelCard({
  id,
  title,
  location,
  imageSrc,
  status,
  compartimentos,
  areaM2,
  priceBRL,
  type,
  href
}: ImovelCardProps) {
  const priceFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(priceBRL)
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group pt-0!">
      <div className="relative h-56 aspect-auto bg-muted overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <Badge className="absolute bottom-3 left-3">{status}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{compartimentos} compart.</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{areaM2}m²</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">{priceFormatted}</p>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" asChild className="w-full">
          <Link href={href}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
