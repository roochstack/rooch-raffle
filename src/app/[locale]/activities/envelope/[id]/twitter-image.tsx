import { VERCEL_URL } from '@/utils/constants'
import { formatCoverImageUrl, formatUnits } from '@/utils/kit'
import { fetchCoinInfo, fetchEnvelopeData } from '@/utils/request'
import { getTranslations } from 'next-intl/server'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'About Acme'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: { id: string, locale: string } }) {
  const t = await getTranslations({ locale: 'en' })
  const detail = await fetchEnvelopeData(params.id)
  const coinInfo = await fetchCoinInfo(detail.coinType)
  const claimText = `${t('activities.preview.coin.share')} ${formatUnits(detail.totalCoin, coinInfo.decimals!)} ${coinInfo.symbol}`

  const interSemiBold = fetch(new URL('./Inter-SemiBold.ttf', import.meta.url))
    .then((res) => res.arrayBuffer())

  const imageUrl = `http://${VERCEL_URL}${formatCoverImageUrl(detail.coverImageUrl)}`
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '4rem',
          display: 'flex',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          filter: 'blur(80px) saturate(200%)',
        }} />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '4rem',
        }}>
          <img
            src={imageUrl}
            style={{
              borderRadius: '0.5rem',
              objectFit: 'cover',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
              flexBasis: '500px',
              flexGrow: 0,
              flexShrink: 0,
              width: 500,
              height: 500
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#6b7280', textAlign: 'center' }}>Rooch Raffle</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  fontSize: 70, marginTop: '40px', fontWeight: 600, color: '#111827', textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '500px',

                  // line-clamp-2
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {detail.name}
                </div>
                <div style={{ fontSize: 40, color: '#6b7280', textAlign: 'center' }}>{claimText}</div>
              </div>
            </div>
            <button
              style={{
                marginTop: '60px',
                textAlign: 'center',
                backgroundColor: '#030712',
                color: '#fff',
                borderRadius: '9999px',
                padding: '1rem 2rem',
                fontSize: 40,
                fontWeight: 600,
                maxWidth: '280px',
              }}
            >
              Claim Now
            </button>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await interSemiBold,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}