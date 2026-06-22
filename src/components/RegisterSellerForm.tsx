'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Store,
  MapPin,
  AlignLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { registerSeller } from '@/app/actions/auth.actions';

type Step = 'personal' | 'store';

export function RegisterSellerForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Personal data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Store data
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  function validatePersonal(): string | null {
    if (!firstName.trim()) return 'El nombre es obligatorio.';
    if (!lastName.trim()) return 'El apellido es obligatorio.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Ingresá un email válido.';
    if (password.length < 8)
      return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const err = validatePersonal();
    if (err) { setError(err); return; }
    setStep('store');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!storeName.trim() || !storeAddress.trim()) {
      setError('El nombre y la dirección del corralón son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('firstName', firstName);
    formData.set('lastName', lastName);
    formData.set('email', email);
    formData.set('password', password);
    formData.set('storeName', storeName);
    formData.set('storeAddress', storeAddress);
    formData.set('storeDescription', storeDescription);

    const result = await registerSeller(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/sign-in?registered=true'), 1800);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm">
            Tu corralón está listo. Te redirigimos al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-200">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200">
            <Building2 size={28} className="text-white" />
          </div>
        </div>
        <h1 className="mt-5 text-center text-3xl font-bold tracking-tight text-gray-900">
          Unite a BuildNow
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Creá tu cuenta y empezá a vender materiales de construcción.
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <StepDot active={step === 'personal'} done={step === 'store'} label="Tus datos" number={1} />
          <div className={`h-px w-10 transition-colors ${step === 'store' ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <StepDot active={step === 'store'} done={false} label="Tu corralón" number={2} />
        </div>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100 sm:px-10">

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 — Personal data */}
          {step === 'personal' && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="firstName"
                  label="Nombre"
                  required
                  icon={<User className="h-4 w-4 text-gray-400" />}
                  placeholder="Juan"
                  value={firstName}
                  onChange={setFirstName}
                />
                <FormField
                  id="lastName"
                  label="Apellido"
                  required
                  icon={<User className="h-4 w-4 text-gray-400" />}
                  placeholder="García"
                  value={lastName}
                  onChange={setLastName}
                />
              </div>
              <FormField
                id="email"
                label="Email"
                type="email"
                required
                icon={<Mail className="h-4 w-4 text-gray-400" />}
                placeholder="juan@example.com"
                value={email}
                onChange={setEmail}
              />
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    placeholder="Mínimo 4 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Al menos 4 caracteres.</p>
              </div>

              <button
                type="submit"
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 transition-all"
              >
                Continuar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <p className="text-center text-sm text-gray-500">
                ¿Ya tenés cuenta?{' '}
                <a href="/sign-in" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                  Iniciá sesión
                </a>
              </p>
            </form>
          )}

          {/* STEP 2 — Store data */}
          {step === 'store' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField
                id="storeName"
                label="Nombre del Corralón"
                required
                icon={<Store className="h-4 w-4 text-gray-400" />}
                placeholder="Ej: Materiales El Constructor"
                value={storeName}
                onChange={setStoreName}
              />
              <FormField
                id="storeAddress"
                label="Dirección Comercial"
                required
                icon={<MapPin className="h-4 w-4 text-gray-400" />}
                placeholder="Ej: Av. San Martín 1234, CABA"
                value={storeAddress}
                onChange={setStoreAddress}
              />
              <div>
                <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute top-3 left-0 flex pl-3">
                    <AlignLeft className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea
                    id="storeDescription"
                    rows={3}
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                    placeholder="Breve descripción de los materiales que ofrecés..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setError(null); setStep('personal'); }}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StepDot({
  active, done, label, number,
}: {
  active: boolean; done: boolean; label: string; number: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all
          ${done ? 'bg-orange-500 text-white' : active ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-gray-100 text-gray-400'}`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : number}
      </div>
      <span className={`text-xs font-medium transition-colors ${active || done ? 'text-orange-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

function FormField({
  id, label, required, icon, placeholder, value, onChange, type = 'text',
}: {
  id: string;
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
