import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bed, Maximize } from 'lucide-react'

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
  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(priceBRL)

  return (
    <Card className="overflow-hidden group pt-0" variant="default">
      <div className="relative h-56 aspect-auto bg-muted overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge className="absolute bottom-3 left-3 shadow-brand-md">
          {status}
        </Badge>
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 tracking-tight">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 flex-shrink-0" />
            <span>{compartimentos} compart.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="w-4 h-4 flex-shrink-0" />
            <span>{areaM2}m²</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary tracking-tight">
              {priceFormatted}
            </p>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <Button size="sm" asChild className="w-full shadow-brand-sm">
          <Link href={href}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
