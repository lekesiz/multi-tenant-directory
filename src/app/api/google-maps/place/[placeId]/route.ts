import { NextRequest, NextResponse } from 'next/server';

// Google Places API Place Details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  try {
    const { placeId } = await params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Google Places API Place Details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,geometry,rating,user_ratings_total,reviews,opening_hours,photos,types,address_components&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Google API error: ${data.status}` },
        { status: 500 }
      );
    }

    const place = data.result;

    // Adres bileşenlerinden şehir ve posta kodu çıkar
    const addressComponents = place.address_components || [];
    const city =
      addressComponents.find((c: any) => c.types.includes('locality'))
        ?.long_name || '';
    const postalCode =
      addressComponents.find((c: any) => c.types.includes('postal_code'))
        ?.long_name || '';

    // Yorumları formatla
    const reviews = (place.reviews || []).map((review: any) => ({
      id: review.time.toString() + review.author_name.replace(/\s/g, ''),
      authorName: review.author_name,
      authorPhoto: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
      reviewTime: new Date(review.time * 1000).toISOString(),
    }));

    // Fotoğrafları formatla
    const photos = (place.photos || []).slice(0, 5).map((photo: any) => ({
      reference: photo.photo_reference,
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`,
    }));

    const result = {
      placeId: placeId,
      name: place.name,
      address: place.formatted_address,
      city,
      postalCode,
      phone: place.formatted_phone_number,
      website: place.website,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      categories: place.types || [],
      businessHours: place.opening_hours?.weekday_text || [],
      reviews,
      photos,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

