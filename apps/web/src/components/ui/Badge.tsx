import clsx from 'clsx'
import { EP_COLORS } from '@/lib/utils'

export function Badge({ children, variant = 'default', style }: {
  children: React.ReactNode
  variant?: 'gold' | 'green' | 'blue' | 'purple' | 'default'
  style?: React.CSSProperties
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
        variant === 'gold'    && 'bg-gold/13 text-gold3 border-gold/22',
        variant === 'green'   && 'bg-grn/20 text-grn3 border-grn/30',
        variant === 'blue'    && 'bg-blu/20 text-blu2 border-blu/30',
        variant === 'purple'  && 'bg-pur/20 text-pur2 border-pur/30',
        variant === 'default' && 'bg-bg2 text-ink3 border-bdr',
      )}
      style={style}
    >
      {children}
    </span>
  )
}

export function EventPill({ type }: { type: string }) {
  const m = EP_COLORS[type] ?? EP_COLORS.otro
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
      style={{ background: m.bg, color: m.tc, border: `1px solid ${m.dot}33` }}
    >
      {type}
    </span>
  )
}
