import { v } from 'convex/values'
import { mutation, query, internalMutation, action } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'
import { api } from './_generated/api'

// ============ PHONE LOGIN MUTATIONS ============

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Clean CPF (remove non-digits)
function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

// Validate CPF format (basic)
function isValidCPFLength(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  return cleaned.length === 11
}

// ============ QUERIES ============

export const getByCPF = query({
  args: { cpf: v.string() },
  handler: async (ctx, args): Promise<Doc<'users'> | null> => {
    const cleaned = cleanCPF(args.cpf)
    if (!isValidCPFLength(cleaned)) return null

    return await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
      .first()
  }
})

export const getById = query({
  args: { id: v.id('users') },
  handler: async (ctx, args): Promise<Doc<'users'> | null> => {
    return await ctx.db.get(args.id)
  }
})

export const getBeneficiaries = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('verified'),
        v.literal('active'),
        v.literal('rejected'),
        v.literal('suspended')
      )
    )
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('users')
        .withIndex('by_role_and_status', (q) =>
          q.eq('role', 'beneficiary').eq('status', args.status!)
        )
        .collect()
    }

    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'beneficiary'))
      .collect()
  }
})

export const getBeneficiariesForRanking = query({
  args: {},
  handler: async (ctx) => {
    const beneficiaries = await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'beneficiary').eq('status', 'active')
      )
      .collect()

    // Sort by ranking priority:
    // 1. mesesAluguelSocial (higher = higher priority)
    // 2. possuiIdosoFamilia (true first)
    // 3. chefiaFeminina (true first)
    return beneficiaries.sort((a, b) => {
      // Primary: time in social rent (descending)
      const aMeses = a.mesesAluguelSocial ?? 0
      const bMeses = b.mesesAluguelSocial ?? 0
      if (aMeses !== bMeses) return bMeses - aMeses

      // Secondary: has elderly (true first)
      const aIdoso = a.possuiIdosoFamilia ?? false
      const bIdoso = b.possuiIdosoFamilia ?? false
      if (aIdoso !== bIdoso) return bIdoso ? 1 : -1

      // Tertiary: female head of household (true first)
      const aChefia = a.chefiaFeminina ?? false
      const bChefia = b.chefiaFeminina ?? false
      if (aChefia !== bChefia) return bChefia ? 1 : -1

      // Final tiebreaker: earlier creation date first
      return a.criadoEm - b.criadoEm
    })
  }
})

export const getAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'admin'))
      .collect()
  }
})

export const getOfertantes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ofertante'))
      .collect()
  }
})

export const getConstrutores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'construtor'))
      .collect()
  }
})

// ============ MUTATIONS ============

export const requestOTP = mutation({
  args: {
    cpf: v.string(),
    telefone: v.string()
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    telefoneMascarado?: string
    codigo?: string
    error?: string
  }> => {
    const cleanedCPF = cleanCPF(args.cpf)
    const cleanedTelefone = args.telefone.replace(/\D/g, '')

    if (!isValidCPFLength(cleanedCPF)) {
      return { success: false, error: 'CPF deve ter 11 dígitos' }
    }

    if (cleanedTelefone.length !== 11) {
      return { success: false, error: 'Telefone deve ter 11 dígitos' }
    }

    // Check if user exists in pre-approved list
    const user = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedCPF))
      .first()

    if (!user) {
      return {
        success: false,
        error: 'CPF não encontrado na lista de beneficiários pré-aprovados'
      }
    }

    if (user.role !== 'beneficiary') {
      return {
        success: false,
        error: 'Este CPF não está cadastrado como beneficiário'
      }
    }

    // Validate that the cellphone matches the registered number
    if (user.telefone !== cleanedTelefone) {
      return {
        success: false,
        error:
          'O telefone informado não corresponde ao cadastrado. Entre em contato com a SECID para atualizar seus dados.'
      }
    }

    // Generate OTP
    const codigo = generateOTP()
    const expiraEm = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Invalidate previous OTPs for this CPF
    const previousOTPs = await ctx.db
      .query('otpTokens')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedCPF))
      .collect()

    for (const otp of previousOTPs) {
      if (!otp.usado) {
        await ctx.db.patch(otp._id, { usado: true })
      }
    }

    // Create new OTP
    await ctx.db.insert('otpTokens', {
      cpf: cleanedCPF,
      codigo,
      telefone: user.telefone,
      expiraEm,
      usado: false,
      criadoEm: Date.now()
    })

    // Mask phone for display (e.g., "98*****1234")
    const telefoneMascarado = user.telefone.replace(
      /(\d{2})(\d{5})(\d{4})/,
      '$1*****$3'
    )

    // Always log for development
    console.log(`[DEV] OTP para ${cleanedCPF}: ${codigo}`)

    return { success: true, telefoneMascarado, codigo }
  }
})

export const verifyOTP = mutation({
  args: {
    cpf: v.string(),
    codigo: v.string()
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    userId?: Id<'users'>
    userData?: any
    error?: string
  }> => {
    const cleaned = cleanCPF(args.cpf)
    const codigoClean = args.codigo.trim()

    // Find valid OTP
    const otpRecord = await ctx.db
      .query('otpTokens')
      .withIndex('by_codigo', (q) => q.eq('codigo', codigoClean))
      .first()

    if (!otpRecord) {
      return { success: false, error: 'Código inválido' }
    }

    if (otpRecord.usado) {
      return { success: false, error: 'Código já utilizado' }
    }

    if (otpRecord.cpf !== cleaned) {
      return {
        success: false,
        error: 'Código não corresponde ao CPF informado'
      }
    }

    if (otpRecord.expiraEm < Date.now()) {
      return { success: false, error: 'Código expirado' }
    }

    // Mark OTP as used
    await ctx.db.patch(otpRecord._id, { usado: true })

    // Get user and update status to verified if pending
    const user = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
      .first()

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (user.status === 'pending') {
      await ctx.db.patch(user._id, {
        status: 'verified',
        atualizadoEm: Date.now()
      })
    }

    // Prepare user data for validation screen
    const userData = {
      cpf: user.cpf,
      nome: user.nome,
      telefone: user.telefone,
      endereco: user.endereco || '',
      numero: user.numero || '',
      bairro: user.bairro || '',
      cidade: user.cidade || '',
      estado: user.estado || '',
      status: user.status === 'pending' ? 'verified' : user.status,
      dadosValidados: user.dadosValidados,
      dadosComErro: user.dadosComErro,
      mensagemErroDados: user.mensagemErroDados
    }

    return { success: true, userId: user._id, userData }
  }
})

export const acceptTerms = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem aceitar termos')
    }

    if (user.termoAceitoEm) {
      throw new Error('Termos já aceitos anteriormente')
    }

    await ctx.db.patch(args.userId, {
      termoAceitoEm: Date.now(),
      status: 'active',
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const confirmData = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem validar dados')
    }

    await ctx.db.patch(args.userId, {
      dadosValidados: true,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const reportDataError = mutation({
  args: {
    userId: v.id('users'),
    mensagem: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem reportar erros')
    }

    await ctx.db.patch(args.userId, {
      dadosComErro: true,
      mensagemErroDados: args.mensagem,
      erroReportadoEm: Date.now(),
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const getBeneficiariesWithErrors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'beneficiary').eq('status', 'active')
      )
      .filter((q) => q.eq(q.field('dadosComErro'), true))
      .collect()
  }
})

export const resolveDataError = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    await ctx.db.patch(args.userId, {
      dadosComErro: false,
      dadosValidados: true,
      mensagemErroDados: undefined,
      erroReportadoEm: undefined,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const selectProperty = mutation({
  args: {
    userId: v.id('users'),
    propertyId: v.id('properties')
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary') {
      throw new Error('Usuário inválido')
    }

    if (!user.termoAceitoEm) {
      throw new Error('Beneficiário precisa aceitar os termos primeiro')
    }

    const currentSelections = user.propriedadesInteresse ?? []

    if (currentSelections.length >= 3) {
      throw new Error('Máximo de 3 propriedades pode ser selecionado')
    }

    if (currentSelections.includes(args.propertyId)) {
      throw new Error('Propriedade já selecionada')
    }

    // Verify property is validated
    const property = await ctx.db.get(args.propertyId)
    if (!property || property.status !== 'validated') {
      throw new Error('Propriedade não disponível para seleção')
    }

    const newSelections = [...currentSelections, args.propertyId]

    await ctx.db.patch(args.userId, {
      propriedadesInteresse: newSelections,
      atualizadoEm: Date.now()
    })

    await ctx.db.insert('selectionsHistory', {
      beneficiarioId: args.userId,
      propertyId: args.propertyId,
      ordemPreferencia: newSelections.length,
      selecionadoEm: Date.now()
    })

    return { success: true, selections: newSelections }
  }
})

export const removePropertySelection = mutation({
  args: {
    userId: v.id('users'),
    propertyId: v.id('properties')
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const currentSelections = user.propriedadesInteresse ?? []
    const newSelections = currentSelections.filter(
      (id) => id !== args.propertyId
    )

    await ctx.db.patch(args.userId, {
      propriedadesInteresse: newSelections,
      atualizadoEm: Date.now()
    })

    const historyEntry = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_beneficiario', (q) => q.eq('beneficiarioId', args.userId))
      .filter(
        (q) =>
          q.eq(q.field('propertyId'), args.propertyId) &&
          q.eq(q.field('removidoEm'), undefined)
      )
      .first()

    if (historyEntry) {
      await ctx.db.patch(historyEntry._id, {
        removidoEm: Date.now()
      })
    }

    return { success: true }
  }
})

export const updateProfile = mutation({
  args: {
    userId: v.id('users'),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Beneficiaries cannot modify nome or cpf
    // Admin can modify any field

    const updates: Partial<Doc<'users'>> = {
      atualizadoEm: Date.now()
    }

    if (args.email !== undefined) updates.email = args.email
    if (args.telefone !== undefined) updates.telefone = args.telefone
    if (args.cep !== undefined) updates.cep = args.cep
    if (args.endereco !== undefined) updates.endereco = args.endereco
    if (args.numero !== undefined) updates.numero = args.numero
    if (args.complemento !== undefined) updates.complemento = args.complemento
    if (args.bairro !== undefined) updates.bairro = args.bairro
    if (args.cidade !== undefined) updates.cidade = args.cidade
    if (args.estado !== undefined) updates.estado = args.estado

    await ctx.db.patch(args.userId, updates)

    return { success: true }
  }
})

// ============ ADMIN MUTATIONS ============

export const createAdmin = mutation({
  args: {
    cpf: v.string(),
    nome: v.string(),
    email: v.string(),
    telefone: v.string(),
    senha: v.string()
  },
  handler: async (ctx, args) => {
    const cleaned = cleanCPF(args.cpf)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
      .first()

    if (existing) {
      throw new Error('CPF já cadastrado')
    }

    // TODO: Hash password properly
    const senhaHash = args.senha // Should be hashed

    const now = Date.now()

    return await ctx.db.insert('users', {
      role: 'admin',
      cpf: cleaned,
      nome: args.nome,
      email: args.email,
      telefone: args.telefone,
      senhaHash,
      status: 'active',
      criadoEm: now,
      atualizadoEm: now
    })
  }
})

export const bulkUploadBeneficiaries = mutation({
  args: {
    adminId: v.id('users'),
    beneficiaries: v.array(
      v.object({
        cpf: v.string(),
        nome: v.string(),
        telefone: v.string(),
        mesesAluguelSocial: v.number(),
        possuiIdosoFamilia: v.boolean(),
        chefiaFeminina: v.boolean(),
        pessoasFamilia: v.optional(v.number()),
        sexo: v.optional(v.string()),
        raca: v.optional(v.string()),
        deficiencias: v.optional(v.array(v.string()))
      })
    )
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    total: number
    sucessos: number
    erros: Array<{ linha: number; erro: string }>
  }> => {
    // Verify admin
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new Error('Apenas administradores podem fazer upload em massa')
    }

    const erros: Array<{ linha: number; erro: string }> = []
    let sucessos = 0
    const now = Date.now()

    for (let i = 0; i < args.beneficiaries.length; i++) {
      const b = args.beneficiaries[i]
      const linha = i + 1

      try {
        const cleaned = cleanCPF(b.cpf)

        if (!isValidCPFLength(cleaned)) {
          erros.push({ linha, erro: 'CPF inválido' })
          continue
        }

        const existing = await ctx.db
          .query('users')
          .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
          .first()

        if (existing) {
          erros.push({ linha, erro: 'CPF já cadastrado' })
          continue
        }

        await ctx.db.insert('users', {
          role: 'beneficiary',
          cpf: cleaned,
          nome: b.nome,
          telefone: b.telefone,
          mesesAluguelSocial: b.mesesAluguelSocial,
          possuiIdosoFamilia: b.possuiIdosoFamilia,
          chefiaFeminina: b.chefiaFeminina,
          pessoasFamilia: b.pessoasFamilia,
          sexo: b.sexo as any,
          raca: b.raca as any,
          deficiencias: b.deficiencias as any,
          status: 'pending',
          criadoEm: now,
          atualizadoEm: now
        })

        sucessos++
      } catch (e) {
        erros.push({ linha, erro: String(e) })
      }
    }

    await ctx.db.insert('bulkUploadLogs', {
      adminId: args.adminId,
      tipo: 'beneficiarios',
      totalLinhas: args.beneficiaries.length,
      sucessos,
      erros: erros.length,
      detalhesErros: erros.length > 0 ? erros : undefined,
      criadoEm: now
    })

    return {
      success: true,
      total: args.beneficiaries.length,
      sucessos,
      erros
    }
  }
})

export const updateUserStatus = mutation({
  args: {
    userId: v.id('users'),
    status: v.union(
      v.literal('pending'),
      v.literal('verified'),
      v.literal('active'),
      v.literal('rejected'),
      v.literal('suspended')
    )
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: args.status,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const deleteOTP = internalMutation({
  args: { id: v.id('otpTokens') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  }
})

// Cleanup expired OTPs (can be called periodically)
export const cleanupExpiredOTPs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const expired = await ctx.db
      .query('otpTokens')
      .filter((q) => q.lt(q.field('expiraEm'), now))
      .collect()

    for (const otp of expired) {
      await ctx.db.delete(otp._id)
    }

    return { deleted: expired.length }
  }
})

// ============ PHONE LOGIN MUTATIONS ============

// Request OTP by phone for Ofertantes and Admins
export const requestOTPByPhone = mutation({
  args: {
    telefone: v.string(),
    tipo: v.union(v.literal('ofertante'), v.literal('admin'))
  },
  handler: async (ctx, args): Promise<{
    success: boolean
    telefoneMascarado?: string
    codigo?: string
    isNewUser?: boolean
    error?: string
  }> => {
    const cleanedTelefone = args.telefone.replace(/\D/g, '')

    if (cleanedTelefone.length !== 11) {
      return { success: false, error: 'Telefone deve ter 11 dígitos' }
    }

    // Check if user exists by phone
    const existingUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('telefone'), cleanedTelefone))
      .first()

    if (args.tipo === 'admin') {
      // Admin must exist and have admin role
      if (!existingUser) {
        return { success: false, error: 'Número de telefone não encontrado' }
      }
      if (existingUser.role !== 'admin') {
        return { success: false, error: 'Este número não está cadastrado como administrador' }
      }
    } else if (args.tipo === 'ofertante') {
      // Ofertante can be new or existing
      if (existingUser && existingUser.role !== 'ofertante') {
        return { success: false, error: 'Este telefone já está cadastrado para outro tipo de usuário' }
      }
    }

    // Generate OTP
    const codigo = generateOTP()
    const expiraEm = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Invalidate previous OTPs for this phone
    const previousOTPs = await ctx.db
      .query('otpTokens')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedTelefone))
      .collect()

    for (const otp of previousOTPs) {
      if (!otp.usado) {
        await ctx.db.patch(otp._id, { usado: true })
      }
    }

    // Create new OTP (using phone as CPF key for simplicity)
    await ctx.db.insert('otpTokens', {
      cpf: cleanedTelefone,
      codigo,
      telefone: cleanedTelefone,
      expiraEm,
      usado: false,
      criadoEm: Date.now()
    })

    // Mask phone for display
    const telefoneMascarado = cleanedTelefone.replace(
      /(\d{2})(\d{5})(\d{4})/,
      '$1*****$3'
    )

    // Log for development
    console.log(`[DEV] OTP para ${cleanedTelefone}: ${codigo}`)

    return {
      success: true,
      telefoneMascarado,
      codigo,
      isNewUser: !existingUser
    }
  }
})

// Register new ofertante
export const registerOfertante = mutation({
  args: {
    telefone: v.string(),
    nome: v.string()
  },
  handler: async (ctx, args): Promise<{
    success: boolean
    userId?: Id<'users'>
    error?: string
  }> => {
    const cleanedTelefone = args.telefone.replace(/\D/g, '')

    // Check phone uniqueness
    const existingUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('telefone'), cleanedTelefone))
      .first()

    if (existingUser) {
      return { success: false, error: 'Este telefone já está cadastrado' }
    }

    const now = Date.now()

    const userId = await ctx.db.insert('users', {
      role: 'ofertante',
      cpf: '', // Will be filled during onboarding
      nome: args.nome,
      telefone: cleanedTelefone,
      status: 'onboarding',
      onboardingCompleto: false,
      documentosPendentes: ['rg', 'comp_residencia'],
      criadoEm: now,
      atualizadoEm: now
    })

    return { success: true, userId }
  }
})

// Verify OTP for phone login (works for ofertantes and admins)
export const verifyOTPByPhone = mutation({
  args: {
    telefone: v.string(),
    codigo: v.string()
  },
  handler: async (ctx, args): Promise<{
    success: boolean
    userId?: Id<'users'>
    userData?: any
    isNewUser?: boolean
    needsOnboarding?: boolean
    error?: string
  }> => {
    const cleanedTelefone = args.telefone.replace(/\D/g, '')
    const codigoClean = args.codigo.trim()

    // Find valid OTP
    const otpRecord = await ctx.db
      .query('otpTokens')
      .withIndex('by_codigo', (q) => q.eq('codigo', codigoClean))
      .first()

    if (!otpRecord) {
      return { success: false, error: 'Código inválido' }
    }

    if (otpRecord.usado) {
      return { success: false, error: 'Código já utilizado' }
    }

    if (otpRecord.telefone !== cleanedTelefone) {
      return { success: false, error: 'Código não corresponde ao telefone informado' }
    }

    if (otpRecord.expiraEm < Date.now()) {
      return { success: false, error: 'Código expirado' }
    }

    // Mark OTP as used
    await ctx.db.patch(otpRecord._id, { usado: true })

    // Find user by phone
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('telefone'), cleanedTelefone))
      .first()

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Update status if pending
    if (user.status === 'pending') {
      await ctx.db.patch(user._id, {
        status: 'verified',
        atualizadoEm: Date.now()
      })
    }

    const needsOnboarding = user.role === 'ofertante' && !user.onboardingCompleto

    return {
      success: true,
      userId: user._id,
      userData: {
        _id: user._id,
        cpf: user.cpf,
        nome: user.nome,
        telefone: user.telefone,
        role: user.role,
        status: user.status,
        endereco: user.endereco,
        numero: user.numero,
        bairro: user.bairro,
        cidade: user.cidade,
        estado: user.estado,
        dataNascimento: user.dataNascimento,
        onboardingCompleto: user.onboardingCompleto
      },
      isNewUser: !user.cpf, // New if CPF not set
      needsOnboarding
    }
  }
})

// Complete ofertante onboarding
export const completeOfertanteOnboarding = mutation({
  args: {
    userId: v.id('users'),
    nome: v.optional(v.string()),
    cpf: v.string(),
    dataNascimento: v.string(),
    cep: v.string(),
    endereco: v.string(),
    numero: v.string(),
    complemento: v.optional(v.string()),
    bairro: v.string(),
    cidade: v.string(),
    estado: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (user.role !== 'ofertante') {
      return { success: false, error: 'Apenas ofertantes podem completar onboarding' }
    }

    // Validate CPF
    const cleanedCPF = cleanCPF(args.cpf)
    if (!isValidCPFLength(cleanedCPF)) {
      return { success: false, error: 'CPF inválido' }
    }

    // Check if CPF is already in use by another user
    const existingUserWithCPF = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedCPF))
      .first()

    if (existingUserWithCPF && existingUserWithCPF._id !== args.userId) {
      return { success: false, error: 'CPF já cadastrado por outro usuário' }
    }

    await ctx.db.patch(args.userId, {
      nome: args.nome || user.nome,
      cpf: cleanedCPF,
      dataNascimento: args.dataNascimento,
      cep: args.cep,
      endereco: args.endereco,
      numero: args.numero,
      complemento: args.complemento,
      bairro: args.bairro,
      cidade: args.cidade,
      estado: args.estado,
      onboardingCompleto: true,
      status: 'active',
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

// Get ofertantes with pending onboarding
export const getOfertantesPendentes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'ofertante').eq('status', 'onboarding')
      )
      .collect()
  }
})
