import Image from 'next/image'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

/** 1200×630 share image so link previews use the logo at full asset resolution, not the favicon. */
export async function createShareImageResponse() {
  const logoData = await readFile(
    join(process.cwd(), 'public/secid-horizontal.png')
  )
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(165deg, #e8f2fa 0%, #ffffff 55%, #f0f7fc 100%)'
        }}
      >
        <Image
          src={logoSrc}
          alt=""
          height={200}
          width={520}
          style={{ objectFit: 'contain' }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 38,
            fontWeight: 700,
            color: '#153a5c',
            letterSpacing: '-0.03em'
          }}
        >
          Aquisição Assistida
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 24,
            fontWeight: 500,
            color: '#2d6ea4'
          }}
        >
          Governo do Maranhão · SECID
        </div>
      </div>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT }
  )
}

export const ogImageSize = { width: OG_WIDTH, height: OG_HEIGHT } as const
export const ogImageAlt =
  'Aquisição Assistida — Iniciativa estadual · Governo do Maranhão · SECID'
