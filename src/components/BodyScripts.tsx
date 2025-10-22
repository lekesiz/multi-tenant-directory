import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function getDomainSettings() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const domain = host.split(':')[0];

    const domainData = await prisma.domain.findFirst({
      where: {
        name: domain,
        isActive: true,
      },
      select: {
        settings: true,
      },
    });

    return (domainData?.settings as any)?.seo || {};
  } catch (error) {
    console.error('Error fetching domain settings:', error);
    return {};
  }
}

export default async function BodyScripts() {
  const settings = await getDomainSettings();

  return (
    <>
      {/* Google Tag Manager - Body (noscript) */}
      {settings.googleTagManagerId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}

      {/* Custom Body Scripts */}
      {settings.customBodyScripts && (
        <div dangerouslySetInnerHTML={{ __html: settings.customBodyScripts }} />
      )}
    </>
  );
}

