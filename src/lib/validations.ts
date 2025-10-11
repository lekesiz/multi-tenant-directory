import { z } from 'zod';

// Company validation schema
export const companySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z
    .string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  googlePlaceId: z.string().optional(),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères').optional(),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères').optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres').optional(),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide').optional(),
  email: z.string().email('Email invalide').optional(),
  website: z.string().url('URL invalide').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  categories: z.array(z.string()).min(1, 'Au moins une catégorie est requise'),
  logoUrl: z.string().url('URL invalide').optional(),
  coverImageUrl: z.string().url('URL invalide').optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

// Company content validation schema
export const companyContentSchema = z.object({
  companyId: z.number(),
  domainId: z.number(),
  isVisible: z.boolean(),
  customDescription: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
  promotions: z.string().max(500, 'Les promotions ne peuvent pas dépasser 500 caractères').optional(),
  metaTitle: z.string().max(60, 'Le titre ne peut pas dépasser 60 caractères').optional(),
  metaDescription: z.string().max(160, 'La description ne peut pas dépasser 160 caractères').optional(),
});

export type CompanyContentFormData = z.infer<typeof companyContentSchema>;

// Domain validation schema
export const domainSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+\.[a-z]{2,}$/, 'Nom de domaine invalide'),
  isActive: z.boolean(),
  siteTitle: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(60, 'Le titre ne peut pas dépasser 60 caractères').optional(),
  siteDescription: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(160, 'La description ne peut pas dépasser 160 caractères').optional(),
  logoUrl: z.string().url('URL invalide').optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur hexadécimale invalide').optional(),
});

export type DomainFormData = z.infer<typeof domainSchema>;

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Search validation schema
export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type SearchFormData = z.infer<typeof searchSchema>;

