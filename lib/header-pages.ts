import { adminPaths } from '@/lib/app-links'

export type HeaderPageConfig = {
  title?: string
  subtitle?: string
  showBack?: boolean
}

const headerPageConfigEntries: Array<{
  match: (pathname: string) => boolean
  config: HeaderPageConfig
}> = [
  {
    match: (pathname) => pathname === adminPaths.dashboard,
    config: {
      title: 'Painel administrativo',
      subtitle: 'Visão geral e ações rápidas.'
    }
  },
  {
    match: (pathname) => pathname === adminPaths.beneficiarios,
    config: {
      title: 'Beneficiários',
      subtitle: 'Lista paginada, busca e ações administrativas.',
      showBack: true
    }
  },
  {
    match: (pathname) => pathname === adminPaths.ofertantes,
    config: {
      title: 'Ofertantes',
      subtitle: 'Pendentes de onboarding e ofertantes ativos.',
      showBack: true
    }
  },
  {
    match: (pathname) => pathname === adminPaths.imoveis,
    config: {
      title: 'Imóveis',
      subtitle: 'Listagem de cadastros, filtros por status e busca.',
      showBack: true
    }
  },
  {
    match: (pathname) => pathname === adminPaths.beneficiariosUpload,
    config: {
      title: 'Importar beneficiários',
      subtitle: 'Envie CSV ou PDF para carga em lote.',
      showBack: true
    }
  },
  {
    match: (pathname) => pathname === adminPaths.testUsers,
    config: {
      title: 'Usuários de teste',
      subtitle: 'Gestão de credenciais de homologação.'
    }
  },
  {
    match: (pathname) => pathname === adminPaths.configuracoes,
    config: {
      title: 'Configurações',
      subtitle: 'Controle de disponibilidade de login por perfil.'
    }
  },
  {
    match: (pathname) => pathname.startsWith(`${adminPaths.imoveis}/`) && pathname.endsWith('/revisar'),
    config: {
      title: 'Revisar imóvel',
      subtitle: 'Valide dados do imóvel e documentos vinculados.',
      showBack: true
    }
  }
]

export function getHeaderPageConfig(pathname: string | null): HeaderPageConfig {
  if (!pathname) return {}
  const matched = headerPageConfigEntries.find((entry) => entry.match(pathname))
  return matched?.config ?? {}
}
