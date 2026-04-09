# Aquisição Assistida

Sistema de Oferta de Imóveis para Aquisição Assistida - Governo do Maranhão / SECID

## Configuração do Ambiente

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Convex

```bash
npx convex dev
```

Isso irá:
- Criar um novo deployment Convex
- Gerar os arquivos em `convex/_generated/`
- Fornecer a URL do deployment

Copie a URL fornecida para o arquivo `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://seu-deployment.convex.cloud
```

### 3. Configurar Twilio (SMS OTP)

1. Crie uma conta em [twilio.com](https://twilio.com)
2. Compre um número de telefone
3. Adicione as credenciais ao `.env.local`:

```env
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

### 4. Configurar Cloudflare R2 (Armazenamento de Documentos)

O sistema usa o componente `@convex-dev/r2` para armazenamento de arquivos.

#### 4.1 Criar Bucket R2

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá para **R2 Object Storage**
3. Clique em **Create bucket**
4. Nomeie o bucket: `aquisicao-assistida`

#### 4.2 Configurar CORS

No bucket criado, vá em **Settings** > **CORS Policy** e adicione:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"]
  }
]
```

Para produção, substitua `http://localhost:3000` pelo seu domínio.

#### 4.3 Criar API Token

1. Na página principal do R2, clique em **Manage R2 API Tokens**
2. Clique em **Create API Token**
3. Configure:
   - **Nome**: `aquisicao-assistida`
   - **Permissões**: Object Read & Write
   - **Bucket**: Selecione o bucket criado
4. Clique em **Create API Token**
5. Anote os valores fornecidos:
   - **Token Value** → `R2_TOKEN`
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
   - **Endpoint** → `R2_ENDPOINT`

#### 4.4 Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
R2_TOKEN=seu_token_value
R2_ACCESS_KEY_ID=sua_access_key_id
R2_SECRET_ACCESS_KEY=seu_secret_access_key
R2_ENDPOINT=https://seu_account_id.r2.cloudflarestorage.com
R2_BUCKET=aquisicao-assistida
```

Ou use o CLI do Convex:

```bash
npx convex env set R2_TOKEN xxxxx
npx convex env set R2_ACCESS_KEY_ID xxxxx
npx convex env set R2_SECRET_ACCESS_KEY xxxxx
npx convex env set R2_ENDPOINT xxxxx
npx convex env set R2_BUCKET aquisicao-assistida-documents
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

## Estrutura do Projeto

```
convex/
├── convex.config.ts   # Configuração de componentes (R2)
├── schema.ts          # Schema do banco de dados
├── r2.ts              # Cliente do componente R2
├── users.ts           # Mutations/Queries de usuários
├── properties.ts      # Mutations/Queries de propriedades
├── documents.ts       # Mutations/Queries de documentos
├── public.ts          # Queries públicas
└── _generated/        # Arquivos gerados automaticamente

app/
├── page.tsx                           # Landing page
├── login/page.tsx                     # Login com OTP
├── admin/
│   ├── dashboard/page.tsx             # Painel admin
│   └── beneficiarios/upload/page.tsx  # Upload em massa
├── beneficiario/
│   ├── cadastro/page.tsx              # Cadastro (será removido)
│   └── dashboard/page.tsx             # Dashboard beneficiário
├── construtor/
│   ├── cadastro/page.tsx              # Cadastro construtor
│   └── dashboard/page.tsx             # Dashboard construtor
└── imoveis/                           # Listagem de imóveis
```

## Fluxo de Autenticação

1. Beneficiário entra com CPF na página de login
2. Sistema verifica se CPF está na lista de pré-aprovados
3. Sistema envia SMS com código de 6 dígitos
4. Beneficiário digita o código
5. Sistema valida e cria sessão
6. Beneficiário aceita os termos do programa
7. Beneficiário pode selecionar até 3 imóveis

## Regras de Negócio

### Teto de Preço
- Valor máximo do imóvel: **R$ 200.000,00**
- O sistema bloqueia propostas acima deste valor

### Composição Mínima do Imóvel
- Mínimo obrigatório:
  - 1 sala
  - 1 quarto
  - 1 banheiro
  - Cozinha
  - Área de serviço

### Ranking de Beneficiários
Ordenação por prioridade:
1. Tempo em aluguel social (maior primeiro)
2. Possui idoso na família (true primeiro)
3. Chefe de família mulher (true primeiro)

### Seleção de Imóveis
- Beneficiário pode selecionar até 3 imóveis
- Apenas imóveis com status "validated" são exibidos
- Seleção pode ser feita a qualquer momento após aceitar termos

## Papéis de Usuário

| Papel | Descrição |
|-------|-----------|
| `admin` | Administração Pública (SECID) |
| `beneficiary` | Beneficiário pré-aprovado |
| `ofertante` | Vendedor pessoa física |
| `construtor` | Empresa construtora/incorporadora |

## Documentos Obrigatórios (Imóveis)

1. Matrícula atualizada do imóvel
2. IPTU ou Foro quitado
3. Certidão negativa de tributos municipais
4. Certidão negativa de indisponibilidade
5. Certidão negativa de débito de condomínio

## Upload de Arquivos

O sistema usa o componente `@convex-dev/r2` para upload de documentos:

### Fluxo de Upload

1. Frontend usa `useUploadFile(api.r2)` hook
2. Componente gera URL assinada
3. Arquivo é enviado diretamente para R2
4. Metadata é sincronizada com Convex
5. Aplicação cria registro na tabela `documents`

### Exemplo de Uso

```typescript
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@/convex/_generated/api";

function UploadDocument() {
  const uploadFile = useUploadFile(api.r2);
  
  async function handleUpload(file: File) {
    const key = await uploadFile(file);
    // Salvar key no banco de dados
  }
}
```

## Desenvolvimento

### Sem Twilio (Modo Dev)

Sem credenciais Twilio, o sistema loga o OTP no console:

```
[DEV] OTP para 12345678901: 123456
```

### Criar Admin Inicial

Execute no console do Convex Dashboard:

```javascript
await ctx.db.insert("users", {
  role: "admin",
  cpf: "00000000000",
  nome: "Admin",
  email: "admin@example.com",
  telefone: "99999999999",
  senhaHash: "admin123",
  status: "active",
  criadoEm: Date.now(),
  atualizadoEm: Date.now(),
});
```

## Deploy

### Vercel

```bash
vercel
```

Adicione as variáveis de ambiente no dashboard do Vercel.

### Variáveis de Ambiente (Produção)

- `NEXT_PUBLIC_CONVEX_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `R2_TOKEN`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_BUCKET`

## Licença

Governo do Estado do Maranhão - SECID
