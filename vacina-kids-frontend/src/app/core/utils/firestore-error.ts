/**
 * Tradução de erros do Cloud Firestore para mensagens amigáveis em pt-BR (T5.3).
 * Usada pelos fluxos de escrita (CRUD de crianças, registro de dose). Os códigos
 * são os status gRPC do SDK modular (ex.: `permission-denied`, `unavailable`);
 * a normalização tolera um eventual prefixo `firestore/`.
 */
export function mensagemFirestoreErro(e: unknown): string {
  switch (codigoFirestore(e)) {
    case 'permission-denied':
      return 'Você não tem permissão para esta ação.';
    case 'unauthenticated':
      return 'Sua sessão expirou. Entre novamente.';
    case 'unavailable':
      return 'Serviço indisponível no momento. Tente novamente em instantes.';
    case 'deadline-exceeded':
    case 'cancelled':
      return 'A conexão demorou demais. Verifique sua internet.';
    case 'not-found':
      return 'Registro não encontrado. Atualize a página e tente de novo.';
    case 'already-exists':
      return 'Este registro já existe.';
    case 'resource-exhausted':
      return 'Limite de uso atingido. Tente novamente mais tarde.';
    default:
      return 'Não foi possível salvar. Tente novamente.';
  }
}

function codigoFirestore(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    const code = (e as { code: unknown }).code;
    return typeof code === 'string' ? code.replace(/^firestore\//, '') : '';
  }
  return '';
}
