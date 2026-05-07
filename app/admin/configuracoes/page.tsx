'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { api } from '@/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminConfiguracoesPage() {
  const [beneficiaryLoginEnabled, setBeneficiaryLoginEnabled] = useState(false)
  const [ofertanteLoginEnabled, setOfertanteLoginEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loginAvailability = useQuery(api.users.getLoginAvailabilityForAdmin, {})
  const setLoginAvailability = useMutation(api.users.setLoginAvailability)

  useEffect(() => {
    if (!loginAvailability || isSaving) return
    setBeneficiaryLoginEnabled(loginAvailability.beneficiaryLoginEnabled)
    setOfertanteLoginEnabled(loginAvailability.ofertanteLoginEnabled)
  }, [loginAvailability, isSaving])

  const hasLoaded = loginAvailability !== undefined
  const hasChanges =
    hasLoaded &&
    (beneficiaryLoginEnabled !== loginAvailability.beneficiaryLoginEnabled ||
      ofertanteLoginEnabled !== loginAvailability.ofertanteLoginEnabled)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await setLoginAvailability({
        beneficiaryLoginEnabled,
        ofertanteLoginEnabled
      })
      toast.success('Configurações salvas')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de acesso por perfil</CardTitle>
        <CardDescription>
          Defina quais perfis podem iniciar login na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Login de beneficiário</p>
            <p className="text-sm text-muted-foreground">
              Ative quando iniciar o acesso dos beneficiários.
            </p>
          </div>
          <Switch
            checked={beneficiaryLoginEnabled}
            onCheckedChange={setBeneficiaryLoginEnabled}
            disabled={!hasLoaded || isSaving}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Login de ofertante</p>
            <p className="text-sm text-muted-foreground">
              Mantém o acesso dos vendedores de imóveis.
            </p>
          </div>
          <Switch
            checked={ofertanteLoginEnabled}
            onCheckedChange={setOfertanteLoginEnabled}
            disabled={!hasLoaded || isSaving}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void handleSave()}
            disabled={!hasLoaded || !hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar disponibilidade'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
