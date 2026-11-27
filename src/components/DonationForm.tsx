'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  donateAction,
  type DonationFields,
  type DonationState,
} from '@/actions/donation';
import {
  RecaptchaField,
  type RecaptchaFieldHandle,
} from '@/components/RecaptchaField';
import {
  isValidCpfOrCnpj,
  isValidFullName,
  validateBirthDate,
} from '@/lib/donation-validation';
import { formatName } from '@/lib/format-name';

const PRESETS = [10, 30, 60, 90];
const todayIso = new Date().toISOString().slice(0, 10);

const emptyFields: DonationFields = {
  donorName: '',
  document: '',
  email: '',
  phone: '',
  birthDate: '',
  amount: '30',
};

export function DonationForm({ publicacaoId }: { publicacaoId?: string }) {
  const [fields, setFields] = useState<DonationFields>(emptyFields);
  const [useCustom, setUseCustom] = useState(false);
  const [custom, setCustom] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [clientError, setClientError] = useState('');
  const [state, formAction, pending] = useActionState(
    donateAction,
    {} as DonationState,
  );
  const captchaRef = useRef<RecaptchaFieldHandle>(null);

  const amount = useCustom ? Number(custom) || 0 : Number(fields.amount) || 30;

  useEffect(() => {
    if (state.fields) {
      setFields(state.fields);
      const preset = Number(state.fields.amount);
      if (preset && PRESETS.includes(preset)) {
        setUseCustom(false);
      } else if (state.fields.amount) {
        setUseCustom(true);
        setCustom(state.fields.amount);
      }
    }
  }, [state.fields]);

  useEffect(() => {
    if (state.error) {
      captchaRef.current?.reset();
      setRecaptchaToken('');
    }
  }, [state.error]);

  function updateField<K extends keyof DonationFields>(
    key: K,
    value: DonationFields[K],
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(formData: FormData) {
    setClientError('');

    const donorName = formatName(fields.donorName);
    if (donorName !== fields.donorName) {
      updateField('donorName', donorName);
    }

    if (!isValidFullName(donorName)) {
      setClientError('Informe o nome completo (nome e sobrenome).');
      return;
    }
    if (!isValidCpfOrCnpj(fields.document)) {
      setClientError('CPF ou CNPJ inválido.');
      return;
    }
    const birthError = validateBirthDate(fields.birthDate);
    if (birthError) {
      setClientError(birthError);
      return;
    }
    if (!recaptchaToken) {
      setClientError('Confirme o reCAPTCHA antes de continuar.');
      return;
    }

    formData.set('amount', String(amount));
    formData.set('donorName', donorName);
    formData.set('document', fields.document);
    formData.set('email', fields.email);
    formData.set('phone', fields.phone);
    formData.set('birthDate', fields.birthDate);
    formData.set('recaptchaToken', recaptchaToken);
    formAction(formData);
  }

  return (
    <section className="donation-block prose" style={{ marginTop: '2rem' }}>
      <h2>Faça sua doação</h2>
      <p className="muted">
        Escolha um valor e preencha seus dados. Você será direcionado para o
        pagamento via PIX.
      </p>

      <div
        className="amount-grid"
        style={{ marginBottom: '1.25rem' }}
        role="group"
        aria-label="Valor da doação"
      >
        {PRESETS.map((value) => {
          const isActive = !useCustom && amount === value;
          return (
            <button
              key={value}
              type="button"
              className={`amount-option ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              onClick={() => {
                setUseCustom(false);
                updateField('amount', String(value));
              }}
            >
              R$ {value}
            </button>
          );
        })}
        <button
          type="button"
          className={`amount-option ${useCustom ? 'active' : ''}`}
          aria-pressed={useCustom}
          onClick={() => setUseCustom(true)}
        >
          Outro
        </button>
      </div>

      {useCustom && (
        <div className="form-row" style={{ marginBottom: '1rem' }}>
          <label htmlFor="customAmount">Valor livre (mín. R$ 10)</label>
          <input
            id="customAmount"
            type="number"
            min={10}
            step="1"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              updateField('amount', e.target.value);
            }}
            placeholder="Ex: 50"
          />
        </div>
      )}

      <form className="form" action={handleSubmit}>
        <input type="hidden" name="amount" value={amount} />
        {publicacaoId ? (
          <input type="hidden" name="publicacaoId" value={publicacaoId} />
        ) : null}
        <div className="form-row">
          <label htmlFor="donorName">Nome completo</label>
          <input
            id="donorName"
            name="donorName"
            required
            autoComplete="name"
            placeholder="Nome e sobrenome"
            minLength={5}
            value={fields.donorName}
            onChange={(e) => updateField('donorName', e.target.value)}
            onBlur={() =>
              updateField('donorName', formatName(fields.donorName))
            }
          />
        </div>
        <div className="form-row">
          <label htmlFor="document">CPF ou CNPJ</label>
          <input
            id="document"
            name="document"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="Somente números"
            minLength={11}
            maxLength={18}
            value={fields.document}
            onChange={(e) => updateField('document', e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={fields.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="phone">Telefone</label>
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            minLength={10}
            value={fields.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="birthDate">Data de nascimento</label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            max={todayIso}
            value={fields.birthDate}
            onChange={(e) => updateField('birthDate', e.target.value)}
          />
        </div>
        <RecaptchaField
          ref={captchaRef}
          onTokenChange={(token) => setRecaptchaToken(token || '')}
        />
        <input type="hidden" name="recaptchaToken" value={recaptchaToken} readOnly />
        {(clientError || state.error) && (
          <p className="form-error" role="alert">
            {clientError || state.error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending || !recaptchaToken}
          aria-busy={pending}
        >
          {pending ? 'Aguarde…' : 'Doe agora mesmo'}
        </button>
      </form>
    </section>
  );
}
