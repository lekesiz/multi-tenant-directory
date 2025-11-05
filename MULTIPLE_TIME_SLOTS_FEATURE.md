# Fonctionnalité: Plages Horaires Multiples (Pause Déjeuner)

## 🎯 Objectif

Permettre aux entreprises de définir **jusqu'à 2 plages horaires par jour** pour gérer les pauses déjeuner.

**Exemple:**
- **Avant:** 09:00 - 18:00 (une seule plage)
- **Après:** 09:00 - 12:00 et 14:00 - 18:00 (pause déjeuner 12:00-14:00)

---

## ✅ Changements Implémentés

### 1. Structure de Données

**Ancien Format:**
```typescript
interface DaySchedule {
  isOpen: boolean;
  openTime: string;   // "09:00"
  closeTime: string;  // "18:00"
}
```

**Nouveau Format:**
```typescript
interface TimeSlot {
  openTime: string;
  closeTime: string;
}

interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];  // Jusqu'à 2 plages
}
```

### 2. Interface Utilisateur

**Nouvelles Fonctionnalités:**
- ✅ Bouton "+ Ajouter une plage" pour chaque jour
- ✅ Maximum 2 plages horaires par jour
- ✅ Bouton de suppression pour chaque plage (sauf la première)
- ✅ Labels contextuels: "Ouverture" / "Réouverture"
- ✅ Message d'aide expliquant la fonctionnalité
- ✅ Conversion automatique de l'ancien format vers le nouveau

**Fichiers Modifiés:**
- `src/app/business/dashboard/hours/page.tsx` - UI principale
- `src/app/business/dashboard/hours/page_old.tsx` - Backup de l'ancienne version

### 3. Compatibilité Ascendante

**Conversion Automatique:**
```typescript
// Ancien format détecté
if (dayData.openTime && dayData.closeTime) {
  // Converti en nouveau format
  convertedSchedule[day] = {
    isOpen: dayData.isOpen,
    slots: [{ 
      openTime: dayData.openTime, 
      closeTime: dayData.closeTime 
    }],
  };
}
```

### 4. Validation

- ✅ Au moins 1 plage horaire requise si le jour est ouvert
- ✅ Maximum 2 plages horaires par jour
- ✅ Messages d'erreur clairs via toast notifications

---

## 📊 Exemples d'Utilisation

### Cas 1: Journée Continue
```json
{
  "monday": {
    "isOpen": true,
    "slots": [
      { "openTime": "09:00", "closeTime": "18:00" }
    ]
  }
}
```

### Cas 2: Pause Déjeuner
```json
{
  "monday": {
    "isOpen": true,
    "slots": [
      { "openTime": "09:00", "closeTime": "12:00" },
      { "openTime": "14:00", "closeTime": "18:00" }
    ]
  }
}
```

### Cas 3: Jour Fermé
```json
{
  "sunday": {
    "isOpen": false,
    "slots": [
      { "openTime": "09:00", "closeTime": "18:00" }
    ]
  }
}
```

---

## 🚀 Déploiement

**Commit:** `70b944f` - "feat: Add support for multiple time slots per day (lunch break)"

**Statut:** ✅ Déployé sur Vercel (production)

**URL de Test:** https://haguenau.pro/business/dashboard/hours

---

## 🎨 Interface Utilisateur

### Fonctionnalités Visuelles

1. **Bouton "+ Ajouter une plage"**
   - Apparaît uniquement si < 2 plages
   - Positionné à droite du nom du jour
   - Style: texte bleu avec icône

2. **Plages Horaires**
   - Chaque plage sur une ligne séparée
   - Labels: "Ouverture" pour la 1ère, "Réouverture" pour la 2ème
   - Bouton de suppression (icône poubelle rouge)

3. **Message d'Aide**
   - 💡 "Vous pouvez ajouter jusqu'à 2 plages horaires par jour"
   - Positionné en haut du formulaire

4. **Tooltip**
   - Info: "Configurez vos horaires avec possibilité d'ajouter une pause déjeuner"

---

## 🔧 API Backend

**Endpoint:** `/api/business/hours`

**Méthodes:**
- `GET` - Récupère les horaires (avec conversion automatique)
- `PUT` - Sauvegarde les horaires (nouveau format supporté)

**Aucune modification nécessaire** car l'API utilise déjà `Json?` pour stocker les données.

---

## 📝 Notes Techniques

### Stockage Database

**Table:** `business_hours`

**Colonnes:**
- `monday: Json?`
- `tuesday: Json?`
- `wednesday: Json?`
- etc.

**Format JSON:** Flexible, supporte à la fois l'ancien et le nouveau format.

### Migration

**Aucune migration requise!** 

Le système détecte automatiquement l'ancien format et le convertit à la volée lors de la lecture.

---

## ✨ Avantages

1. **Flexibilité:** Entreprises peuvent définir des horaires avec ou sans pause
2. **Simplicité:** Interface intuitive avec boutons +/- 
3. **Compatibilité:** Ancien format toujours supporté
4. **Performance:** Aucun impact sur la base de données
5. **UX:** Messages clairs et validation en temps réel

---

## 🎯 Prochaines Étapes (Optionnel)

### Améliorations Possibles

1. **Plus de 2 plages:** Permettre 3+ plages pour cas exceptionnels
2. **Templates:** Sauvegarder des modèles d'horaires réutilisables
3. **Copier/Coller:** Dupliquer les horaires d'un jour à un autre
4. **Validation Avancée:** Vérifier que les plages ne se chevauchent pas
5. **Aperçu Visuel:** Timeline graphique des horaires de la semaine

---

## 📊 Résumé

**Status:** ✅ **COMPLÉTÉ ET DÉPLOYÉ**

**Fichiers Modifiés:** 2
**Lignes Ajoutées:** 748
**Lignes Supprimées:** 170

**Impact:** Amélioration significative de l'UX pour les entreprises avec pauses déjeuner.

**Compatibilité:** 100% backward compatible avec l'ancien système.

---

**Déploiement:** Production (22 domains)  
**Date:** 2025-11-05  
**Version:** v2.0 - Multiple Time Slots
