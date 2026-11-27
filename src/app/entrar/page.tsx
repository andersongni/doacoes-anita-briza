import { LoginForm } from '@/components/LoginForm';

export default function EntrarPage() {
  return (
    <div className="container">
      <div className="auth-panel">
        <header className="page-hero">
          <h1>Acessar sua conta</h1>
          <p>Entre com o e-mail e a senha cadastrados.</p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}
