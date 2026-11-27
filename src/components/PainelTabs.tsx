'use client';

import { useRef, useState } from 'react';
import { ContentImageField } from '@/components/ContentImageField';

type Publicacao = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: 'CAMPANHA' | 'PRESTACAO_CONTAS';
  published: boolean;
};

type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
};

type Doador = {
  id: string;
  amount: number;
  donorName: string;
  document: string;
  email: string;
  phone: string;
  birthDate: string;
  publicacaoId: string | null;
  campaignTitle: string | null;
  createdAt: string;
};

type Props = {
  publicacoes: Publicacao[];
  pages: Page[];
  users: User[];
  doadores: Doador[];
  shareMessage: string;
  savePublicacaoAction: (formData: FormData) => Promise<void>;
  deletePublicacaoAction: (formData: FormData) => Promise<void>;
  savePageAction: (formData: FormData) => Promise<void>;
  setUserStatusAction: (formData: FormData) => Promise<void>;
  deleteUserAction: (formData: FormData) => Promise<void>;
  saveShareMessageAction: (formData: FormData) => Promise<void>;
  protectedAdminEmail: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function formatBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [y, m, d] = value.split('-');
  return `${d}/${m}/${y}`;
}

function formatDocument(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }
  return value;
}

export function PainelTabs({
  publicacoes,
  pages,
  users,
  doadores,
  shareMessage,
  savePublicacaoAction,
  deletePublicacaoAction,
  savePageAction,
  setUserStatusAction,
  deleteUserAction,
  saveShareMessageAction,
  protectedAdminEmail,
}: Props) {
  const [tab, setTab] = useState<
    'publicacoes' | 'pages' | 'users' | 'doadores' | 'config'
  >('publicacoes');
  const [editingPub, setEditingPub] = useState<Publicacao | null>(null);
  const [creatingPub, setCreatingPub] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const pubContentRef = useRef<HTMLTextAreaElement>(null);
  const pageContentRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <div className="admin-nav">
        <button
          type="button"
          className={`btn ${tab === 'publicacoes' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('publicacoes')}
        >
          Publicações
        </button>
        <button
          type="button"
          className={`btn ${tab === 'pages' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('pages')}
        >
          Páginas
        </button>
        <button
          type="button"
          className={`btn ${tab === 'users' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('users')}
        >
          Usuários
        </button>
        <button
          type="button"
          className={`btn ${tab === 'doadores' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('doadores')}
        >
          Doadores
        </button>
        <button
          type="button"
          className={`btn ${tab === 'config' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('config')}
        >
          Configurações
        </button>
      </div>

      {tab === 'publicacoes' && (
        <div className="stack">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setCreatingPub(true);
              setEditingPub(null);
            }}
          >
            Nova publicação
          </button>

          {(creatingPub || editingPub) && (
            <form className="form prose" action={savePublicacaoAction}>
              {editingPub && <input type="hidden" name="id" value={editingPub.id} />}
              <h3>{editingPub ? 'Editar publicação' : 'Nova publicação'}</h3>
              <div className="form-row">
                <label>Título</label>
                <input name="title" required minLength={3} defaultValue={editingPub?.title || ''} />
              </div>
              <div className="form-row">
                <label>Resumo</label>
                <input name="excerpt" defaultValue={editingPub?.excerpt || ''} />
              </div>
              <div className="form-row">
                <label>Categoria</label>
                <select name="category" defaultValue={editingPub?.category || 'CAMPANHA'}>
                  <option value="CAMPANHA">Campanha</option>
                  <option value="PRESTACAO_CONTAS">Prestação de contas</option>
                </select>
              </div>
              <div className="form-row">
                <label>Conteúdo</label>
                <textarea
                  ref={pubContentRef}
                  name="content"
                  required
                  minLength={3}
                  rows={10}
                  defaultValue={editingPub?.content || ''}
                />
                <ContentImageField textareaRef={pubContentRef} />
              </div>
              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={editingPub?.published ?? true}
                />{' '}
                Publicado
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setCreatingPub(false);
                    setEditingPub(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {publicacoes.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.category === 'CAMPANHA' ? 'Campanha' : 'Prestação de contas'}</td>
                  <td>{p.published ? 'Publicado' : 'Rascunho'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingPub(p);
                          setCreatingPub(false);
                        }}
                      >
                        Editar
                      </button>
                      <form action={deletePublicacaoAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="btn btn-danger btn-sm">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pages' && (
        <div className="stack">
          <p className="muted">
            As páginas estáticas (Sobre, Termos, Contato e Agradecimento) só podem ser
            editadas. Na página de agradecimento use {'{nome}'} e {'{valor}'} no título
            ou no texto.
          </p>

          {editingPage && (
            <form className="form prose" action={savePageAction} key={editingPage.id}>
              <input type="hidden" name="id" value={editingPage.id} />
              <h3>
                Editar página
                {editingPage.slug === 'obrigado' ? ' de agradecimento' : ''}
              </h3>
              {editingPage.slug === 'obrigado' && (
                <p className="muted">
                  Este conteúdo aparece em /obrigado após a doação. Placeholders:{' '}
                  <code>{'{nome}'}</code>, <code>{'{valor}'}</code>.
                </p>
              )}
              <div className="form-row">
                <label>Título</label>
                <input name="title" required minLength={3} defaultValue={editingPage.title} />
              </div>
              <div className="form-row">
                <label>Slug</label>
                <input
                  name="slug"
                  defaultValue={editingPage.slug}
                  readOnly={editingPage.slug === 'obrigado'}
                />
              </div>
              <div className="form-row">
                <label>Conteúdo</label>
                <textarea
                  ref={pageContentRef}
                  name="content"
                  required
                  minLength={3}
                  rows={10}
                  defaultValue={editingPage.content}
                />
                <ContentImageField textareaRef={pageContentRef} />
              </div>
              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={editingPage.published}
                />{' '}
                Publicado
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingPage(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    {page.title}
                    {page.slug === 'obrigado' ? (
                      <span className="muted"> (agradecimento)</span>
                    ) : null}
                  </td>
                  <td>{page.slug}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingPage(page)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isProtectedAdmin =
                !!protectedAdminEmail &&
                u.email.toLowerCase() === protectedAdminEmail;

              return (
                <tr key={u.id}>
                  <td>
                    {u.firstName} {u.lastName}
                    {isProtectedAdmin ? (
                      <span className="muted"> (admin)</span>
                    ) : null}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.status}</td>
                  <td>
                    <div className="table-actions">
                      {u.status === 'PENDING' && (
                        <>
                          <form action={setUserStatusAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button type="submit" className="btn btn-secondary btn-sm">
                              Aprovar
                            </button>
                          </form>
                          <form action={setUserStatusAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="status" value="REJECTED" />
                            <button type="submit" className="btn btn-danger btn-sm">
                              Rejeitar
                            </button>
                          </form>
                        </>
                      )}
                      {!isProtectedAdmin && (
                        <form action={deleteUserAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              if (
                                !confirm(
                                  `Excluir o usuário ${u.firstName} ${u.lastName}?`,
                                )
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Excluir
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {tab === 'doadores' && (
        <div className="stack">
          <p className="muted">
            {doadores.length === 0
              ? 'Nenhuma doação registrada ainda.'
              : `${doadores.length} doação(ões) registrada(s), da mais recente para a mais antiga.`}
          </p>
          {doadores.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Doador</th>
                  <th>Documento</th>
                  <th>Contato</th>
                  <th>Nascimento</th>
                  <th>Valor</th>
                  <th>Campanha</th>
                </tr>
              </thead>
              <tbody>
                {doadores.map((d) => (
                  <tr key={d.id}>
                    <td>{formatDateTime(d.createdAt)}</td>
                    <td>{d.donorName}</td>
                    <td>{formatDocument(d.document)}</td>
                    <td>
                      <div>{d.email}</div>
                      <div className="muted">{d.phone}</div>
                    </td>
                    <td>{formatBirthDate(d.birthDate)}</td>
                    <td>{formatCurrency(d.amount)}</td>
                    <td>{d.campaignTitle || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'config' && (
        <div className="stack">
          <form className="form prose" action={saveShareMessageAction}>
            <h3>Mensagem de compartilhamento</h3>
            <p className="muted">
              Usada na página de agradecimento ao compartilhar a campanha. Placeholders:{' '}
              <code>{'{valor}'}</code>, <code>{'{url}'}</code>, <code>{'{nome}'}</code>.
            </p>
            <div className="form-row">
              <label htmlFor="shareMessage">Mensagem padrão</label>
              <textarea
                id="shareMessage"
                name="shareMessage"
                required
                minLength={10}
                rows={4}
                defaultValue={shareMessage}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Salvar mensagem
            </button>
          </form>
        </div>
      )}
    </>
  );
}
