export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  try {
    const { syncAdminPasswordFromEnv } = await import('@/lib/sync-admin-password');
    const result = await syncAdminPasswordFromEnv({ createIfMissing: true });
    if (result === 'updated' || result === 'created') {
      console.log(`[startup] ADMIN_PASSWORD sincronizada (${result}).`);
    }
  } catch (err) {
    console.error('[startup] Falha ao sincronizar ADMIN_PASSWORD:', err);
  }
}
