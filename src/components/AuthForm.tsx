'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { ActionState, AuthFields } from '@/actions/auth';
import {
  RecaptchaField,
  type RecaptchaFieldHandle,
} from '@/components/RecaptchaField';

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
  onFieldsRestore?: (fields: AuthFields) => void;
};

export function AuthForm({
  action,
  children,
  submitLabel,
  onFieldsRestore,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [clientError, setClientError] = useState('');
  const captchaRef = useRef<RecaptchaFieldHandle>(null);

  useEffect(() => {
    if (state.fields) onFieldsRestore?.(state.fields);
    // Só reage ao retorno da action; o callback do pai pode mudar a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fields]);

  useEffect(() => {
    if (state.error || state.success) {
      captchaRef.current?.reset();
      setRecaptchaToken('');
    }
  }, [state.error, state.success]);

  function handleSubmit(formData: FormData) {
    setClientError('');
    if (!recaptchaToken) {
      setClientError('Confirme o reCAPTCHA antes de continuar.');
      return;
    }
    formData.set('recaptchaToken', recaptchaToken);
    formAction(formData);
  }

  return (
    <form className="form" action={handleSubmit}>
      {children}
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
      {state.success && (
        <p className="form-success" role="status">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={pending || !recaptchaToken}
        aria-busy={pending}
      >
        {pending ? 'Aguarde…' : submitLabel}
      </button>
    </form>
  );
}
