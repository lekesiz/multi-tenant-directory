export const categoryIcons: Record<string, string> = {
  // Google Places (English)
  establishment: '🏢',
  point_of_interest: '📍',
  general_contractor: '🏗️',
  food: '🍽️',
  home_goods_store: '🏠',
  electronics_store: '📱',
  furniture_store: '🛋️',
  car_repair: '🔧',
  painter: '🎨',
  health: '🏥',
  store: '🏪',
  bakery: '🥖',
  electrician: '⚡',
  
  // Alimentation
  Restaurant: '🍽️',
  Boulangerie: '🥖',
  Pâtisserie: '🍰',
  Pizzeria: '🍕',
  Café: '☕',
  Bar: '🍺',
  Boucherie: '🥩',
  Traiteur: '🍱',
  Épicerie: '🏪',
  Supermarché: '🛒',
  
  // Santé
  Pharmacie: '💊',
  Médecin: '🩺',
  Dentiste: '🦷',
  Kinésithérapie: '🏥',
  Vétérinaire: '🐾',
  Optique: '👓',
  
  // Services
  Garage: '🚗',
  Coiffure: '💇',
  Beauté: '💄',
  Fleuriste: '🌸',
  Plomberie: '🔧',
  Électricité: '⚡',
  Menuiserie: '🪚',
  Peinture: '🎨',
  
  // Commerce
  Immobilier: '🏠',
  Banque: '🏦',
  Librairie: '📚',
  Bijouterie: '💍',
  Mode: '👗',
  Chaussures: '👞',
  
  // Informatique
  Informatique: '💻',
  'Agence Web': '🌐',
  Développement: '👨‍💻',
  
  // Loisirs
  Sport: '⚽',
  Fitness: '💪',
  Yoga: '🧘',
  Musique: '🎵',
  Photographie: '📷',
  
  // Éducation
  École: '🎒',
  Formation: '🎓',
  Crèche: '👶',
  
  // Autres
  Hôtel: '🏨',
  Transport: '🚚',
  Nettoyage: '🧹',
  Jardinage: '🌳',
  Assurance: '🛡️',
  Avocat: '⚖️',
  Notaire: '📜',
  Comptabilité: '🧮',
};

export function getCategoryIcon(categoryName: string): string {
  return categoryIcons[categoryName] || '📍';
}

