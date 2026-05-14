'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/app'

// ⚠ SOLO DEMO — No usar credenciales reales en producción
const ADMIN = { email: 'admin@raices.com', pass: 'admin123', name: 'Administrador' }

type AuthScreen = 'login' | 'register' | 'pending'

interface AuthProps {
  onLogin: (isAdmin: boolean, user: { name: string; email: string }) => void
}

export function AuthScreens({ onLogin }: AuthProps) {
  const [screen, setScreen] = useState<AuthScreen>('login')
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background: 'var(--bg)',
        backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(191,140,32,.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(42,90,172,.05) 0%, transparent 60%)',
      }}
    >
      {screen === 'login'    && <LoginScreen    onRegister={() => setScreen('register')} onLogin={onLogin} />}
      {screen === 'register' && <RegisterScreen onLogin={() => setScreen('login')} onPending={() => setScreen('pending')} />}
      {screen === 'pending'  && <PendingScreen  onLogin={() => setScreen('login')} />}
    </div>
  )
}

function AuthBox({ children, maxWidth = 440 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div className="bg-card border border-bdr2 rounded-[16px] w-full shadow-[0_20px_60px_rgba(0,0,0,.12)] overflow-hidden" style={{ maxWidth }}>
      {children}
    </div>
  )
}

function AuthLogo() {
  return (
    <div className="pt-7 pb-0 text-center px-7">
      <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center text-2xl bg-gold/8 mx-auto mb-3">🌿</div>
      <div className="font-serif text-[24px] text-ink font-normal">Raíces</div>
    </div>
  )
}

function LoginScreen({ onRegister, onLogin }: { onRegister: () => void; onLogin: AuthProps['onLogin'] }) {
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState(false)

  const handleLogin = () => {
    setErr(false)
    if (email.toLowerCase() === ADMIN.email.toLowerCase() && pass === ADMIN.pass) {
      onLogin(true, { name: ADMIN.name, email: ADMIN.email })
      return
    }
    setErr(true)
  }

  return (
    <AuthBox>
      <AuthLogo />
      <div className="px-7 pt-3 pb-1">
        <p className="text-[12px] text-ink3 text-center mt-1 leading-relaxed">Genealogía Familiar · Inicia sesión para continuar</p>
      </div>
      <div className="px-7 py-5">
        {err && (
          <div className="bg-red/10 border border-red/25 rounded-[8px] px-3 py-2 text-[11px] text-red2 mb-3">
            Correo o contraseña incorrectos
          </div>
        )}
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-[10px] font-medium text-ink3">Correo electrónico</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@correo.com"
            className="bg-bg2 border border-bdr2 rounded-[8px] px-2.5 py-2 text-[12px] text-ink outline-none focus:border-gold2 focus:shadow-[0_0_0_3px_rgba(191,140,32,.1)]" />
        </div>
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-[10px] font-medium text-ink3">Contraseña</label>
          <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="bg-bg2 border border-bdr2 rounded-[8px] px-2.5 py-2 text-[12px] text-ink outline-none focus:border-gold2 focus:shadow-[0_0_0_3px_rgba(191,140,32,.1)]" />
        </div>
        <button onClick={handleLogin} className="w-full py-2.5 rounded-[8px] bg-gold text-[#0a0800] text-[12px] font-medium hover:bg-gold2 transition-colors">
          Ingresar →
        </button>
      </div>
      <div className="px-7 py-4 border-t border-bdr text-center text-[12px] text-ink3">
        ¿No tienes cuenta?{' '}
        <button onClick={onRegister} className="text-gold3 font-medium hover:underline">Solicitar acceso</button>
      </div>
    </AuthBox>
  )
}

function RegisterScreen({ onLogin, onPending }: { onLogin: () => void; onPending: () => void }) {
  const [form, setForm] = useState({ name: '', last: '', email: '', fatherName: '', motherName: '', born: '' })
  const [err, setErr] = useState('')

  const handleRegister = () => {
    if (!form.name || !form.last || !form.email) { setErr('Por favor completa los campos requeridos.'); return }
    setErr('')
    onPending()
  }

  return (
    <AuthBox maxWidth={500}>
      <AuthLogo />
      <div className="px-7 pt-3 pb-1 text-center">
        <p className="text-[12px] text-ink3 leading-relaxed">Completa el formulario. Un administrador revisará tu solicitud.</p>
      </div>
      <div className="px-7 py-5">
        {err && <div className="bg-red/10 border border-red/25 rounded-[8px] px-3 py-2 text-[11px] text-red2 mb-3">{err}</div>}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { key: 'name',       label: 'Nombres',           req: true,  type: 'text'  },
            { key: 'last',       label: 'Apellidos',         req: true,  type: 'text'  },
            { key: 'email',      label: 'Correo',            req: true,  type: 'email', full: true },
            { key: 'fatherName', label: 'Nombre del padre',  req: false, type: 'text'  },
            { key: 'motherName', label: 'Nombre de la madre',req: false, type: 'text'  },
            { key: 'born',       label: 'Fecha de nacimiento',req:false, type: 'date'  },
          ].map(f => (
            <div key={f.key} className={`flex flex-col gap-1 ${f.full ? 'col-span-2' : ''}`}>
              <label className="text-[10px] font-medium text-ink3">{f.label}{f.req && <span className="text-red2 ml-0.5">*</span>}</label>
              <input
                type={f.type} value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="bg-bg2 border border-bdr2 rounded-[8px] px-2.5 py-2 text-[12px] text-ink outline-none focus:border-gold2"
              />
            </div>
          ))}
        </div>
        <div className="bg-bg2 rounded-[8px] px-3 py-2.5 text-[11px] text-ink3 leading-relaxed mb-4">
          🔒 Tu contraseña será asignada por el administrador al aprobar tu solicitud.
        </div>
        <button onClick={handleRegister} className="w-full py-2.5 rounded-[8px] bg-gold text-[#0a0800] text-[12px] font-medium hover:bg-gold2 transition-colors">
          Enviar solicitud
        </button>
      </div>
      <div className="px-7 py-4 border-t border-bdr text-center text-[12px] text-ink3">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onLogin} className="text-gold3 font-medium hover:underline">Iniciar sesión</button>
      </div>
    </AuthBox>
  )
}

function PendingScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <AuthBox>
      <AuthLogo />
      <div className="px-7 py-8 text-center">
        <div className="text-[44px] mb-3">⏳</div>
        <div className="font-serif text-[20px] text-ink mb-2">Solicitud enviada</div>
        <div className="text-[12px] text-ink3 leading-relaxed max-w-[300px] mx-auto">
          Tu solicitud está <strong className="text-gold3">pendiente de aprobación</strong>.<br />
          El administrador te contactará con tus credenciales de acceso.
        </div>
      </div>
      <div className="px-7 py-4 border-t border-bdr text-center text-[12px] text-ink3">
        <button onClick={onLogin} className="text-gold3 font-medium hover:underline">← Volver al inicio de sesión</button>
      </div>
    </AuthBox>
  )
}
