'use client';

import Link from 'next/link';
import { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <AuthForm
        action={loginAction}
        submitLabel="Entrar"
        onFieldsRestore={(fields) => {
          if (fields.email != null) setEmail(fields.email);
          if (fields.password != null) setPassword(fields.password);
        }}
      >
        <div className="form-row">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </AuthForm>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Não tem conta? <Link href="/cadastre-se">Cadastre-se</Link>
      </p>
    </>
  );
}
