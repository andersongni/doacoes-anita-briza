import { RegisterForm } from '@/components/RegisterForm';

export default function CadastroPage() {
  return (
    <div className="container">
      <div className="auth-panel">
        <header className="page-hero">
          <h1>Cadastre-se</h1>
          <p>
            Preencha seus dados. Novos usuários precisam de aprovação de um usuário
            já autorizado.
          </p>
        </header>
        <RegisterForm />
      </div>
    </div>
  );
}
