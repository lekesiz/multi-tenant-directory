import { NextResponse } from 'next/server';

// Mobile app configuration and version check
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform'); // 'ios' or 'android'
    const currentVersion = searchParams.get('version');

    // Define app configuration
    const config = {
      // API Configuration
      api: {
        baseUrl: process.env.NEXTAUTH_URL || 'https://haguenau.pro',
        version: 'v1',
        timeout: 30000,
      },
      
      // App versions and update requirements
      versions: {
        ios: {
          latest: '1.0.0',
          minimum: '1.0.0',
          downloadUrl: 'https://apps.apple.com/app/haguenau-pro',
        },
        android: {
          latest: '1.0.0',
          minimum: '1.0.0',
          downloadUrl: 'https://play.google.com/store/apps/details?id=com.haguenau.pro',
        },
      },
      
      // Feature flags
      features: {
        pushNotifications: true,
        analytics: true,
        socialSharing: true,
        couponSystem: true,
        referralProgram: true,
        aiFeatures: true,
        darkMode: true,
        biometricAuth: platform === 'ios', // iOS only for now
      },
      
      // UI Configuration
      ui: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        errorColor: '#EF4444',
        warningColor: '#F59E0B',
        successColor: '#10B981',
        
        // Animation settings
        animations: {
          enabled: true,
          duration: 300,
        },
        
        // Cache settings
        cache: {
          profileTtl: 300000, // 5 minutes
          analyticsTtl: 600000, // 10 minutes
          companiesTtl: 900000, // 15 minutes
        },
      },
      
      // External services
      services: {
        firebase: {
          enabled: true,
          projectId: process.env.FIREBASE_PROJECT_ID || 'haguenau-pro',
        },
        stripe: {
          enabled: true,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        },
        sentry: {
          enabled: process.env.NODE_ENV === 'production',
          dsn: process.env.SENTRY_DSN,
        },
        analytics: {
          enabled: true,
          trackingId: process.env.GOOGLE_ANALYTICS_ID,
        },
      },
      
      // Content and messaging
      messages: {
        updateRequired: 'Une mise à jour est requise pour continuer à utiliser l\'application.',
        updateAvailable: 'Une nouvelle version est disponible avec des améliorations et corrections.',
        maintenanceMode: 'L\'application est temporairement en maintenance. Veuillez réessayer plus tard.',
        networkError: 'Vérifiez votre connexion internet et réessayez.',
      },
      
      // App limits and quotas
      limits: {
        maxPhotosPerCompany: 20,
        maxCompaniesPerUser: 5,
        maxNotificationsPerDay: 50,
        maxApiRequestsPerMinute: 100,
      },
      
      // Support and contact
      support: {
        email: 'support@haguenau.pro',
        phone: '+33 1 23 45 67 89',
        website: 'https://haguenau.pro/support',
        faq: 'https://haguenau.pro/faq',
      },
    };

    // Check if update is required
    let updateStatus = 'none';
    if (platform && currentVersion) {
      const platformConfig = config.versions[platform as keyof typeof config.versions];
      if (platformConfig) {
        if (isVersionOlder(currentVersion, platformConfig.minimum)) {
          updateStatus = 'required';
        } else if (isVersionOlder(currentVersion, platformConfig.latest)) {
          updateStatus = 'available';
        }
      }
    }

    return NextResponse.json({
      success: true,
      config,
      updateStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Mobile config error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la configuration' },
      { status: 500 }
    );
  }
}

// Helper function to compare versions
function isVersionOlder(current: string, target: string): boolean {
  const currentParts = current.split('.').map(Number);
  const targetParts = target.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, targetParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const targetPart = targetParts[i] || 0;
    
    if (currentPart < targetPart) return true;
    if (currentPart > targetPart) return false;
  }
  
  return false;
}