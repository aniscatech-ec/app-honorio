import { ini, ac } from '@/lib/utils'
import type { Person } from '@/types'

interface AvatarProps {
  person: Pick<Person, 'id' | 'name' | 'last' | 'photo_url'>
  size?: number
  fontSize?: number
  className?: string
  style?: React.CSSProperties
  idx?: number
}

export function Avatar({ person, size = 32, fontSize = 13, className = '', style, idx }: AvatarProps) {
  const colorIdx = idx ?? (person.id.charCodeAt(person.id.length - 1) % 8)
  const [fg, bg] = ac(colorIdx)

  if (person.photo_url) {
    return (
      <img
        src={person.photo_url}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }}
        className={className}
        alt=""
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-serif flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize, background: bg, color: fg, ...style }}
    >
      {ini(person.name, person.last)}
    </div>
  )
}
