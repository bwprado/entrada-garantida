'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import { Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function TestUsersClient() {
  const config = useQuery(api.testUsers.getTestAuthConfig, {})
  const users = useQuery(
    api.testUsers.listTestUsers,
    config?.enabled ? {} : 'skip'
  )
  const createTestUser = useAction(api.testUsers.createTestUser)
  const resetPassword = useAction(api.testUsers.resetTestUserPassword)
  const deleteTestUser = useMutation(api.testUsers.deleteTestUser)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [resetMap, setResetMap] = useState<Record<string, string>>({})

  const sortedUsers = useMemo(() => {
    if (!users) return []
    return [...users].sort((a, b) => b.criadoEm - a.criadoEm)
  }, [users])

  if (config === undefined) {
    return (
      <div className="p-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!config.enabled) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários de teste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ative `ENABLE_TEST_PASSWORD_AUTH=true` para usar este painel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setCreating(true)
    try {
      await createTestUser({
        nome: nome.trim() || undefined,
        email,
        password
      })
      setNome('')
      setEmail('')
      setPassword('')
      toast.success('Usuário de teste criado')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao criar usuário'
      )
    } finally {
      setCreating(false)
    }
  }

  const onDelete = async (userId: Id<'users'>) => {
    setWorkingId(userId)
    try {
      await deleteTestUser({ userId })
      toast.success('Usuário removido')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao remover usuário'
      )
    } finally {
      setWorkingId(null)
    }
  }

  const onResetPassword = async (userId: Id<'users'>) => {
    const passwordValue = resetMap[userId] ?? ''
    if (passwordValue.length < 8) {
      toast.error('Informe uma nova senha com no mínimo 8 caracteres')
      return
    }
    setWorkingId(userId)
    try {
      await resetPassword({ userId, password: passwordValue })
      setResetMap((prev) => ({ ...prev, [userId]: '' }))
      toast.success('Senha redefinida')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao redefinir senha'
      )
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Autenticação de teste</AlertTitle>
        <AlertDescription>
          <p>
            Uma conta cobre ambos os fluxos. Em{' '}
            <span className="font-medium text-foreground">/t/login</span> o
            tester escolhe se navega como beneficiário ou ofertante.
          </p>
          <p>
            Contas criadas com os provedores antigos{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              password_test_beneficiary
            </code>{' '}
            /{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              password_test_ofertante
            </code>{' '}
            deixam de autenticar: recrie-as aqui após o deploy.
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Novo usuário de teste</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
            <div className="space-y-2">
              <Label htmlFor="test-name">Nome (opcional)</Label>
              <Input
                id="test-name"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-email-create">E-mail</Label>
              <Input
                id="test-email-create"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password-create">Senha</Label>
              <Input
                id="test-password-create"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar usuário'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil ativo</TableHead>
                <TableHead>Nova senha</TableHead>
                <TableHead className="w-[220px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => {
                const isBusy = workingId === user._id
                return (
                  <TableRow key={user._id}>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.role === 'beneficiary'
                          ? 'Beneficiário'
                          : user.role === 'ofertante'
                            ? 'Ofertante'
                            : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="password"
                        value={resetMap[user._id] ?? ''}
                        onChange={(event) =>
                          setResetMap((prev) => ({
                            ...prev,
                            [user._id]: event.target.value
                          }))
                        }
                        placeholder="Nova senha"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => void onResetPassword(user._id)}
                        >
                          {isBusy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <RefreshCw className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => void onDelete(user._id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum usuário de teste cadastrado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
