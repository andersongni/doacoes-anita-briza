'use client';

import Link from 'next/link';
import { useState } from 'react';
import { registerAction } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';
import { formatName } from '@/lib/format-name';

export function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  return (
    <>
      <AuthForm
        action={registerAction}
        submitLabel="Criar conta"
        onFieldsRestore={(fields) => {
          if (fields.firstName != null) setFirstName(fields.firstName);
          if (fields.lastName != null) setLastName(fields.lastName);
          if (fields.email != null) setEmail(fields.email);
          if (fields.password != null) setPassword(fields.password);
          if (fields.passwordConfirmation != null) {
            setPasswordConfirmation(fields.passwordConfirmation);
          }
        }}
      >
        <div className="form-row">
          <label htmlFor="firstName">Nome</label>
          <input
            id="firstName"
            name="firstName"
            required
            minLength={2}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setFirstName(formatName(firstName))}
          />
        </div>
        <div className="form-row">
          <label htmlFor="lastName">Sobrenome</label>
          <input
            id="lastName"
            name="lastName"
            required
            minLength={2}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setLastName(formatName(lastName))}
          />
        </div>
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
        <div className="form-row">
          <label htmlFor="passwordConfirmation">Repita a senha</label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>
      </AuthForm>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Já tem conta? <Link href="/entrar">Acessar sua conta</Link>
      </p>
    </>
  );
}
