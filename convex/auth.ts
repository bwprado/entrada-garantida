import {
  convexAuth,
  type GenericActionCtxWithAuthConfig,
  type PhoneConfig,
} from "@convex-dev/auth/server";
import type { AnyDataModel } from "convex/server";
import { ConvexError } from "convex/values";
import type { GenericId } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizePhone } from "../lib/normalize-phone";

const PHONE_OTP_MAX_AGE_SEC = 60 * 5;

async function findAppUserByTelefone(ctx: MutationCtx, e164: string) {
  const variants = Array.from(
    new Set([
      e164,
      e164.replace(/^\+/, ""),
      e164.replace(/^\+55/, ""),
    ]),
  );
  for (const v of variants) {
    const byTelefone = await ctx.db
      .query("users")
      .withIndex("by_telefone", (q) => q.eq("telefone", v))
      .first();
    if (byTelefone) return byTelefone;
  }
  return await ctx.db
    .query("users")
    .withIndex("phone", (q) => q.eq("phone", e164))
    .first();
}

function phoneOtpMessage(code: string): string {
  return `Código de verificação Aquisição Assistida: ${code}. Válido por 5 minutos. Não compartilhe este código.`;
}

function makePhoneProvider(
  id: "phone_admin" | "phone_ofertante" | "phone_beneficiary",
): PhoneConfig {
  return {
    id,
    type: "phone",
    maxAge: PHONE_OTP_MAX_AGE_SEC,
    generateVerificationToken: async () =>
      Math.floor(100000 + Math.random() * 900000).toString(),
    normalizeIdentifier: (identifier: string) => {
      const n = normalizePhone(identifier);
      if (!n.isValid()) {
        throw new ConvexError("Telefone inválido");
      }
      return n.sms();
    },
    authorize: async (params, account) => {
      if (typeof params.phone !== "string") {
        throw new Error("Informe o telefone em signIn.");
      }
      if (account.providerAccountId !== params.phone) {
        throw new Error(
          "O telefone deve ser o mesmo da solicitação do código.",
        );
      }
    },
    sendVerificationRequest: async (
      params,
      ctx: GenericActionCtxWithAuthConfig<AnyDataModel>,
    ) => {
      const message = phoneOtpMessage(params.token);
      await ctx.runAction(internal.twilio.sendVerificationSms, {
        to: params.identifier,
        body: message,
      });
    },
    options: {},
  };
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    makePhoneProvider("phone_admin"),
    makePhoneProvider("phone_ofertante"),
    makePhoneProvider("phone_beneficiary"),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { type, provider, profile, existingUserId } = args;

      if (type === "phone" && typeof profile.phone === "string") {
        const e164 = profile.phone;
        const appUser = await findAppUserByTelefone(ctx, e164);
        if (provider.id === "phone_admin") {
          if (!appUser) {
            throw new ConvexError("Número de telefone não encontrado");
          }
          if (appUser.role !== "admin") {
            throw new ConvexError(
              "Este número não está cadastrado como administrador",
            );
          }
        } else if (provider.id === "phone_ofertante") {
          if (!appUser) {
            throw new ConvexError(
              "Cadastre-se antes: informe seu nome na etapa de cadastro.",
            );
          }
          if (appUser.role !== "ofertante") {
            throw new ConvexError(
              "Este telefone já está cadastrado para outro tipo de usuário",
            );
          }
        } else if (provider.id === "phone_beneficiary") {
          if (!appUser) {
            throw new ConvexError(
              "Número não encontrado na base de beneficiários.",
            );
          }
          if (appUser.role !== "beneficiary") {
            throw new ConvexError(
              "Este telefone não está cadastrado como beneficiário",
            );
          }
        }
        if (!appUser) {
          throw new ConvexError("Usuário não encontrado");
        }
        await ctx.db.patch(appUser._id, {
          phone: e164,
          atualizadoEm: Date.now(),
        });
        return appUser._id as GenericId<"users">;
      }

      if (
        type === "verification" &&
        profile.phoneVerified === true &&
        typeof profile.phone === "string"
      ) {
        const uid = existingUserId;
        if (uid === null) {
          throw new Error("Falha na verificação: usuário não encontrado");
        }
        await ctx.db.patch(uid, {
          phone: profile.phone,
          phoneVerificationTime: Date.now(),
        });
        return uid;
      }

      throw new Error(`Fluxo de auth não suportado: ${type}`);
    },
    async beforeSessionCreation(ctx, { userId }) {
      const db = (ctx as MutationCtx).db;
      const accounts = await db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
        .collect();
      const phoneAcc = accounts.find(
        (a) =>
          a.provider === "phone_admin" ||
          a.provider === "phone_ofertante" ||
          a.provider === "phone_beneficiary",
      );
      if (!phoneAcc) return;
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new ConvexError("Usuário não encontrado");
      }
      if (phoneAcc.provider === "phone_admin" && user.role !== "admin") {
        throw new ConvexError(
          "Este número não está cadastrado como administrador",
        );
      }
      if (phoneAcc.provider === "phone_ofertante" && user.role !== "ofertante") {
        throw new ConvexError(
          "Este telefone não está cadastrado como ofertante",
        );
      }
      if (
        phoneAcc.provider === "phone_beneficiary" &&
        user.role !== "beneficiary"
      ) {
        throw new ConvexError(
          "Este telefone não está cadastrado como beneficiário",
        );
      }
    },
  },
});
