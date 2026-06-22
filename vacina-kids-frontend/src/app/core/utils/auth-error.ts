/**
 * Tradução de códigos de erro do Firebase Auth para mensagens amigáveis em
 * pt-BR (T5.3). Fonte única reusada pelo `auth.page` (login/cadastro/recuperação)
 * e pelos modais de conta (edit-account/change-password).
 *
 * O mesmo código (`auth/invalid-credential`/`wrong-password`) significa coisas
 * diferentes conforme o contexto: no login é "e-mail ou senha incorretos"; ao
 * reautenticar para trocar senha é "senha atual incorreta". O parâmetro
 * `contexto` resolve essa ambiguidade sem duplicar o mapa.
 */
export function mensagemAuthErro(e: unknown, contexto?: 'reauth'): string {
  switch (codigoFirebase(e)) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return contexto === 'reauth'
        ? 'Senha atual incorreta.'
        : 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/missing-password':
      return 'Informe a senha.';
    case 'auth/weak-password':
      return 'A senha deve ter ao menos 6 caracteres.';
    case 'auth/requires-recent-login':
      return 'Por segurança, entre novamente antes de alterar estes dados.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/operation-not-allowed':
      return 'Operação indisponível no momento. Tente mais tarde.';
    default:
      return 'Não foi possível concluir. Tente novamente.';
  }
}

function codigoFirebase(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    const code = (e as { code: unknown }).code;
    return typeof code === 'string' ? code : '';
  }
  return '';
}
