import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect
} from '@convex-dev/auth/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isBeneficiarioProtectedRoute = createRouteMatcher([
  '/beneficiario/dashboard(.*)',
  '/beneficiario/perfil(.*)'
])
const isOfertanteProtectedRoute = createRouteMatcher([
  '/ofertante/dashboard(.*)',
  '/ofertante/onboarding(.*)',
  '/ofertante/perfil(.*)',
  '/ofertante/imoveis(.*)'
])

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isAdminRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, '/login/admin')
  }

  if (
    isBeneficiarioProtectedRoute(request) &&
    !(await convexAuth.isAuthenticated())
  ) {
    return nextjsMiddlewareRedirect(request, '/login/beneficiario')
  }

  if (
    isOfertanteProtectedRoute(request) &&
    !(await convexAuth.isAuthenticated())
  ) {
    return nextjsMiddlewareRedirect(request, '/login/ofertante')
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
