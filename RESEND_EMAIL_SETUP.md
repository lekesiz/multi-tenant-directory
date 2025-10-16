# 📧 RESEND EMAIL SERVICE SETUP GUIDE

**Project:** Multi-Tenant Directory Platform
**Email Provider:** Resend (Recommended)
**Alternative:** SendGrid, Mailgun
**Created:** 16 Octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Pourquoi Resend?](#pourquoi-resend)
2. [Étape 1: Créer un compte Resend](#étape-1-créer-un-compte-resend)
3. [Étape 2: Vérifier le domaine](#étape-2-vérifier-le-domaine)
4. [Étape 3: Configurer DNS](#étape-3-configurer-dns)
5. [Étape 4: Créer l'API Key](#étape-4-créer-lapi-key)
6. [Étape 5: Intégrer dans l'application](#étape-5-intégrer-dans-lapplication)
7. [Étape 6: Tester les emails](#étape-6-tester-les-emails)
8. [Templates d'emails](#templates-demails)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 POURQUOI RESEND?

### Avantages
✅ **API moderne** - Simple et élégante
✅ **React Email** - Templates en React/TSX
✅ **Free tier généreux** - 100 emails/jour gratuits
✅ **Délivrabilité excellente** - >99% inbox placement
✅ **Support Next.js** - Documentation officielle
✅ **Analytics intégré** - Open rate, click tracking
✅ **Webhooks** - Bounce, spam, delivery events

### Comparaison avec alternatives

| Feature | Resend | SendGrid | Mailgun |
|---------|--------|----------|---------|
| Free tier | 100/jour | 100/jour | 100/jour |
| API simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| React templates | ✅ | ❌ | ❌ |
| Pricing (Pro) | $20/mois | $19.95/mois | $35/mois |
| Setup time | 5 min | 15 min | 15 min |

**Recommandation:** Resend pour simplicité et React Email support

---

## 🚀 ÉTAPE 1: CRÉER UN COMPTE RESEND

### 1.1 Inscription

1. Aller sur [https://resend.com](https://resend.com)
2. Cliquer sur **"Start Building"** ou **"Sign Up"**
3. Choisir l'authentification:
   - GitHub (Recommandé - lié au repository)
   - Google
   - Email

### 1.2 Vérification email

1. Vérifier l'email de confirmation
2. Compléter le profil:
   ```
   Full name: Mikail Lekesiz
   Company: Haguenau.PRO (ou nom de votre entreprise)
   Use case: Transactional Emails
   Team size: 1-10
   ```

### 1.3 Plan gratuit

Le **Free tier** inclut:
- ✅ 100 emails/jour (3,000/mois)
- ✅ 1 domaine vérifié
- ✅ Analytics basique
- ✅ Support communautaire

**Quand upgrader?**
- Besoin de >100 emails/jour
- Besoin de support prioritaire
- Besoin de >1 domaine

---

## 🌐 ÉTAPE 2: VÉRIFIER LE DOMAINE

### 2.1 Ajouter un domaine

1. Dashboard Resend > **"Domains"**
2. Cliquer sur **"Add Domain"**
3. Entrer votre domaine:
   ```
   Domain: haguenau.pro
   Region: EU (Frankfurt) - pour conformité GDPR
   ```

### 2.2 Choisir le type de vérification

**Option A: Domaine complet** (Recommandé)
- Emails envoyés depuis: `noreply@haguenau.pro`
- Meilleure délivrabilité
- Plus professionnel

**Option B: Sous-domaine**
- Emails envoyés depuis: `noreply@mail.haguenau.pro`
- Plus facile si vous utilisez déjà le domaine pour autre chose
- Bonne délivrabilité

**Recommandation:** Option A (domaine complet) pour authenticité

### 2.3 Domaines multiples (12 sites)

Vous devrez vérifier chaque domaine:
```
1. haguenau.pro
2. saverne.pro
3. wissembourg.pro
4. selestat.pro
5. molsheim.pro
6. obernai.pro
7. bischwiller.pro
8. schiltigheim.pro
9. illkirch.pro
10. lingolsheim.pro
11. ostwald.pro
12. strasbourg.pro
```

**Note:** Avec le Free tier, vous ne pouvez vérifier qu'1 domaine. Solutions:
- Utiliser un domaine principal (haguenau.pro) pour tous
- Upgrader vers Pro ($20/mois) pour domaines illimités
- Utiliser des sous-domaines du domaine principal

**Recommandation initiale:** Commencer avec `haguenau.pro` uniquement, upgrader plus tard.

---

## 🔧 ÉTAPE 3: CONFIGURER DNS

### 3.1 Récupérer les enregistrements DNS

Après avoir ajouté le domaine, Resend affiche 3 types d'enregistrements:

#### **SPF (Sender Policy Framework)**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### **DKIM (DomainKeys Identified Mail)**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (long string)
TTL: 3600
```

#### **DMARC (Domain-based Message Authentication)**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@haguenau.pro
TTL: 3600
```

### 3.2 Ajouter les enregistrements chez votre registrar

**Si domaine chez OVH:**

1. Aller sur [ovh.com](https://ovh.com)
2. **Web Cloud** > **Noms de domaine** > `haguenau.pro`
3. Onglet **"Zone DNS"**
4. Cliquer sur **"Ajouter une entrée"**

**Ajouter SPF:**
```
Type de champ: TXT
Sous-domaine: (vide ou @)
Valeur: v=spf1 include:_spf.resend.com ~all
```

**Ajouter DKIM:**
```
Type de champ: TXT
Sous-domaine: resend._domainkey
Valeur: (copier depuis Resend)
```

**Ajouter DMARC:**
```
Type de champ: TXT
Sous-domaine: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:dmarc@haguenau.pro
```

**Si domaine chez Cloudflare:**

1. Dashboard Cloudflare > Sélectionner `haguenau.pro`
2. **DNS** > **Records**
3. **Add record**

Répéter pour SPF, DKIM, DMARC avec les mêmes valeurs.

**Si domaine chez Gandi, Namecheap, GoDaddy:**
- Interface similaire
- Chercher "DNS Management" ou "Zone DNS"
- Ajouter les 3 enregistrements TXT

### 3.3 Vérifier la propagation DNS

**Attendre 10-30 minutes** pour la propagation DNS.

Vérifier avec des outils:
```bash
# SPF
dig TXT haguenau.pro +short

# DKIM
dig TXT resend._domainkey.haguenau.pro +short

# DMARC
dig TXT _dmarc.haguenau.pro +short
```

Ou utiliser: [https://mxtoolbox.com](https://mxtoolbox.com)

### 3.4 Vérifier dans Resend

1. Retourner sur Dashboard Resend > **"Domains"**
2. Cliquer sur **"Verify"** à côté de `haguenau.pro`
3. Si tout est OK: ✅ **Verified**
4. Si erreur: Attendre encore 30 min et réessayer

---

## 🔑 ÉTAPE 4: CRÉER L'API KEY

### 4.1 Générer la clé API

1. Dashboard Resend > **"API Keys"**
2. Cliquer sur **"Create API Key"**
3. Configurer:
   ```
   Name: production-multi-tenant-directory
   Permission: Full Access (Send + Domain)
   Domain: haguenau.pro (ou All Domains)
   ```
4. Cliquer sur **"Add"**

### 4.2 Sauvegarder la clé

⚠️ **IMPORTANT:** La clé ne sera affichée qu'une seule fois!

Format:
```
re_AbCdEfGh123456789_XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ
```

**Copier immédiatement dans:**
1. Password manager (1Password, Bitwarden, etc.)
2. Fichier `.env.local` (temporaire)
3. Vercel environment variables (production)

**NE JAMAIS:**
- ❌ Commit dans Git
- ❌ Partager par email/Slack
- ❌ Stocker en clair dans un fichier

### 4.3 Configurer dans Vercel

1. [vercel.com](https://vercel.com) > Votre projet
2. **Settings** > **Environment Variables**
3. Ajouter:
   ```
   Name: RESEND_API_KEY
   Value: re_AbCdEfGh123456789_XyZ...
   Environment: Production (et Preview si staging)
   ```
4. **Save**

### 4.4 Configuration locale

Ajouter dans `.env.local`:
```bash
# Resend Email Service
RESEND_API_KEY="re_AbCdEfGh123456789_XyZ..."

# Email settings
RESEND_FROM_EMAIL="noreply@haguenau.pro"
RESEND_FROM_NAME="Haguenau.PRO"
```

**Note:** `.env.local` est déjà dans `.gitignore`

---

## 💻 ÉTAPE 5: INTÉGRER DANS L'APPLICATION

### 5.1 Installer Resend SDK

```bash
npm install resend
# ou
yarn add resend
```

### 5.2 Créer le client Resend

Créer `src/lib/email.ts`:

```typescript
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'noreply@haguenau.pro',
  fromName: process.env.RESEND_FROM_NAME || 'Haguenau.PRO',
  replyTo: process.env.RESEND_REPLY_TO || 'contact@haguenau.pro',
};
```

### 5.3 Créer les templates d'emails

Installer React Email:
```bash
npm install @react-email/components
```

Créer `src/emails/ContactFormEmail.tsx`:

```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
  Section,
} from '@react-email/components';

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
  companyName?: string;
}

export default function ContactFormEmail({
  name,
  email,
  phone,
  message,
  companyName,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouveau message de contact de {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nouveau message de contact</Heading>

          <Section style={section}>
            <Text style={label}>Nom:</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>
          </Section>

          {phone && (
            <Section style={section}>
              <Text style={label}>Téléphone:</Text>
              <Text style={value}>{phone}</Text>
            </Section>
          )}

          {companyName && (
            <Section style={section}>
              <Text style={label}>Entreprise:</Text>
              <Text style={value}>{companyName}</Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Email reçu via Haguenau.PRO - {new Date().toLocaleDateString('fr-FR')}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
};

const section = {
  padding: '0 40px',
};

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
};

const value = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  marginTop: '0',
};

const messageText = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
};
```

Créer aussi:
- `src/emails/ReviewApprovedEmail.tsx`
- `src/emails/ReviewRejectedEmail.tsx`
- `src/emails/NewReviewNotification.tsx`
- `src/emails/OwnershipVerificationEmail.tsx`

### 5.4 Utiliser dans les API routes

Mettre à jour `src/app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { resend, EMAIL_CONFIG } from '@/lib/email';
import ContactFormEmail from '@/emails/ContactFormEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, companyName } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
      to: EMAIL_CONFIG.replyTo, // Email de destination
      replyTo: email, // Reply to user's email
      subject: `Nouveau message de contact de ${name}`,
      react: ContactFormEmail({ name, email, phone, message, companyName }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

### 5.5 Variables d'environnement complètes

Ajouter dans Vercel Environment Variables:

```bash
# Resend
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@haguenau.pro"
RESEND_FROM_NAME="Haguenau.PRO"
RESEND_REPLY_TO="contact@haguenau.pro"

# Email notifications (pour review moderation, etc.)
ADMIN_NOTIFICATION_EMAIL="admin@haguenau.pro"
BUSINESS_NOTIFICATION_EMAIL="contact@haguenau.pro"
```

---

## 🧪 ÉTAPE 6: TESTER LES EMAILS

### 6.1 Test en local

Créer `scripts/test-email.ts`:

```typescript
import { resend, EMAIL_CONFIG } from '../src/lib/email';
import ContactFormEmail from '../src/emails/ContactFormEmail';

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
      to: 'votre-email@exemple.com', // Votre email de test
      subject: 'Test Email - Haguenau.PRO',
      react: ContactFormEmail({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03 88 00 00 00',
        message: 'Ceci est un email de test.',
        companyName: 'Test Company',
      }),
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data?.id);
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testEmail();
```

Exécuter:
```bash
npx tsx scripts/test-email.ts
```

### 6.2 Vérifier dans Resend Dashboard

1. Dashboard Resend > **"Emails"**
2. Voir l'email de test
3. Statuts possibles:
   - ✅ **Delivered** - Email reçu
   - ⏳ **Sent** - En cours de livraison
   - ❌ **Bounced** - Adresse invalide
   - ⚠️ **Complained** - Marqué comme spam

### 6.3 Test de production

Une fois déployé sur Vercel:
```bash
curl -X POST https://haguenau.pro/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message from production"
  }'
```

Vérifier:
1. Réponse API: `{ success: true, emailId: "..." }`
2. Email reçu dans votre inbox
3. Resend Dashboard montre l'email

---

## 📄 TEMPLATES D'EMAILS

### Templates à créer

Vous aurez besoin de ces templates:

#### 1. Contact Form Confirmation (User)
**Fichier:** `src/emails/ContactFormConfirmation.tsx`
**Envoyé à:** L'utilisateur qui a soumis le formulaire
**Contenu:** Confirmation de réception, temps de réponse estimé

#### 2. Contact Form Notification (Admin)
**Fichier:** `src/emails/ContactFormEmail.tsx` ✅ (Déjà créé ci-dessus)
**Envoyé à:** Admin de la plateforme
**Contenu:** Détails complets du message

#### 3. Review Approved (User)
**Fichier:** `src/emails/ReviewApprovedEmail.tsx`
**Envoyé à:** Auteur de l'avis
**Contenu:** Confirmation de publication de l'avis

```typescript
export default function ReviewApprovedEmail({
  authorName,
  companyName,
  rating,
  comment,
}: {
  authorName: string;
  companyName: string;
  rating: number;
  comment?: string;
}) {
  return (
    <Html>
      {/* ... */}
      <Heading>Votre avis a été publié !</Heading>
      <Text>Bonjour {authorName},</Text>
      <Text>
        Merci pour votre avis sur <strong>{companyName}</strong>.
        Il est maintenant visible sur notre plateforme.
      </Text>
      {/* ... */}
    </Html>
  );
}
```

#### 4. Review Rejected (User)
**Fichier:** `src/emails/ReviewRejectedEmail.tsx`
**Envoyé à:** Auteur de l'avis
**Contenu:** Raison du rejet, possibilité de resoumission

#### 5. New Review Notification (Business Owner)
**Fichier:** `src/emails/NewReviewNotification.tsx`
**Envoyé à:** Propriétaire de l'entreprise
**Contenu:** Nouvel avis reçu, lien pour répondre

#### 6. Ownership Verification (Business Owner)
**Fichier:** `src/emails/OwnershipVerificationEmail.tsx`
**Envoyé à:** Business owner demandant la vérification
**Contenu:** Lien de vérification, instructions

### Preview des emails

Créer `emails/index.tsx` pour prévisualiser:

```bash
npm install react-email --save-dev
```

Ajouter script dans `package.json`:
```json
{
  "scripts": {
    "email:dev": "email dev"
  }
}
```

Lancer:
```bash
npm run email:dev
```

Ouvre http://localhost:3000 avec preview de tous les templates.

---

## 🐛 TROUBLESHOOTING

### Erreur: "Invalid API key"

**Cause:** API key incorrecte ou expirée

**Solutions:**
1. Vérifier la clé dans Vercel env variables
2. Régénérer une nouvelle clé dans Resend
3. S'assurer qu'il n'y a pas d'espaces avant/après la clé

### Erreur: "Domain not verified"

**Cause:** DNS records pas encore propagés

**Solutions:**
1. Attendre 30-60 minutes pour propagation DNS
2. Vérifier les records avec `dig`:
   ```bash
   dig TXT haguenau.pro
   dig TXT resend._domainkey.haguenau.pro
   dig TXT _dmarc.haguenau.pro
   ```
3. Utiliser [https://mxtoolbox.com/SuperTool.aspx](https://mxtoolbox.com/SuperTool.aspx)

### Email dans spam

**Causes:**
1. SPF/DKIM/DMARC mal configurés
2. Domaine trop récent (pas de réputation)
3. Contenu suspicieux

**Solutions:**
1. Vérifier SPF/DKIM/DMARC: [https://www.mail-tester.com](https://www.mail-tester.com)
2. Warm up le domaine (envoyer progressivement):
   - Jour 1-3: 10 emails/jour
   - Jour 4-7: 50 emails/jour
   - Jour 8-14: 100 emails/jour
   - Après: Volume normal
3. Éviter mots spam: "gratuit", "urgent", "cliquez ici", etc.
4. Ajouter lien de désinscription (GDPR)

### Rate limit exceeded

**Cause:** Dépassement de 100 emails/jour (Free tier)

**Solutions:**
1. Upgrader vers Pro ($20/mois = 50,000 emails/mois)
2. Implémenter queue system:
```typescript
// src/lib/email-queue.ts
const queue: Array<() => Promise<void>> = [];
let sending = false;

export async function queueEmail(emailFn: () => Promise<void>) {
  queue.push(emailFn);
  if (!sending) processQueue();
}

async function processQueue() {
  sending = true;
  while (queue.length > 0) {
    const emailFn = queue.shift()!;
    await emailFn();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 email/sec
  }
  sending = false;
}
```

---

## 📊 ANALYTICS ET MONITORING

### Resend Analytics

Dashboard > **"Analytics"** montre:
- ✅ **Delivered:** Emails livrés avec succès
- 📬 **Opened:** Taux d'ouverture
- 🖱️ **Clicked:** Taux de clic
- ⚠️ **Bounced:** Emails rejetés
- 🚫 **Complained:** Marqués comme spam

### Webhooks (Optionnel)

Pour tracker les événements en temps réel:

1. Créer `src/app/api/webhooks/resend/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Log event
    console.log('Resend webhook:', event.type, event.data);

    // Track bounces
    if (event.type === 'email.bounced') {
      // Mark email as invalid in database
      await prisma.businessOwner.updateMany({
        where: { email: event.data.to },
        data: { emailValid: false },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

2. Configurer dans Resend:
   - Dashboard > **"Webhooks"**
   - URL: `https://haguenau.pro/api/webhooks/resend`
   - Events: `email.delivered`, `email.bounced`, `email.complained`

---

## ✅ CHECKLIST FINALE

Avant de passer en production:

- [ ] Compte Resend créé et vérifié
- [ ] Domaine `haguenau.pro` ajouté et vérifié
- [ ] DNS records configurés (SPF, DKIM, DMARC)
- [ ] Vérification DNS confirmée (dig ou mxtoolbox)
- [ ] API Key créée et sauvegardée
- [ ] Variables Vercel configurées (RESEND_API_KEY, etc.)
- [ ] Resend SDK installé (`npm install resend`)
- [ ] Client Resend créé (`src/lib/email.ts`)
- [ ] Templates créés (ContactForm, ReviewApproved, etc.)
- [ ] Test email envoyé et reçu en local
- [ ] Test email envoyé et reçu en production
- [ ] Analytics Resend vérifié (delivered, no bounces)
- [ ] Email de test pas dans spam (mail-tester.com score >8/10)
- [ ] Webhooks configurés (optionnel)
- [ ] Documentation partagée avec l'équipe

---

## 📚 RESSOURCES

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email/docs/components/html)
- [Resend + Next.js Guide](https://resend.com/docs/send-with-nextjs)
- [Email Deliverability Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)
- [SPF/DKIM/DMARC Checker](https://mxtoolbox.com/)
- [Email Spam Tester](https://www.mail-tester.com/)

---

## 💰 PRICING ESTIMATIONS

### Free Tier (0€/mois)
- ✅ 100 emails/jour (3,000/mois)
- ✅ 1 domaine
- ✅ OK pour: MVP, <500 utilisateurs actifs

### Pro ($20/mois)
- ✅ 50,000 emails/mois
- ✅ Domaines illimités (12 sites ✅)
- ✅ Webhooks
- ✅ Support prioritaire
- ✅ OK pour: Production, <10,000 utilisateurs

### Quand upgrader?
```
Scénario 1: <100 emails/jour → Free tier ✅
Scénario 2: 100-500 emails/jour → Pro tier ✅
Scénario 3: >2,000 emails/jour → Enterprise (contact sales)
```

**Estimation pour 12 domaines:**
```
Hypothèse: 20 contacts/jour/domaine
Total: 240 emails/jour = 7,200/mois
Tier requis: Pro ($20/mois) ✅
```

---

**Prochaine étape:** [DOMAIN_DEPLOYMENT_DNS_SETUP.md](./DOMAIN_DEPLOYMENT_DNS_SETUP.md)

**Date de création:** 16 Octobre 2025
**Dernière mise à jour:** 16 Octobre 2025
**Auteur:** Claude AI via NETZ Team
