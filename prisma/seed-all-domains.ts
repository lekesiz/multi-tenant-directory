import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const domainCompanies: Record<string, any[]> = {
  'saverne.pro': [
    { name: 'Boulangerie Artisanale Saverne', slug: 'boulangerie-artisanale-saverne', address: '10 Rue du Général de Gaulle', city: 'Saverne', postalCode: '67700', phone: '03 88 91 10 20', categories: ['Boulangerie', 'Pâtisserie'], description: 'Pains et viennoiseries artisanales.' },
    { name: 'Restaurant Le Château', slug: 'restaurant-le-chateau-saverne', address: '5 Place du Château', city: 'Saverne', postalCode: '67700', phone: '03 88 91 11 21', categories: ['Restaurant', 'Gastronomie'], description: 'Cuisine gastronomique dans un cadre historique.' },
    { name: 'Pharmacie du Centre', slug: 'pharmacie-du-centre-saverne', address: '15 Grand Rue', city: 'Saverne', postalCode: '67700', phone: '03 88 91 12 22', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie de proximité, conseils personnalisés.' },
    { name: 'Garage Citroën Saverne', slug: 'garage-citroen-saverne', address: '20 Route de Paris', city: 'Saverne', postalCode: '67700', phone: '03 88 91 13 23', categories: ['Garage', 'Automobile'], description: 'Vente et entretien de véhicules Citroën.' },
    { name: 'Coiffure Tendance', slug: 'coiffure-tendance-saverne', address: '8 Rue de la Gare', city: 'Saverne', postalCode: '67700', phone: '03 88 91 14 24', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure moderne, coupes tendances.' },
  ],
  'molsheim.pro': [
    { name: 'Boulangerie Pâtisserie Molsheim', slug: 'boulangerie-patisserie-molsheim', address: '12 Rue de Strasbourg', city: 'Molsheim', postalCode: '67120', phone: '03 88 38 10 30', categories: ['Boulangerie', 'Pâtisserie'], description: 'Spécialités alsaciennes et pâtisseries fines.' },
    { name: 'Restaurant Bugatti', slug: 'restaurant-bugatti-molsheim', address: '7 Rue de la Commanderie', city: 'Molsheim', postalCode: '67120', phone: '03 88 38 11 31', categories: ['Restaurant', 'Cuisine Française'], description: 'Restaurant gastronomique, ambiance raffinée.' },
    { name: 'Pharmacie Principale', slug: 'pharmacie-principale-molsheim', address: '18 Place de l\'Hôtel de Ville', city: 'Molsheim', postalCode: '67120', phone: '03 88 38 12 32', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie centrale, large gamme de produits.' },
    { name: 'Garage Peugeot Molsheim', slug: 'garage-peugeot-molsheim', address: '25 Route de Strasbourg', city: 'Molsheim', postalCode: '67120', phone: '03 88 38 13 33', categories: ['Garage', 'Automobile'], description: 'Concessionnaire Peugeot, vente et service.' },
    { name: 'Salon Beauté Molsheim', slug: 'salon-beaute-molsheim', address: '9 Rue du Marché', city: 'Molsheim', postalCode: '67120', phone: '03 88 38 14 34', categories: ['Beauté', 'Esthétique'], description: 'Soins esthétiques et bien-être.' },
  ],
  'obernai.pro': [
    { name: 'Boulangerie Obernai', slug: 'boulangerie-obernai', address: '14 Rue du Général Gouraud', city: 'Obernai', postalCode: '67210', phone: '03 88 95 10 40', categories: ['Boulangerie', 'Pâtisserie'], description: 'Boulangerie traditionnelle alsacienne.' },
    { name: 'Restaurant La Halle aux Blés', slug: 'restaurant-la-halle-aux-bles-obernai', address: '6 Place du Marché', city: 'Obernai', postalCode: '67210', phone: '03 88 95 11 41', categories: ['Restaurant', 'Alsacien'], description: 'Spécialités alsaciennes dans un cadre authentique.' },
    { name: 'Pharmacie Obernai', slug: 'pharmacie-obernai', address: '20 Rue du Chanoine Gyss', city: 'Obernai', postalCode: '67210', phone: '03 88 95 12 42', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie de quartier, service de qualité.' },
    { name: 'Garage Renault Obernai', slug: 'garage-renault-obernai', address: '30 Route de Strasbourg', city: 'Obernai', postalCode: '67210', phone: '03 88 95 13 43', categories: ['Garage', 'Automobile'], description: 'Agent Renault, réparation et vente.' },
    { name: 'Coiffure Obernai', slug: 'coiffure-obernai', address: '11 Rue de Sélestat', city: 'Obernai', postalCode: '67210', phone: '03 88 95 14 44', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure familial.' },
  ],
  'selestat.pro': [
    { name: 'Boulangerie Sélestat', slug: 'boulangerie-selestat', address: '16 Rue du Président Poincaré', city: 'Sélestat', postalCode: '67600', phone: '03 88 92 10 50', categories: ['Boulangerie', 'Pâtisserie'], description: 'Pains bio et pâtisseries artisanales.' },
    { name: 'Restaurant Vieille Tour', slug: 'restaurant-vieille-tour-selestat', address: '8 Rue de la Bibliothèque', city: 'Sélestat', postalCode: '67600', phone: '03 88 92 11 51', categories: ['Restaurant', 'Gastronomie'], description: 'Cuisine raffinée, produits locaux.' },
    { name: 'Pharmacie Sélestat', slug: 'pharmacie-selestat', address: '22 Avenue de la Liberté', city: 'Sélestat', postalCode: '67600', phone: '03 88 92 12 52', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie moderne, conseils experts.' },
    { name: 'Garage Volkswagen Sélestat', slug: 'garage-volkswagen-selestat', address: '35 Route de Colmar', city: 'Sélestat', postalCode: '67600', phone: '03 88 92 13 53', categories: ['Garage', 'Automobile'], description: 'Concessionnaire VW, service après-vente.' },
    { name: 'Institut Beauté Sélestat', slug: 'institut-beaute-selestat', address: '13 Rue des Chevaliers', city: 'Sélestat', postalCode: '67600', phone: '03 88 92 14 54', categories: ['Beauté', 'Esthétique'], description: 'Soins du visage et du corps.' },
  ],
  'wissembourg.pro': [
    { name: 'Boulangerie Wissembourg', slug: 'boulangerie-wissembourg', address: '18 Rue Nationale', city: 'Wissembourg', postalCode: '67160', phone: '03 88 94 10 60', categories: ['Boulangerie', 'Pâtisserie'], description: 'Boulangerie familiale depuis 1950.' },
    { name: 'Restaurant Au Cygne', slug: 'restaurant-au-cygne-wissembourg', address: '10 Place de la République', city: 'Wissembourg', postalCode: '67160', phone: '03 88 94 11 61', categories: ['Restaurant', 'Alsacien'], description: 'Cuisine alsacienne traditionnelle.' },
    { name: 'Pharmacie Wissembourg', slug: 'pharmacie-wissembourg', address: '24 Rue du Marché', city: 'Wissembourg', postalCode: '67160', phone: '03 88 94 12 62', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie de ville, service continu.' },
    { name: 'Garage Ford Wissembourg', slug: 'garage-ford-wissembourg', address: '40 Route de Strasbourg', city: 'Wissembourg', postalCode: '67160', phone: '03 88 94 13 63', categories: ['Garage', 'Automobile'], description: 'Agent Ford, entretien et vente.' },
    { name: 'Coiffure Wissembourg', slug: 'coiffure-wissembourg', address: '15 Rue de la Sous-Préfecture', city: 'Wissembourg', postalCode: '67160', phone: '03 88 94 14 64', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure mixte.' },
  ],
  'brumath.pro': [
    { name: 'Boulangerie Brumath', slug: 'boulangerie-brumath', address: '20 Grand Rue', city: 'Brumath', postalCode: '67170', phone: '03 88 51 10 70', categories: ['Boulangerie', 'Pâtisserie'], description: 'Boulangerie artisanale, pains spéciaux.' },
    { name: 'Restaurant Le Relais', slug: 'restaurant-le-relais-brumath', address: '12 Place de l\'Hôtel de Ville', city: 'Brumath', postalCode: '67170', phone: '03 88 51 11 71', categories: ['Restaurant', 'Brasserie'], description: 'Brasserie conviviale, plats du jour.' },
    { name: 'Pharmacie Brumath', slug: 'pharmacie-brumath', address: '26 Rue du Général Leclerc', city: 'Brumath', postalCode: '67170', phone: '03 88 51 12 72', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie de proximité.' },
    { name: 'Garage Opel Brumath', slug: 'garage-opel-brumath', address: '45 Route de Haguenau', city: 'Brumath', postalCode: '67170', phone: '03 88 51 13 73', categories: ['Garage', 'Automobile'], description: 'Concessionnaire Opel.' },
    { name: 'Salon Coiffure Brumath', slug: 'salon-coiffure-brumath', address: '17 Rue de la Gare', city: 'Brumath', postalCode: '67170', phone: '03 88 51 14 74', categories: ['Coiffure', 'Beauté'], description: 'Coiffure homme, femme, enfant.' },
  ],
  'erstein.pro': [
    { name: 'Boulangerie Erstein', slug: 'boulangerie-erstein', address: '22 Rue du Général de Gaulle', city: 'Erstein', postalCode: '67150', phone: '03 88 98 10 80', categories: ['Boulangerie', 'Pâtisserie'], description: 'Pains et viennoiseries fraîches.' },
    { name: 'Restaurant L\'Ill', slug: 'restaurant-l-ill-erstein', address: '14 Quai de l\'Ill', city: 'Erstein', postalCode: '67150', phone: '03 88 98 11 81', categories: ['Restaurant', 'Cuisine Française'], description: 'Restaurant au bord de l\'Ill.' },
    { name: 'Pharmacie Erstein', slug: 'pharmacie-erstein', address: '28 Place de la République', city: 'Erstein', postalCode: '67150', phone: '03 88 98 12 82', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie centrale.' },
    { name: 'Garage Nissan Erstein', slug: 'garage-nissan-erstein', address: '50 Route de Strasbourg', city: 'Erstein', postalCode: '67150', phone: '03 88 98 13 83', categories: ['Garage', 'Automobile'], description: 'Agent Nissan.' },
    { name: 'Coiffure Erstein', slug: 'coiffure-erstein', address: '19 Rue du Marché', city: 'Erstein', postalCode: '67150', phone: '03 88 98 14 84', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure moderne.' },
  ],
  'barr.pro': [
    { name: 'Boulangerie Barr', slug: 'boulangerie-barr', address: '24 Rue du Docteur Sultzer', city: 'Barr', postalCode: '67140', phone: '03 88 08 10 90', categories: ['Boulangerie', 'Pâtisserie'], description: 'Boulangerie traditionnelle.' },
    { name: 'Restaurant Au Raisin', slug: 'restaurant-au-raisin-barr', address: '16 Place de l\'Hôtel de Ville', city: 'Barr', postalCode: '67140', phone: '03 88 08 11 91', categories: ['Restaurant', 'Winstub'], description: 'Winstub alsacienne authentique.' },
    { name: 'Pharmacie Barr', slug: 'pharmacie-barr', address: '30 Rue de la Kirneck', city: 'Barr', postalCode: '67140', phone: '03 88 08 12 92', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie de quartier.' },
    { name: 'Garage Toyota Barr', slug: 'garage-toyota-barr', address: '55 Route de Strasbourg', city: 'Barr', postalCode: '67140', phone: '03 88 08 13 93', categories: ['Garage', 'Automobile'], description: 'Concessionnaire Toyota.' },
    { name: 'Coiffure Barr', slug: 'coiffure-barr', address: '21 Rue du Général Vandenberg', city: 'Barr', postalCode: '67140', phone: '03 88 08 14 94', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure familial.' },
  ],
  'mutzig.pro': [
    { name: 'Boulangerie Mutzig', slug: 'boulangerie-mutzig', address: '26 Rue du Général Leclerc', city: 'Mutzig', postalCode: '67190', phone: '03 88 38 20 00', categories: ['Boulangerie', 'Pâtisserie'], description: 'Pains et pâtisseries maison.' },
    { name: 'Restaurant La Brasserie', slug: 'restaurant-la-brasserie-mutzig', address: '18 Place de la Fontaine', city: 'Mutzig', postalCode: '67190', phone: '03 88 38 21 01', categories: ['Restaurant', 'Brasserie'], description: 'Brasserie traditionnelle.' },
    { name: 'Pharmacie Mutzig', slug: 'pharmacie-mutzig', address: '32 Rue de la Gare', city: 'Mutzig', postalCode: '67190', phone: '03 88 38 22 02', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie de ville.' },
    { name: 'Garage Seat Mutzig', slug: 'garage-seat-mutzig', address: '60 Route de Strasbourg', city: 'Mutzig', postalCode: '67190', phone: '03 88 38 23 03', categories: ['Garage', 'Automobile'], description: 'Agent Seat.' },
    { name: 'Coiffure Mutzig', slug: 'coiffure-mutzig', address: '23 Rue du Château', city: 'Mutzig', postalCode: '67190', phone: '03 88 38 24 04', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure.' },
  ],
  'schiltigheim.pro': [
    { name: 'Boulangerie Schiltigheim', slug: 'boulangerie-schiltigheim', address: '28 Route de Bischwiller', city: 'Schiltigheim', postalCode: '67300', phone: '03 88 83 10 10', categories: ['Boulangerie', 'Pâtisserie'], description: 'Boulangerie de quartier.' },
    { name: 'Restaurant Le Brasseur', slug: 'restaurant-le-brasseur-schiltigheim', address: '20 Rue de la Première Armée', city: 'Schiltigheim', postalCode: '67300', phone: '03 88 83 11 11', categories: ['Restaurant', 'Brasserie'], description: 'Brasserie artisanale.' },
    { name: 'Pharmacie Schiltigheim', slug: 'pharmacie-schiltigheim', address: '34 Avenue du Général de Gaulle', city: 'Schiltigheim', postalCode: '67300', phone: '03 88 83 12 12', categories: ['Pharmacie', 'Santé'], description: 'Pharmacie moderne.' },
    { name: 'Garage Skoda Schiltigheim', slug: 'garage-skoda-schiltigheim', address: '65 Route de Haguenau', city: 'Schiltigheim', postalCode: '67300', phone: '03 88 83 13 13', categories: ['Garage', 'Automobile'], description: 'Concessionnaire Skoda.' },
    { name: 'Coiffure Schiltigheim', slug: 'coiffure-schiltigheim', address: '25 Rue de la Mairie', city: 'Schiltigheim', postalCode: '67300', phone: '03 88 83 14 14', categories: ['Coiffure', 'Beauté'], description: 'Salon de coiffure moderne.' },
  ],
};

async function main() {
  console.log('🌱 Seeding all domains...\n');

  for (const [domainName, companies] of Object.entries(domainCompanies)) {
    console.log(`📍 Processing ${domainName}...`);
    
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
    });

    if (!domain) {
      console.error(`  ❌ Domain ${domainName} not found`);
      continue;
    }

    let created = 0;

    for (const companyData of companies) {
      const company = await prisma.company.upsert({
        where: { slug: companyData.slug },
        update: {},
        create: {
          name: companyData.name,
          slug: companyData.slug,
          address: companyData.address,
          city: companyData.city,
          postalCode: companyData.postalCode,
          phone: companyData.phone,
          categories: companyData.categories,
        },
      });

      await prisma.companyContent.upsert({
        where: {
          companyId_domainId: {
            companyId: company.id,
            domainId: domain.id,
          },
        },
        update: {},
        create: {
          companyId: company.id,
          domainId: domain.id,
          customDescription: companyData.description,
          isVisible: true,
        },
      });

      created++;
    }

    console.log(`  ✅ ${created} companies created for ${domainName}\n`);
  }

  console.log('✅ All domains seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
