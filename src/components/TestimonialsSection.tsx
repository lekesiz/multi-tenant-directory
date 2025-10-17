'use client';

import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  type: 'customer' | 'business';
}

const testimonials: Testimonial[] = [
  {
    name: 'Marie Dupont',
    role: 'Client',
    content:
      'Grâce à cette plateforme, j\'ai trouvé un excellent plombier. Les avis étaient fiables et le service vraiment professionnel. Je recommande!',
    rating: 5,
    image: '👩‍💼',
    type: 'customer',
  },
  {
    name: 'Jean Pierre Leclerc',
    role: 'Restaurant "Le Gourmet"',
    content:
      'Depuis que je suis sur la plateforme, j\'ai vu augmenter mon nombre de réservations de 40%. Les clients apprécient la transparence des avis.',
    rating: 5,
    image: '👨‍🍳',
    type: 'business',
  },
  {
    name: 'Sophie Martin',
    role: 'Cliente',
    content:
      'C\'est devenu mon application de référence pour trouver des services. Simple, rapide et les évaluations me font confiance.',
    rating: 5,
    image: '👩‍🎨',
    type: 'customer',
  },
  {
    name: 'Thomas Weber',
    role: 'Salon de Coiffure "Styles"',
    content:
      'La plateforme m\'a aidé à développer mon activité. Les clients qui me trouvent ici sont de qualité. Un vrai changement!',
    rating: 5,
    image: '💇',
    type: 'business',
  },
  {
    name: 'Isabelle Rousseau',
    role: 'Cliente',
    content:
      'Je fais confiance aux avis vérifiés. Plus besoin de chercher pendant des heures, tout est à portée de main.',
    rating: 5,
    image: '👵',
    type: 'customer',
  },
  {
    name: 'Marc Durand',
    role: 'Garage "Mécanique Pro"',
    content:
      'L\'annonce mise en avant a vraiment changé la donne pour mon garage. Plus de visibilité, plus de clients. Très satisfait!',
    rating: 5,
    image: '👨‍🔧',
    type: 'business',
  },
];

export default function TestimonialsSection() {
  const customerTestimonials = testimonials.filter((t) => t.type === 'customer');
  const businessTestimonials = testimonials.filter((t) => t.type === 'business');

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Ce que Disent Nos Utilisateurs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment la plateforme aide les clients et les professionnels
          </p>
        </div>

        {/* Customers Testimonials */}
        <div className="mb-20 lg:mb-32">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            💬 Avis des Clients
          </h3>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {customerTestimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-8 hover:shadow-lg transition-shadow"
              >
                {/* Quote Icon */}
                <Quote className="h-6 w-6 text-blue-600 mb-4 opacity-60" />

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="border-t border-blue-200 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Testimonials */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            🚀 Succès des Professionnels
          </h3>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {businessTestimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-8 hover:shadow-lg transition-shadow"
              >
                {/* Quote Icon */}
                <Quote className="h-6 w-6 text-purple-600 mb-4 opacity-60" />

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="border-t border-purple-200 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 lg:mt-32 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 grid gap-8 md:grid-cols-3 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">4.8/5</div>
            <p className="text-blue-100">Note Moyenne</p>
            <p className="text-sm text-blue-200 mt-2">Basée sur 50K+ avis</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <p className="text-blue-100">Satisfaction</p>
            <p className="text-sm text-blue-200 mt-2">Des utilisateurs recommandent</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">+40%</div>
            <p className="text-blue-100">Croissance</p>
            <p className="text-sm text-blue-200 mt-2">Moyenne pour les professionnels</p>
          </div>
        </div>
      </div>
    </section>
  );
}
