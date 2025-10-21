/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Liste des entreprises
 *     description: Récupère la liste des entreprises filtrées par domaine et paramètres de recherche
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom, adresse ou ville
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *     responses:
 *       200:
 *         description: Liste des entreprises récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       400:
 *         description: Domaine invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer une entreprise
 *     description: Crée une nouvelle entreprise (Admin uniquement)
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - address
 *               - city
 *               - postalCode
 *             properties:
 *               name:
 *                 type: string
 *                 example: Restaurant Le Gourmet
 *               slug:
 *                 type: string
 *                 example: restaurant-le-gourmet
 *               googlePlaceId:
 *                 type: string
 *                 example: ChIJN1t_tDeuEmsRUsoyG83frY4
 *               address:
 *                 type: string
 *                 example: 123 Rue Principale
 *               city:
 *                 type: string
 *                 example: Haguenau
 *               postalCode:
 *                 type: string
 *                 example: "67500"
 *               phone:
 *                 type: string
 *                 example: "+33 3 88 12 34 56"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@legourmet.fr
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://legourmet.fr
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 48.8156
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 7.7889
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["restaurant", "food"]
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *               coverImageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Entreprise créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Non autorisé (Admin uniquement)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Détails d'une entreprise
 *     description: Récupère les détails complets d'une entreprise par ID
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Détails de l'entreprise récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Entreprise non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Mettre à jour une entreprise
 *     description: Met à jour les informations d'une entreprise (Admin uniquement)
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entreprise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *                 format: uri
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Entreprise mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer une entreprise
 *     description: Supprime une entreprise (Admin uniquement)
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Entreprise supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/companies/{id}/reviews:
 *   get:
 *     summary: Avis d'une entreprise
 *     description: Récupère tous les avis d'une entreprise
 *     tags:
 *       - Companies
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entreprise
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'avis par page
 *     responses:
 *       200:
 *         description: Liste des avis récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/companies/{id}/sync-reviews:
 *   post:
 *     summary: Synchroniser les avis Google
 *     description: Synchronise les avis depuis Google Places API (Admin uniquement)
 *     tags:
 *       - Companies
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Avis synchronisés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Avis synchronisés avec succès"
 *                 newReviews:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/reviews/submit:
 *   post:
 *     summary: Soumettre un avis
 *     description: Permet aux utilisateurs de soumettre un nouvel avis pour une entreprise
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - authorName
 *               - rating
 *               - comment
 *             properties:
 *               companyId:
 *                 type: integer
 *                 example: 1
 *               authorName:
 *                 type: string
 *                 example: Jean Dupont
 *               authorEmail:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent service, très professionnel!
 *     responses:
 *       201:
 *         description: Avis soumis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription utilisateur
 *     description: Crée un nouveau compte utilisateur
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePassword123!
 *               name:
 *                 type: string
 *                 example: Jean Dupont
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Compte créé avec succès
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/business/signup:
 *   post:
 *     summary: Inscription propriétaire d'entreprise
 *     description: Crée un compte pour un propriétaire d'entreprise
 *     tags:
 *       - Authentication
 *       - Business Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - companyName
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@restaurant.fr
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePassword123!
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *               companyName:
 *                 type: string
 *                 example: Restaurant Le Gourmet
 *               phone:
 *                 type: string
 *                 example: "+33 3 88 12 34 56"
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/business/profile:
 *   get:
 *     summary: Profil de l'entreprise
 *     description: Récupère le profil de l'entreprise de l'utilisateur connecté
 *     tags:
 *       - Business Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 *   put:
 *     summary: Mettre à jour le profil
 *     description: Met à jour les informations de l'entreprise
 *     tags:
 *       - Business Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/search/advanced:
 *   get:
 *     summary: Recherche avancée
 *     description: Recherche d'entreprises avec filtres avancés
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Catégorie
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Note minimum
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, reviews, name]
 *         description: Tri
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/stripe/create-checkout-session:
 *   post:
 *     summary: Créer une session de paiement
 *     description: Crée une session Stripe Checkout pour un abonnement
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *                 example: premium
 *     responses:
 *       200:
 *         description: Session créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: cs_test_a1b2c3d4e5f6
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6
 *       401:
 *         description: Non authentifié
 *       400:
 *         description: Plan invalide
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Formulaire de contact
 *     description: Envoie un message via le formulaire de contact
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jean Dupont
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean@example.com
 *               phone:
 *                 type: string
 *                 example: "+33 6 12 34 56 78"
 *               subject:
 *                 type: string
 *                 example: Question sur l'abonnement
 *               message:
 *                 type: string
 *                 example: J'aimerais en savoir plus sur vos services
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Vérifie l'état de santé de l'API
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */



// ============================================================================
// ADMIN API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Créer un nouvel administrateur
 *     description: Crée un nouvel utilisateur avec un rôle administrateur (admin ou super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom complet de l'administrateur
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Mot de passe (minimum 8 caractères)
 *                 example: "SecurePass123!"
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 description: Rôle de l'administrateur
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       409:
 *         description: L'utilisateur existe déjà
 */

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Liste des catégories
 *     description: Récupère toutes les catégories d'entreprises
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des catégories
 *   post:
 *     summary: Créer une catégorie
 *     description: Crée une nouvelle catégorie d'entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleCategory
 *               - frenchName
 *             properties:
 *               googleCategory:
 *                 type: string
 *                 example: "restaurant"
 *               frenchName:
 *                 type: string
 *                 example: "Restaurant"
 *               icon:
 *                 type: string
 *                 example: "🍽️"
 *     responses:
 *       201:
 *         description: Catégorie créée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie
 *     description: Met à jour les informations d'une catégorie
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               googleCategory:
 *                 type: string
 *               frenchName:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *       401:
 *         description: Non autorisé
 *   delete:
 *     summary: Supprimer une catégorie
 *     description: Supprime une catégorie d'entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catégorie supprimée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Liste des avis (admin)
 *     description: Récupère tous les avis pour modération
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste des avis
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/reviews/sync:
 *   post:
 *     summary: Synchroniser tous les avis Google
 *     description: Lance la synchronisation des avis Google pour toutes les entreprises
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Synchronisation lancée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/companies/{id}/status:
 *   put:
 *     summary: Changer le statut d'une entreprise
 *     description: Active ou désactive une entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/companies/{id}/sync-reviews:
 *   post:
 *     summary: Synchroniser les avis d'une entreprise
 *     description: Synchronise les avis Google pour une entreprise spécifique
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avis synchronisés
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/companies/generate-description:
 *   post:
 *     summary: Générer une description avec AI
 *     description: Génère une description d'entreprise en utilisant l'intelligence artificielle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - category
 *             properties:
 *               companyName:
 *                 type: string
 *               category:
 *                 type: string
 *               additionalInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Description générée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/companies/{id}/generate-cover-image:
 *   post:
 *     summary: Générer une image de couverture
 *     description: Génère une image de couverture pour une entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image générée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/domains/{id}/seo:
 *   put:
 *     summary: Mettre à jour le SEO d'un domaine
 *     description: Met à jour les métadonnées SEO d'un domaine
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteTitle:
 *                 type: string
 *               siteDescription:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: SEO mis à jour
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/legal-pages:
 *   get:
 *     summary: Liste des pages légales
 *     description: Récupère toutes les pages légales (CGU, CGV, etc.)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des pages légales
 *       401:
 *         description: Non autorisé
 *   post:
 *     summary: Créer une page légale
 *     description: Crée une nouvelle page légale
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [cgu, cgv, privacy, mentions]
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Page créée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/legal-pages/{id}:
 *   put:
 *     summary: Mettre à jour une page légale
 *     description: Met à jour le contenu d'une page légale
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Page mise à jour
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/inquiries/{id}:
 *   get:
 *     summary: Détails d'une demande de contact
 *     description: Récupère les détails d'une demande de contact
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la demande
 *       401:
 *         description: Non autorisé
 *   put:
 *     summary: Mettre à jour le statut d'une demande
 *     description: Change le statut d'une demande de contact
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/subscriptions:
 *   get:
 *     summary: Liste des abonnements
 *     description: Récupère tous les abonnements actifs et inactifs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, cancelled]
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *           enum: [basic, pro, enterprise]
 *     responses:
 *       200:
 *         description: Liste des abonnements
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/business-owners/{id}:
 *   get:
 *     summary: Détails d'un propriétaire d'entreprise
 *     description: Récupère les informations détaillées d'un propriétaire
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du propriétaire
 *       401:
 *         description: Non autorisé
 *   put:
 *     summary: Mettre à jour un propriétaire
 *     description: Met à jour les informations d'un propriétaire d'entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVerified:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [active, suspended, banned]
 *     responses:
 *       200:
 *         description: Propriétaire mis à jour
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/sitemap/generate:
 *   post:
 *     summary: Générer le sitemap
 *     description: Génère le fichier sitemap.xml pour tous les domaines
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sitemap généré
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/sitemap/stats:
 *   get:
 *     summary: Statistiques du sitemap
 *     description: Récupère les statistiques de génération du sitemap
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du sitemap
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/admin/sync-all-reviews:
 *   post:
 *     summary: Synchroniser tous les avis
 *     description: Lance la synchronisation des avis pour toutes les entreprises
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Synchronisation lancée
 *       401:
 *         description: Non autorisé
 */




// ============================================================================
// ANALYTICS API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/analytics/ecommerce:
 *   post:
 *     summary: Suivre les événements e-commerce
 *     description: Enregistre les événements e-commerce (vues, clics, achats)
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - data
 *             properties:
 *               event:
 *                 type: string
 *                 enum: [view, click, purchase]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Événement enregistré
 */

/**
 * @swagger
 * /api/analytics/vitals:
 *   post:
 *     summary: Enregistrer les Core Web Vitals
 *     description: Enregistre les métriques de performance (LCP, FID, CLS)
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lcp:
 *                 type: number
 *               fid:
 *                 type: number
 *               cls:
 *                 type: number
 *     responses:
 *       200:
 *         description: Métriques enregistrées
 */

/**
 * @swagger
 * /api/companies/{id}/analytics:
 *   get:
 *     summary: Statistiques d'une entreprise
 *     description: Récupère les statistiques détaillées d'une entreprise
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Statistiques de l'entreprise
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/business/analytics:
 *   get:
 *     summary: Tableau de bord analytique
 *     description: Récupère les analytics du propriétaire d'entreprise
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *     responses:
 *       200:
 *         description: Données analytiques
 *       401:
 *         description: Non autorisé
 */

// ============================================================================
// AI/ML API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat avec l'assistant IA
 *     description: Envoie un message à l'assistant IA et reçoit une réponse
 *     tags: [AI/ML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Réponse de l'IA
 */

/**
 * @swagger
 * /api/ai/analyze-sentiment:
 *   post:
 *     summary: Analyser le sentiment d'un texte
 *     description: Analyse le sentiment (positif/négatif/neutre) d'un texte
 *     tags: [AI/ML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Résultat de l'analyse
 */

/**
 * @swagger
 * /api/ai/generate-description:
 *   post:
 *     summary: Générer une description
 *     description: Génère une description optimisée pour une entreprise
 *     tags: [AI/ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - category
 *             properties:
 *               companyName:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Description générée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     summary: Recommandations personnalisées
 *     description: Obtient des recommandations d'entreprises basées sur l'IA
 *     tags: [AI/ML]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste de recommandations
 */

/**
 * @swagger
 * /api/ai/generate-seo-content:
 *   post:
 *     summary: Générer du contenu SEO
 *     description: Génère du contenu optimisé pour le référencement
 *     tags: [AI/ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keywords
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Contenu SEO généré
 */

// ============================================================================
// MOBILE API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/mobile/auth/login:
 *   post:
 *     summary: Connexion mobile
 *     description: Authentifie un utilisateur mobile
 *     tags: [Mobile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token d'authentification
 */

/**
 * @swagger
 * /api/mobile/config:
 *   get:
 *     summary: Configuration mobile
 *     description: Récupère la configuration de l'application mobile
 *     tags: [Mobile]
 *     responses:
 *       200:
 *         description: Configuration de l'app
 */

/**
 * @swagger
 * /api/mobile/companies/{companyId}:
 *   get:
 *     summary: Détails entreprise (mobile)
 *     description: Récupère les détails d'une entreprise optimisés pour mobile
 *     tags: [Mobile]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'entreprise
 */

/**
 * @swagger
 * /api/mobile/notifications/send:
 *   post:
 *     summary: Envoyer une notification push
 *     description: Envoie une notification push aux utilisateurs mobiles
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification envoyée
 */

// ============================================================================
// DEVELOPER API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/developer/api-keys:
 *   get:
 *     summary: Liste des clés API
 *     description: Récupère toutes les clés API du développeur
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clés API
 *   post:
 *     summary: Créer une clé API
 *     description: Génère une nouvelle clé API
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Clé API créée
 */

/**
 * @swagger
 * /api/developer/api-keys/{keyId}:
 *   delete:
 *     summary: Supprimer une clé API
 *     description: Révoque une clé API existante
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clé API supprimée
 */

/**
 * @swagger
 * /api/developer/webhooks:
 *   get:
 *     summary: Liste des webhooks
 *     description: Récupère tous les webhooks configurés
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des webhooks
 *   post:
 *     summary: Créer un webhook
 *     description: Configure un nouveau webhook
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Webhook créé
 */

/**
 * @swagger
 * /api/developer/webhooks/{webhookId}/test:
 *   post:
 *     summary: Tester un webhook
 *     description: Envoie un événement de test au webhook
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test envoyé
 */

// ============================================================================
// E-COMMERCE API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Liste des produits
 *     description: Récupère tous les produits disponibles
 *     tags: [E-commerce]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des produits
 *   post:
 *     summary: Créer un produit
 *     description: Ajoute un nouveau produit
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produit créé
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Contenu du panier
 *     description: Récupère le contenu du panier de l'utilisateur
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contenu du panier
 *   post:
 *     summary: Ajouter au panier
 *     description: Ajoute un produit au panier
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produit ajouté
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Liste des commandes
 *     description: Récupère toutes les commandes de l'utilisateur
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes
 *   post:
 *     summary: Créer une commande
 *     description: Crée une nouvelle commande
 *     tags: [E-commerce]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Commande créée
 */

// ============================================================================
// MARKETING API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/marketing/campaigns:
 *   get:
 *     summary: Liste des campagnes
 *     description: Récupère toutes les campagnes marketing
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des campagnes
 *   post:
 *     summary: Créer une campagne
 *     description: Crée une nouvelle campagne marketing
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, sms, push]
 *     responses:
 *       201:
 *         description: Campagne créée
 */

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Programme de parrainage
 *     description: Récupère les informations du programme de parrainage
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de parrainage
 *   post:
 *     summary: Créer un lien de parrainage
 *     description: Génère un nouveau lien de parrainage
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Lien créé
 */

// ============================================================================
// BOOKINGS API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Liste des réservations
 *     description: Récupère toutes les réservations de l'utilisateur
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations
 *   post:
 *     summary: Créer une réservation
 *     description: Crée une nouvelle réservation
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - date
 *               - time
 *             properties:
 *               companyId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réservation créée
 */

/**
 * @swagger
 * /api/bookings/availability:
 *   get:
 *     summary: Disponibilités
 *     description: Vérifie les créneaux disponibles pour une entreprise
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Créneaux disponibles
 */

// ============================================================================
// CRON JOBS API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/cron/sync-google-reviews:
 *   get:
 *     summary: Synchronisation automatique des avis
 *     description: Tâche planifiée pour synchroniser les avis Google
 *     tags: [Cron Jobs]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Synchronisation effectuée
 */

/**
 * @swagger
 * /api/cron/subscriptions-check:
 *   get:
 *     summary: Vérification des abonnements
 *     description: Tâche planifiée pour vérifier les abonnements expirés
 *     tags: [Cron Jobs]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Vérification effectuée
 */

// ============================================================================
// BILLING & PAYMENTS API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/billing/create-checkout:
 *   post:
 *     summary: Créer une session de paiement
 *     description: Crée une session Stripe Checkout
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceId
 *             properties:
 *               priceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session créée
 */

/**
 * @swagger
 * /api/billing/portal:
 *   post:
 *     summary: Portail de facturation
 *     description: Crée une session pour le portail de facturation Stripe
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URL du portail
 */

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Plans d'abonnement
 *     description: Récupère tous les plans d'abonnement disponibles
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Liste des plans
 */

// ============================================================================
// UPLOAD & MEDIA API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Télécharger un fichier
 *     description: Upload un fichier (image, document)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fichier uploadé
 */

/**
 * @swagger
 * /api/business/photos:
 *   get:
 *     summary: Photos de l'entreprise
 *     description: Récupère toutes les photos de l'entreprise
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des photos
 *   post:
 *     summary: Ajouter une photo
 *     description: Ajoute une nouvelle photo à l'entreprise
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Photo ajoutée
 */

// ============================================================================
// DOMAINS API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/domains:
 *   get:
 *     summary: Liste des domaines
 *     description: Récupère tous les domaines configurés
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des domaines
 *   post:
 *     summary: Ajouter un domaine
 *     description: Configure un nouveau domaine
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *     responses:
 *       201:
 *         description: Domaine ajouté
 */

// ============================================================================
// GOOGLE MAPS API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/google-maps/search:
 *   get:
 *     summary: Rechercher sur Google Maps
 *     description: Recherche des entreprises via l'API Google Maps
 *     tags: [Google Maps]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de recherche
 */

/**
 * @swagger
 * /api/google-maps/place/{placeId}:
 *   get:
 *     summary: Détails d'un lieu Google
 *     description: Récupère les détails d'un lieu via son Place ID
 *     tags: [Google Maps]
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du lieu
 */

// ============================================================================
// DASHBOARD API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/dashboard/layout:
 *   get:
 *     summary: Configuration du tableau de bord
 *     description: Récupère la configuration du layout du dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration du layout
 *   put:
 *     summary: Mettre à jour le layout
 *     description: Sauvegarde la configuration du dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Layout mis à jour
 */

/**
 * @swagger
 * /api/dashboard/widget-data:
 *   get:
 *     summary: Données des widgets
 *     description: Récupère les données pour les widgets du dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: widgets
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Données des widgets
 */

// ============================================================================
// USER & PROFILE API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/user/company:
 *   get:
 *     summary: Entreprises de l'utilisateur
 *     description: Récupère les entreprises liées à l'utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des entreprises
 */

/**
 * @swagger
 * /api/unsubscribe:
 *   post:
 *     summary: Se désabonner
 *     description: Désabonnement des emails marketing
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Désabonnement effectué
 */

// ============================================================================
// VERSIONED API (v1)
// ============================================================================

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Liste des entreprises (API v1)
 *     description: Version 1 de l'API - Liste des entreprises
 *     tags: [API v1]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des entreprises
 */

/**
 * @swagger
 * /api/v1/companies/{companyId}:
 *   get:
 *     summary: Détails entreprise (API v1)
 *     description: Version 1 de l'API - Détails d'une entreprise
 *     tags: [API v1]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'entreprise
 */

