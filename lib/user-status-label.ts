import type { Doc } from '@/convex/_generated/dataModel'

export type UserStatus = Doc<'users'>['status']

const LABELS_PT: Record<UserStatus, string> = {
  pending: 'Pendente',
  verified: 'Verificado',
  active: 'Ativo',
  rejected: 'Rejeitado',
  suspended: 'Suspenso',
  onboarding: 'Cadastro em andamento',
}

/** Convex `users.status` → rótulo PT-BR para UI administrativa. */
export function userStatusLabelPt(status: UserStatus): string {
  return LABELS_PT[status] ?? String(status)
}
