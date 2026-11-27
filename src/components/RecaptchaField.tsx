'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export type RecaptchaFieldHandle = {
  reset: () => void;
};

type Props = {
  onTokenChange?: (token: string | null) => void;
};

export const RecaptchaField = forwardRef<RecaptchaFieldHandle, Props>(
  function RecaptchaField({ onTokenChange }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
    const captchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset() {
        captchaRef.current?.reset();
        onTokenChange?.(null);
      },
    }));

    if (!siteKey) {
      return (
        <p className="form-error" role="alert">
          reCAPTCHA não configurado. Defina NEXT_PUBLIC_RECAPTCHA_SITE_KEY no
          arquivo .env.
        </p>
      );
    }

    return (
      <div className="form-row">
        <label>Verificação de segurança</label>
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={siteKey}
          theme="light"
          hl="pt-BR"
          onChange={(token) => onTokenChange?.(token)}
          onExpired={() => onTokenChange?.(null)}
          onErrored={() => onTokenChange?.(null)}
        />
      </div>
    );
  },
);
