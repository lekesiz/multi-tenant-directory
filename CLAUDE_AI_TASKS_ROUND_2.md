# Claude AI - Yeni Görevler (Round 2)

**Tarih:** 15 Ekim 2025, 19:30 GMT+2  
**Sprint:** 3 (Gün 1/14)  
**Assigned:** Claude AI  
**Priority:** HIGH

---

## 🎉 Önceki Görevler Tamamlandı!

Harika iş! Migration ve backend görevleri başarıyla tamamlandı:
- ✅ Prisma Migration
- ✅ Database Schema
- ✅ Authentication System
- ✅ Photo Upload
- ✅ Business Hours
- ✅ Analytics
- ✅ Review Management

---

## 📋 Yeni Görevler

### 🎯 GÖREV 1: Yasal Sayfalar (Legal Pages)

**Priority:** 🔴 CRITICAL  
**Estimate:** 3-4 saat  
**Deadline:** 16 Ekim, 18:00

#### Görev Detayı

Fransız yasalarına uygun yasal sayfalar oluştur:
1. **Mentions Légales** (Legal Notice)
2. **Politique de Confidentialité** (Privacy Policy)
3. **Conditions Générales d'Utilisation** (Terms of Service)

---

#### 1. Mentions Légales

**Dosya:** `src/app/mentions-legales/page.tsx`

**İçerik Gereksinimleri:**

```typescript
export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Mentions Légales
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          {/* 1. Éditeur du site */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Éditeur du site
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Raison sociale :</strong> [À COMPLÉTER]</p>
              <p><strong>Forme juridique :</strong> [SARL/SAS/Auto-entrepreneur]</p>
              <p><strong>Capital social :</strong> [Montant] €</p>
              <p><strong>Siège social :</strong> [Adresse complète]</p>
              <p><strong>SIRET :</strong> [Numéro SIRET]</p>
              <p><strong>RCS :</strong> [Ville + Numéro]</p>
              <p><strong>Directeur de publication :</strong> [Nom Prénom]</p>
              <p><strong>Email :</strong> contact@domain.pro</p>
              <p><strong>Téléphone :</strong> [Numéro]</p>
            </div>
          </section>

          {/* 2. Hébergeur */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Hébergeur du site
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Nom :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-600 hover:underline">https://vercel.com</a></p>
            </div>
          </section>

          {/* 3. Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Propriété intellectuelle
            </h2>
            <p className="text-gray-700">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-gray-700 mt-4">
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite 
              sauf autorisation expresse du directeur de la publication.
            </p>
          </section>

          {/* 4. Protection des données personnelles */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Protection des données personnelles
            </h2>
            <p className="text-gray-700">
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), 
              vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-gray-700 mt-4">
              Pour exercer ces droits, veuillez nous contacter à l'adresse : <a href="mailto:contact@domain.pro" className="text-blue-600 hover:underline">contact@domain.pro</a>
            </p>
            <p className="text-gray-700 mt-4">
              Pour plus d'informations, consultez notre <Link href="/politique-de-confidentialite" className="text-blue-600 hover:underline">Politique de Confidentialité</Link>.
            </p>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cookies
            </h2>
            <p className="text-gray-700">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
              En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies.
            </p>
            <p className="text-gray-700 mt-4">
              Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          {/* 6. Crédits */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Crédits
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Conception et développement :</strong> [Nom de l'agence/développeur]</p>
              <p><strong>Technologies utilisées :</strong> Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL</p>
            </div>
          </section>

          {/* 7. Loi applicable */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Loi applicable
            </h2>
            <p className="text-gray-700">
              Les présentes mentions légales sont régies par la loi française. 
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dernière mise à jour : 15 octobre 2025</p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Mentions Légales',
  description: 'Informations légales et mentions obligatoires du site',
};
```

---

#### 2. Politique de Confidentialité

**Dosya:** `src/app/politique-de-confidentialite/page.tsx`

**Sections:**

1. **Introduction**
   - Engagement RGPD
   - Responsable du traitement

2. **Données collectées**
   - Données d'inscription (nom, email, téléphone)
   - Données de navigation (cookies, analytics)
   - Données d'utilisation (avis, photos, messages)

3. **Finalités du traitement**
   - Gestion des comptes utilisateurs
   - Publication d'avis et contenus
   - Amélioration du service
   - Communication marketing (opt-in)

4. **Base légale**
   - Consentement
   - Exécution du contrat
   - Intérêt légitime

5. **Destinataires des données**
   - Personnel autorisé
   - Prestataires techniques (Vercel, Neon)
   - Pas de vente à des tiers

6. **Durée de conservation**
   - Comptes actifs : durée d'utilisation
   - Comptes inactifs : 3 ans
   - Données marketing : jusqu'au retrait du consentement

7. **Droits des utilisateurs**
   - Droit d'accès
   - Droit de rectification
   - Droit à l'effacement
   - Droit d'opposition
   - Droit à la portabilité
   - Droit de limitation

8. **Sécurité**
   - Mesures techniques (HTTPS, encryption)
   - Mesures organisationnelles
   - Notification en cas de violation

9. **Cookies**
   - Types de cookies utilisés
   - Finalités
   - Gestion des cookies

10. **Contact**
    - Email DPO
    - Formulaire de contact
    - Réclamation CNIL

---

#### 3. Conditions Générales d'Utilisation

**Dosya:** `src/app/cgu/page.tsx`

**Sections:**

1. **Objet**
   - Description du service
   - Acceptation des CGU

2. **Accès au service**
   - Conditions d'accès
   - Inscription
   - Compte utilisateur

3. **Services proposés**
   - Annuaire d'entreprises
   - Publication d'avis
   - Espace professionnel

4. **Obligations de l'utilisateur**
   - Informations exactes
   - Contenu approprié
   - Respect des lois

5. **Contenu utilisateur**
   - Propriété du contenu
   - Licence accordée au site
   - Modération

6. **Propriété intellectuelle**
   - Droits sur le site
   - Marques et logos
   - Utilisation autorisée

7. **Responsabilité**
   - Limitation de responsabilité
   - Disponibilité du service
   - Contenu tiers

8. **Données personnelles**
   - Renvoi vers Politique de Confidentialité
   - Engagement RGPD

9. **Modification des CGU**
   - Droit de modification
   - Notification

10. **Résiliation**
    - Résiliation par l'utilisateur
    - Résiliation par le site
    - Conséquences

11. **Loi applicable et juridiction**
    - Droit français
    - Tribunaux compétents

---

### 📝 Implementation Checklist

#### Step 1: Create Pages

```bash
# Create legal pages directory structure
mkdir -p src/app/mentions-legales
mkdir -p src/app/politique-de-confidentialite
mkdir -p src/app/cgu
```

#### Step 2: Create Components

```typescript
// src/components/LegalPageLayout.tsx
export function LegalPageLayout({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {title}
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {children}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}
```

#### Step 3: Update Footer

```typescript
// src/components/Footer.tsx
<div className="mt-8 pt-8 border-t border-gray-200">
  <div className="flex flex-wrap justify-center gap-6 text-sm">
    <Link href="/mentions-legales" className="text-gray-600 hover:text-gray-900">
      Mentions Légales
    </Link>
    <Link href="/politique-de-confidentialite" className="text-gray-600 hover:text-gray-900">
      Politique de Confidentialité
    </Link>
    <Link href="/cgu" className="text-gray-600 hover:text-gray-900">
      CGU
    </Link>
    <Link href="/contact" className="text-gray-600 hover:text-gray-900">
      Contact
    </Link>
  </div>
</div>
```

---

### 🎯 GÖREV 2: Email Service Integration (Resend)

**Priority:** 🟡 HIGH  
**Estimate:** 2-3 saat  
**Deadline:** 17 Ekim, 12:00

#### Setup Resend

```bash
npm install resend
```

#### Environment Variables

```env
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@domain.pro
```

#### Email Service

**Dosya:** `src/lib/email.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({
  to,
  from,
  replyTo,
  subject,
  html,
}: {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
}) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      replyTo,
      subject,
      html,
    });

    console.log('✅ Email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2>Vérification de votre email</h2>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <p>Bonjour,</p>
          <p>Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Vérifier mon email
            </a>
          </div>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            Ce lien expire dans 24 heures.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendContactEmail({
    to,
    from: process.env.RESEND_FROM_EMAIL!,
    replyTo: process.env.RESEND_FROM_EMAIL!,
    subject: 'Vérifiez votre email',
    html,
  });
}
```

#### Update Contact API

**Dosya:** `src/app/api/contact/route.ts`

```typescript
import { sendContactEmail } from '@/lib/email';

// Inside POST handler, after validation:
if (companyEmail && process.env.RESEND_API_KEY) {
  await sendContactEmail({
    to: companyEmail,
    from: process.env.RESEND_FROM_EMAIL!,
    replyTo: email,
    subject: `Nouveau contact: ${subject}`,
    html: generateEmailTemplate({
      name,
      email,
      phone,
      subject,
      message,
      companyName,
    }),
  });
}
```

---

### 🧪 Testing Checklist

#### Legal Pages
- [ ] Mentions Légales page renders
- [ ] Politique de Confidentialité page renders
- [ ] CGU page renders
- [ ] Footer links work
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] SEO metadata correct

#### Email Service
- [ ] Resend API key configured
- [ ] Contact email sends successfully
- [ ] Verification email sends successfully
- [ ] Email templates render correctly
- [ ] Error handling works
- [ ] Logs show email status

---

### 📝 Git Commit

```bash
git add src/app/mentions-legales/
git add src/app/politique-de-confidentialite/
git add src/app/cgu/
git add src/lib/email.ts
git add src/components/LegalPageLayout.tsx

git commit -m "feat: yasal sayfalar ve email service ✅

Legal Pages:
- Mentions Légales (RGPD compliant)
- Politique de Confidentialité (detailed)
- CGU (comprehensive)
- Footer links updated
- Responsive design

Email Service:
- Resend integration
- Contact email notifications
- Verification email templates
- Error handling
- Logging

Status: ✅ COMPLETE
GDPR: ✅ Compliant"

git push
```

---

## 🎯 Success Criteria

### Legal Pages
- [x] All 3 pages created
- [x] RGPD compliant content
- [x] Footer links added
- [x] Responsive design
- [x] SEO metadata
- [x] Last updated date

### Email Service
- [x] Resend integrated
- [x] Contact emails work
- [x] Verification emails work
- [x] Error handling
- [x] Logging
- [x] Environment variables

---

## 📚 Resources

- [RGPD Guide](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
- [Resend Documentation](https://resend.com/docs)
- [Legal Page Examples](https://www.legifrance.gouv.fr/)

---

**Bonne chance! Tu peux le faire! 🚀**

**Deadline:** 17 Ekim, 12:00  
**Priority:** 🔴 CRITICAL (Legal pages) + 🟡 HIGH (Email)

---

**Hazırlayan:** Manus AI  
**Sprint:** 3 (Gün 1/14)

