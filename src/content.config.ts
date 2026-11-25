import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const tr = z.object({ nume: z.string().optional(), traseu: z.string().optional(), include: z.string().optional(), nu_include: z.string().optional(), durata: z.string().optional() }).partial().optional();
const tours = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tours' }),
  schema: z.object({
    ordine: z.number().default(999), categorie: z.string(), publicat: z.boolean().default(true),
    nume: z.string(), traseu: z.string(), include: z.string(), nu_include: z.string(),
    pret_privat: z.string().default(''), pret_grup: z.string().default(''),
    grila: z.array(z.object({ persoane: z.string(), pret: z.number() })).default([]), pret_nota: z.string().optional(), durata: z.string().optional(),
    imagine_card: z.string(), alt: z.string().default(''), galerie: z.array(z.string()).default([]),
    credit_foto: z.string().optional(), seo_titlu: z.string().optional(), seo_descriere: z.string().optional(),
    en: tr, ru: tr,
  }),
});
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    titlu: z.string(), seo_titlu: z.string().optional(), descriere: z.string(), data: z.coerce.date(),
    eticheta: z.string().default(''), fir: z.string().default(''), imagine: z.string(), imagine_alt: z.string().default(''),
    intro: z.string().default(''), intrebari: z.array(z.object({ intrebare: z.string(), raspuns: z.string() })).default([]),
    cta_titlu: z.string().default(''), cta_text: z.string().default(''), cta_whatsapp: z.string().default(''),
    cta_tur: z.string().default(''), cta_tur_text: z.string().default(''), credit_foto: z.string().default(''), publicat: z.boolean().default(true),
  }),
});
export const collections = { tours, blog };
