import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;
  
  // Redirect to /annuaire with same query parameters
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  });
  
  const queryString = urlParams.toString();
  redirect(`/annuaire${queryString ? `?${queryString}` : ''}`);
}

