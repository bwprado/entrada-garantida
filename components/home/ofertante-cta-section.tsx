"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Building2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

const springReveal = {
  type: "spring" as const,
  stiffness: 100,
  damping: 22
}

const leftList = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 }
  }
}

const leftItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springReveal
  }
}

export function OfertanteCtaSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
      >
        <motion.div
          className="absolute -left-28 top-1/2 h-[min(92vw,480px)] w-[min(92vw,480px)] -translate-y-1/2 rounded-full bg-white blur-3xl will-change-transform"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            className="lg:col-span-7 lg:pr-4"
            variants={leftList}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-48px" }}
          >
            <motion.p
              variants={leftItem}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70 md:text-sm"
            >
              Para proprietários
            </motion.p>
            <motion.h2
              variants={leftItem}
              className="text-3xl font-bold tracking-tighter leading-[1.08] md:text-4xl lg:text-[2.75rem]"
            >
              Tem um imóvel para vender?
            </motion.h2>
            <motion.p
              variants={leftItem}
              className="mt-5 max-w-[60ch] text-base leading-relaxed text-primary-foreground/88 md:text-lg"
            >
              Cadastre a oferta com a SECID. Você integra a base credenciada e
              participa da aquisição assistida às famílias desalojadas pelo PAC
              Rio Anil.
            </motion.p>
            <motion.div variants={leftItem} className="mt-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 26
                }}
                className="w-fit"
              >
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="text-base font-semibold shadow-[0_12px_28px_-12px_rgba(15,23,42,0.35)] transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/92"
                >
                  <Link
                    href="/ofertante/cadastro"
                    className="group inline-flex items-center gap-2"
                  >
                    <Building2 className="size-5 shrink-0" strokeWidth={2} />
                    Cadastrar imóvel
                    <ArrowRight className="size-4 shrink-0 opacity-90 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={springReveal}
          >
            <motion.div
              className="rounded-2xl border border-white/10 bg-white/6 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md md:p-8 will-change-transform"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <p className="text-sm font-semibold tracking-tight text-primary-foreground/90">
                O que validamos na oferta
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-primary-foreground/85 md:text-[15px]">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <span>
                    Documentação e compatibilidade com o teto do programa
                    (avaliação Caixa e regras da iniciativa).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <span>
                    Alinhamento às necessidades das famílias já cadastradas como
                    beneficiárias.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <span>
                    Oferta transparente: valor final é o menor entre a avaliação
                    da Caixa e o valor anunciado.
                  </span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
