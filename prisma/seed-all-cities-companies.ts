import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🏢 Starting comprehensive companies seed for all 12 cities...\n');

  // Get all domains
  const domains = await prisma.domain.findMany();
  console.log(`Found ${domains.length} domains\n`);

  // Companies data for each city
  const citiesData: Record<string, any[]> = {
    'bischwiller.pro': [
      {
        name: 'Boulangerie Artisanale Schmitt',
        address: '15 Rue du Général de Gaulle',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 80 12',
        email: 'contact@boulangerie-schmitt.fr',
        website: 'https://boulangerie-schmitt.fr',
        categories: ['Boulangerie', 'Pâtisserie'],
      },
      {
        name: 'Restaurant Le Strasbourg',
        address: '28 Grand Rue',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 72 45',
        email: 'info@restaurant-strasbourg.fr',
        website: 'https://restaurant-strasbourg.fr',
        categories: ['Restaurant', 'Cuisine Française'],
      },
      {
        name: 'Pharmacie Centrale',
        address: '42 Rue de la République',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 65 89',
        email: 'pharmacie.centrale@orange.fr',
        categories: ['Pharmacie', 'Santé'],
      },
      {
        name: 'Garage Auto Muller',
        address: '8 Route de Haguenau',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 91 23',
        email: 'garage.muller@gmail.com',
        website: 'https://garage-muller.fr',
        categories: ['Garage', 'Automobile', 'Réparation'],
      },
      {
        name: 'Coiffure Élégance',
        address: '12 Rue du Marché',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 44 67',
        email: 'elegance.coiffure@gmail.com',
        categories: ['Coiffure', 'Beauté'],
      },
      {
        name: 'Boucherie Charcuterie Klein',
        address: '35 Grand Rue',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 58 34',
        email: 'boucherie.klein@wanadoo.fr',
        categories: ['Boucherie', 'Charcuterie', 'Alimentation'],
      },
      {
        name: 'Optique Vision Plus',
        address: '19 Rue de la Gare',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 77 92',
        email: 'contact@vision-plus.fr',
        website: 'https://vision-plus-bischwiller.fr',
        categories: ['Optique', 'Santé'],
      },
      {
        name: 'Pizzeria Bella Napoli',
        address: '24 Rue du Stade',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 82 15',
        email: 'bella.napoli@gmail.com',
        categories: ['Pizzeria', 'Restaurant', 'Italien'],
      },
      {
        name: 'Fleuriste Au Jardin Fleuri',
        address: '7 Place du Marché',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 69 41',
        email: 'jardin.fleuri@orange.fr',
        categories: ['Fleuriste', 'Décoration'],
      },
      {
        name: 'Cabinet Dentaire Dr. Weber',
        address: '31 Rue de la Paix',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 95 73',
        email: 'dr.weber@dentiste-bischwiller.fr',
        categories: ['Dentiste', 'Santé'],
      },
      {
        name: 'Tabac Presse Le Central',
        address: '18 Grand Rue',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 61 28',
        categories: ['Tabac', 'Presse', 'Commerce'],
      },
      {
        name: 'Agence Immobilière Alsace Habitat',
        address: '45 Rue du Général de Gaulle',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 88 56',
        email: 'contact@alsace-habitat.fr',
        website: 'https://alsace-habitat-bischwiller.fr',
        categories: ['Immobilier', 'Agence'],
      },
      {
        name: 'Banque Crédit Mutuel',
        address: '22 Rue de la République',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 74 92',
        website: 'https://www.creditmutuel.fr',
        categories: ['Banque', 'Finance'],
      },
      {
        name: 'École de Musique Harmonie',
        address: '9 Rue des Écoles',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 66 38',
        email: 'harmonie.musique@gmail.com',
        categories: ['Musique', 'Éducation', 'Loisirs'],
      },
      {
        name: 'Supermarché Intermarché',
        address: '52 Route de Haguenau',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 79 45',
        website: 'https://www.intermarche.com',
        categories: ['Supermarché', 'Alimentation', 'Commerce'],
      },
      {
        name: 'Café de la Gare',
        address: '3 Place de la Gare',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 52 17',
        categories: ['Café', 'Bar', 'Restaurant'],
      },
      {
        name: 'Plomberie Chauffage Schneider',
        address: '14 Rue de l\'Industrie',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 87 64',
        email: 'schneider.plomberie@orange.fr',
        categories: ['Plomberie', 'Chauffage', 'Artisan'],
      },
      {
        name: 'Pressing Laverie Moderne',
        address: '26 Rue du Marché',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 71 39',
        categories: ['Pressing', 'Laverie', 'Services'],
      },
      {
        name: 'Kinésithérapeute Martin Dubois',
        address: '11 Rue de la Santé',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 93 82',
        email: 'martin.dubois.kine@gmail.com',
        categories: ['Kinésithérapie', 'Santé'],
      },
      {
        name: 'Librairie Papeterie Le Livre d\'Or',
        address: '17 Grand Rue',
        city: 'Bischwiller',
        postalCode: '67240',
        phone: '+33 3 88 53 64 51',
        email: 'librairie.livredor@wanadoo.fr',
        categories: ['Librairie', 'Papeterie', 'Commerce'],
      },
    ],

    'bouxwiller.pro': [
      {
        name: 'Hôtel Restaurant Au Lion d\'Or',
        address: '1 Place du Château',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 72 08',
        email: 'contact@liondor-bouxwiller.fr',
        website: 'https://liondor-bouxwiller.fr',
        categories: ['Hôtel', 'Restaurant', 'Hébergement'],
      },
      {
        name: 'Boulangerie Pâtisserie Acker',
        address: '12 Grand Rue',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 71 45',
        email: 'boulangerie.acker@orange.fr',
        categories: ['Boulangerie', 'Pâtisserie'],
      },
      {
        name: 'Pharmacie du Centre',
        address: '8 Rue du Château',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 73 92',
        email: 'pharmacie.centre.bouxwiller@gmail.com',
        categories: ['Pharmacie', 'Santé'],
      },
      {
        name: 'Garage Automobile Roth',
        address: '25 Route d\'Ingwiller',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 75 34',
        email: 'garage.roth@wanadoo.fr',
        website: 'https://garage-roth.fr',
        categories: ['Garage', 'Automobile', 'Réparation'],
      },
      {
        name: 'Salon de Coiffure Tendance',
        address: '15 Grand Rue',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 76 88',
        email: 'tendance.coiffure@gmail.com',
        categories: ['Coiffure', 'Beauté'],
      },
      {
        name: 'Boucherie Charcuterie Traiteur Meyer',
        address: '19 Rue du Marché',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 74 56',
        email: 'boucherie.meyer@orange.fr',
        categories: ['Boucherie', 'Charcuterie', 'Traiteur'],
      },
      {
        name: 'Cabinet Médical Dr. Hoffmann',
        address: '7 Rue de la Santé',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 79 21',
        email: 'dr.hoffmann@medecin-bouxwiller.fr',
        categories: ['Médecin', 'Santé'],
      },
      {
        name: 'Fleuriste Les Jardins de Bouxwiller',
        address: '4 Place du Marché',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 77 63',
        email: 'jardins.bouxwiller@gmail.com',
        categories: ['Fleuriste', 'Décoration'],
      },
      {
        name: 'Pizzeria La Dolce Vita',
        address: '22 Grand Rue',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 78 95',
        email: 'ladolcevita.bouxwiller@gmail.com',
        categories: ['Pizzeria', 'Restaurant', 'Italien'],
      },
      {
        name: 'Tabac Presse Loto',
        address: '11 Rue du Château',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 72 47',
        categories: ['Tabac', 'Presse', 'Commerce'],
      },
      {
        name: 'Agence Immobilière Pays de Hanau',
        address: '18 Grand Rue',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 81 55',
        email: 'contact@immobilier-hanau.fr',
        website: 'https://immobilier-hanau.fr',
        categories: ['Immobilier', 'Agence'],
      },
      {
        name: 'Banque Caisse d\'Épargne',
        address: '14 Rue du Château',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 73 29',
        website: 'https://www.caisse-epargne.fr',
        categories: ['Banque', 'Finance'],
      },
      {
        name: 'Menuiserie Ebénisterie Fuchs',
        address: '31 Route de Saverne',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 84 67',
        email: 'menuiserie.fuchs@orange.fr',
        categories: ['Menuiserie', 'Ébénisterie', 'Artisan'],
      },
      {
        name: 'Supermarché Petit Casino',
        address: '28 Grand Rue',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 76 12',
        website: 'https://www.casino.fr',
        categories: ['Supermarché', 'Alimentation', 'Commerce'],
      },
      {
        name: 'Café Restaurant Le Relais',
        address: '5 Place de la Gare',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 75 89',
        categories: ['Café', 'Restaurant'],
      },
      {
        name: 'Électricité Plomberie Weber',
        address: '16 Rue de l\'Artisanat',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 82 41',
        email: 'weber.electricite@gmail.com',
        categories: ['Électricité', 'Plomberie', 'Artisan'],
      },
      {
        name: 'Kinésithérapeute Sophie Laurent',
        address: '9 Rue de la Santé',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 86 73',
        email: 'sophie.laurent.kine@gmail.com',
        categories: ['Kinésithérapie', 'Santé'],
      },
      {
        name: 'Optique Lunettes Vision',
        address: '13 Grand Rue',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 79 54',
        email: 'optique.vision.bouxwiller@gmail.com',
        categories: ['Optique', 'Santé'],
      },
      {
        name: 'Vétérinaire Dr. Muller',
        address: '23 Route d\'Ingwiller',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 83 96',
        email: 'veterinaire.muller@orange.fr',
        categories: ['Vétérinaire', 'Santé Animale'],
      },
      {
        name: 'Musée du Pays de Hanau - Boutique',
        address: '3 Place du Château',
        city: 'Bouxwiller',
        postalCode: '67330',
        phone: '+33 3 88 70 97 17',
        email: 'musee@paysdehanau.fr',
        website: 'https://musee-paysdehanau.fr',
        categories: ['Musée', 'Culture', 'Tourisme'],
      },
    ],

    'brumath.pro': [
      {
        name: 'Restaurant Au Bœuf Rouge',
        address: '12 Grand Rue',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 11 08',
        email: 'contact@boeuf-rouge.fr',
        website: 'https://boeuf-rouge-brumath.fr',
        categories: ['Restaurant', 'Cuisine Alsacienne'],
      },
      {
        name: 'Boulangerie Pâtisserie Kieffer',
        address: '28 Rue du Général Leclerc',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 12 45',
        email: 'boulangerie.kieffer@orange.fr',
        categories: ['Boulangerie', 'Pâtisserie'],
      },
      {
        name: 'Pharmacie de la Gare',
        address: '15 Place de la Gare',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 13 72',
        email: 'pharmacie.gare.brumath@gmail.com',
        categories: ['Pharmacie', 'Santé'],
      },
      {
        name: 'Garage Peugeot Brumath Auto',
        address: '42 Route de Strasbourg',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 14 89',
        email: 'contact@brumath-auto.fr',
        website: 'https://brumath-auto.fr',
        categories: ['Garage', 'Automobile', 'Peugeot'],
      },
      {
        name: 'Coiffure Studio Hair',
        address: '19 Grand Rue',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 15 34',
        email: 'studio.hair.brumath@gmail.com',
        categories: ['Coiffure', 'Beauté'],
      },
      {
        name: 'Boucherie Charcuterie Schneider',
        address: '24 Rue du Marché',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 16 67',
        email: 'boucherie.schneider@wanadoo.fr',
        categories: ['Boucherie', 'Charcuterie'],
      },
      {
        name: 'Cabinet Dentaire Dr. Martin',
        address: '8 Rue de la Santé',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 17 91',
        email: 'dr.martin.dentiste@gmail.com',
        categories: ['Dentiste', 'Santé'],
      },
      {
        name: 'Fleuriste Au Bouquet Fleuri',
        address: '11 Place du Marché',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 18 23',
        email: 'bouquet.fleuri@orange.fr',
        categories: ['Fleuriste', 'Décoration'],
      },
      {
        name: 'Pizzeria Chez Mario',
        address: '33 Grand Rue',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 19 56',
        email: 'chez.mario.brumath@gmail.com',
        categories: ['Pizzeria', 'Restaurant', 'Italien'],
      },
      {
        name: 'Tabac Presse Le Central',
        address: '17 Rue du Général Leclerc',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 20 78',
        categories: ['Tabac', 'Presse', 'Commerce'],
      },
      {
        name: 'Agence Immobilière Brumath Immobilier',
        address: '25 Grand Rue',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 21 92',
        email: 'contact@brumath-immobilier.fr',
        website: 'https://brumath-immobilier.fr',
        categories: ['Immobilier', 'Agence'],
      },
      {
        name: 'Banque Crédit Agricole',
        address: '14 Place de la République',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 22 45',
        website: 'https://www.credit-agricole.fr',
        categories: ['Banque', 'Finance'],
      },
      {
        name: 'Supermarché Carrefour Market',
        address: '48 Route de Strasbourg',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 23 67',
        website: 'https://www.carrefour.fr',
        categories: ['Supermarché', 'Alimentation', 'Commerce'],
      },
      {
        name: 'Café Brasserie Le Strasbourg',
        address: '6 Place de la Gare',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 24 89',
        categories: ['Café', 'Brasserie', 'Restaurant'],
      },
      {
        name: 'Plomberie Chauffage Klein',
        address: '21 Rue de l\'Industrie',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 25 12',
        email: 'plomberie.klein@orange.fr',
        categories: ['Plomberie', 'Chauffage', 'Artisan'],
      },
      {
        name: 'Kinésithérapeute Anne Dupont',
        address: '13 Rue de la Santé',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 26 34',
        email: 'anne.dupont.kine@gmail.com',
        categories: ['Kinésithérapie', 'Santé'],
      },
      {
        name: 'Optique Krys',
        address: '22 Grand Rue',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 27 56',
        email: 'krys.brumath@gmail.com',
        website: 'https://www.krys.com',
        categories: ['Optique', 'Santé'],
      },
      {
        name: 'Auto-École Conduite Plus',
        address: '18 Rue du Général Leclerc',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 28 78',
        email: 'conduite.plus@gmail.com',
        categories: ['Auto-École', 'Formation'],
      },
      {
        name: 'Pressing Laverie Express',
        address: '29 Grand Rue',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 29 91',
        categories: ['Pressing', 'Laverie', 'Services'],
      },
      {
        name: 'Vétérinaire Clinique des Vosges',
        address: '35 Route de Haguenau',
        city: 'Brumath',
        postalCode: '67170',
        phone: '+33 3 88 51 30 23',
        email: 'clinique.vosges@orange.fr',
        categories: ['Vétérinaire', 'Santé Animale'],
      },
    ],
  };

  // Add more cities data (continuing...)
  citiesData['hoerdt.pro'] = [
    {
      name: 'Restaurant Au Soleil',
      address: '8 Grand Rue',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 30 12',
      email: 'contact@ausoleil-hoerdt.fr',
      categories: ['Restaurant', 'Cuisine Française'],
    },
    {
      name: 'Boulangerie Pâtisserie Lehmann',
      address: '14 Rue Principale',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 31 45',
      email: 'boulangerie.lehmann@orange.fr',
      categories: ['Boulangerie', 'Pâtisserie'],
    },
    {
      name: 'Pharmacie du Village',
      address: '5 Place de l\'Église',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 32 78',
      email: 'pharmacie.hoerdt@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Garage Automobile Fischer',
      address: '22 Route de Strasbourg',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 33 91',
      email: 'garage.fischer@wanadoo.fr',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Coiffure Beauté Moderne',
      address: '11 Grand Rue',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 34 23',
      email: 'beaute.moderne@gmail.com',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boucherie Traiteur Muller',
      address: '17 Rue Principale',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 35 56',
      email: 'boucherie.muller@orange.fr',
      categories: ['Boucherie', 'Traiteur'],
    },
    {
      name: 'Cabinet Médical Dr. Schmidt',
      address: '3 Rue de la Santé',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 36 89',
      email: 'dr.schmidt@medecin-hoerdt.fr',
      categories: ['Médecin', 'Santé'],
    },
    {
      name: 'Fleuriste Les Roses du Jardin',
      address: '6 Place de l\'Église',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 37 12',
      email: 'roses.jardin@gmail.com',
      categories: ['Fleuriste', 'Décoration'],
    },
    {
      name: 'Pizzeria La Mama',
      address: '19 Grand Rue',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 38 45',
      email: 'lamama.hoerdt@gmail.com',
      categories: ['Pizzeria', 'Restaurant', 'Italien'],
    },
    {
      name: 'Tabac Presse Loto',
      address: '12 Rue Principale',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 39 78',
      categories: ['Tabac', 'Presse', 'Commerce'],
    },
    {
      name: 'Plomberie Chauffage Roth',
      address: '25 Route de Strasbourg',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 40 91',
      email: 'plomberie.roth@orange.fr',
      categories: ['Plomberie', 'Chauffage', 'Artisan'],
    },
    {
      name: 'Épicerie Alimentation Générale',
      address: '9 Grand Rue',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 41 23',
      categories: ['Épicerie', 'Alimentation', 'Commerce'],
    },
    {
      name: 'Kinésithérapeute Pierre Blanc',
      address: '4 Rue de la Santé',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 42 56',
      email: 'pierre.blanc.kine@gmail.com',
      categories: ['Kinésithérapie', 'Santé'],
    },
    {
      name: 'Menuiserie Ébénisterie Hoffmann',
      address: '28 Rue de l\'Artisanat',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 43 89',
      email: 'menuiserie.hoffmann@orange.fr',
      categories: ['Menuiserie', 'Ébénisterie', 'Artisan'],
    },
    {
      name: 'Café Restaurant Le Village',
      address: '7 Place de l\'Église',
      city: 'Hœrdt',
      postalCode: '67720',
      phone: '+33 3 88 68 44 12',
      categories: ['Café', 'Restaurant'],
    },
  ];

  // Process all cities
  for (const [domainName, companies] of Object.entries(citiesData)) {
    const domain = domains.find((d) => d.name === domainName);
    if (!domain) {
      console.log(`⚠️  Domain not found: ${domainName}`);
      continue;
    }

    console.log(`\n📍 Processing ${domainName} (${companies.length} companies)...`);

    for (const companyData of companies) {
      const slug = generateSlug(companyData.name);

      // Check if company already exists
      const existingCompany = await prisma.company.findUnique({
        where: { slug },
      });

      if (existingCompany) {
        console.log(`  ⏭️  Skipping existing: ${companyData.name}`);
        
        // Check if content exists for this domain
        const existingContent = await prisma.companyContent.findFirst({
          where: {
            companyId: existingCompany.id,
            domainId: domain.id,
          },
        });

        if (!existingContent) {
          // Add content for this domain
          await prisma.companyContent.create({
            data: {
              companyId: existingCompany.id,
              domainId: domain.id,
              isVisible: true,
            },
          });
          console.log(`  ✅ Added content link for domain`);
        }
        continue;
      }

      // Create company
      const company = await prisma.company.create({
        data: {
          name: companyData.name,
          slug,
          address: companyData.address,
          city: companyData.city,
          postalCode: companyData.postalCode,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          categories: companyData.categories,
        },
      });

      // Create company content for this domain
      await prisma.companyContent.create({
        data: {
          companyId: company.id,
          domainId: domain.id,
          isVisible: true,
        },
      });

      console.log(`  ✅ Created: ${companyData.name}`);
    }
  }

  console.log('\n✅ All cities companies seed completed!');
  
  // Print summary
  const totalCompanies = await prisma.company.count();
  const totalContent = await prisma.companyContent.count();
  console.log(`\n📊 Summary:`);
  console.log(`   Total companies: ${totalCompanies}`);
  console.log(`   Total company-domain links: ${totalContent}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

