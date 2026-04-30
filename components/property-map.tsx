'use client'

import React, { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const MARKER_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

type PropertyMapProps = {
  address: string
}

export default function PropertyMap({ address }: PropertyMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function geocode() {
      try {
        const params = new URLSearchParams({
          q: address,
          format: 'json',
          limit: '1',
          countrycodes: 'br'
        })
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: { 'User-Agent': 'AquisicaoGarantida/1.0' },
            signal: controller.signal
          }
        )
        if (!res.ok) throw new Error('Geocoding failed')
        const data = await res.json()
        if (data.length === 0) throw new Error('No results')
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    geocode()
    return () => controller.abort()
  }, [address])

  if (loading) {
    return (
      <div
        className="w-full aspect-[16/10] rounded-xl bg-muted animate-pulse"
        style={{
          animation: 'shimmer 2s ease-in-out infinite',
          backgroundImage: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)',
          backgroundSize: '200% 100%'
        }}
      />
    )
  }

  if (error || !position) {
    return (
      <div className="w-full aspect-[16/10] rounded-xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <p className="text-sm">Localizacao nao disponivel</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      className="w-full aspect-[16/10] rounded-xl z-0"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={MARKER_ICON} />
    </MapContainer>
  )
}