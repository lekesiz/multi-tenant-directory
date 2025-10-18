import { redirect } from 'next/navigation';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Redirect to /annuaire with same query parameters
  const params = new URLSearchParams();
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  });
  
  const queryString = params.toString();
  redirect(`/annuaire${queryString ? `?${queryString}` : ''}`);
}
