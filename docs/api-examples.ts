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

