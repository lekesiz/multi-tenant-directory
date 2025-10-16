import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

async function syncGoogleReviews() {
  try {
    // Get Netz Informatique company
    const company = await prisma.company.findUnique({
      where: { id: 111 },
      select: {
        id: true,
        name: true,
        googlePlaceId: true,
        rating: true,
        reviewCount: true
      }
    });

    if (!company) {
      console.log('❌ Şirket bulunamadı!');
      return;
    }

    console.log('📍 Şirket:', company.name);
    console.log('🔑 Google Place ID:', company.googlePlaceId);

    if (!company.googlePlaceId) {
      console.log('❌ Google Place ID yok!');
      return;
    }

    // Fetch place details from Google
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${company.googlePlaceId}&fields=rating,user_ratings_total,reviews&key=${GOOGLE_MAPS_API_KEY}`;

    console.log('🌐 Google Maps API çağrılıyor...');
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.log('❌ Google API Error:', data.status);
      console.log('Error message:', data.error_message || 'No details');
      console.log('Full response:', JSON.stringify(data, null, 2));
      return;
    }

    const place = data.result;
    const googleReviews = place.reviews || [];

    console.log('\n📊 Google Maps Bilgileri:');
    console.log('⭐ Rating:', place.rating);
    console.log('📈 Total Reviews:', place.user_ratings_total);
    console.log('💬 Reviews Found:', googleReviews.length);

    // Update company rating
    await prisma.company.update({
      where: { id: 111 },
      data: {
        rating: place.rating || null,
        reviewCount: place.user_ratings_total || 0,
      },
    });

    console.log('\n✅ Şirket rating güncellendi');

    // Delete existing Google reviews
    const deleted = await prisma.review.deleteMany({
      where: {
        companyId: 111,
        source: 'google',
      },
    });

    console.log(`🗑️  Eski ${deleted.count} Google yorumu silindi`);

    // Create new reviews
    console.log('\n💬 Yorumlar ekleniyor...');
    let createdCount = 0;
    for (const review of googleReviews) {
      await prisma.review.create({
        data: {
          companyId: 111,
          authorName: review.author_name,
          authorPhoto: review.profile_photo_url || null,
          rating: review.rating,
          comment: review.text || '',
          source: 'google',
          reviewDate: new Date(review.time * 1000),
        },
      });
      createdCount++;
      const truncatedComment = (review.text || 'Yorum yok').substring(0, 60);
      console.log(`  ${createdCount}. ${review.author_name} - ⭐${review.rating}/5`);
      console.log(`     "${truncatedComment}${review.text?.length > 60 ? '...' : ''}"`);
    }

    console.log(`\n✅ BAŞARILI: ${createdCount} yorum senkronize edildi!`);
    console.log(`\n🔗 İşletmeyi görüntüle: https://haguenau.pro/companies/netzinformatique`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Hata:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

syncGoogleReviews();
