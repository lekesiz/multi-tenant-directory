import { NextRequest, NextResponse } from 'next/server';

// Google Places API Text Search
// NOT: Bu endpoint Google Places API kullanır. API key gereklidir.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Google Places API Text Search
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: `Google API error: ${data.status}` },
        { status: 500 }
      );
    }

    // Sonuçları basitleştir
    const results = data.results.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      location: place.geometry?.location,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching Google Places:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

