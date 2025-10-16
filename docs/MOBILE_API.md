# 📱 Mobile API Documentation - React Native Integration

## 🔧 API Endpoints pour Mobile App

### 🔐 Authentication

#### POST `/api/mobile/auth/login`
Connexion utilisateur mobile

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "deviceId": "unique-device-id",
  "deviceType": "ios", // ou "android"
  "fcmToken": "firebase-messaging-token"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "companies": [...],
    "subscriptionTier": "premium"
  },
  "expiresIn": 2592000
}
```

#### POST `/api/mobile/auth/refresh`
Refresh du token JWT

### 👤 Profile Management

#### GET `/api/mobile/profile`
Récupération du profil utilisateur

**Headers:**
```
Authorization: Bearer jwt-token
```

#### PUT `/api/mobile/profile`
Mise à jour du profil

### 🏢 Company Management

#### GET `/api/mobile/companies/{companyId}`
Détails complets d'une entreprise

**Response inclut:**
- Informations de base
- Analytics des 30 derniers jours
- Avis récents
- Horaires d'ouverture
- Photos
- Coupons actifs

### 📊 Analytics

#### GET `/api/mobile/analytics/{companyId}?period=30`
Analytics détaillées pour une entreprise

**Query Parameters:**
- `period`: 7, 30, ou 90 jours

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalViews": 1250,
    "totalClicks": 89,
    "conversionRate": 7.12,
    "trends": {
      "views": 15.5,
      "clicks": -2.3
    }
  },
  "dailyData": [...],
  "actionBreakdown": {...}
}
```

### 🔔 Notifications

#### POST `/api/mobile/notifications/send`
Envoi de notifications push

### ⚙️ Configuration

#### GET `/api/mobile/config?platform=ios&version=1.0.0`
Configuration de l'app et vérification des mises à jour

## 🏗️ React Native Implementation Guide

### 1. Installation des dépendances

```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-keychain
npm install @react-navigation/native @react-navigation/stack
npm install react-native-charts-wrapper
npm install react-native-image-picker
```

### 2. Structure de l'App

```
src/
├── api/
│   ├── auth.ts
│   ├── companies.ts
│   ├── analytics.ts
│   └── notifications.ts
├── components/
│   ├── CompanyCard.tsx
│   ├── AnalyticsChart.tsx
│   └── NotificationBell.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── CompanyDetailScreen.tsx
│   └── AnalyticsScreen.tsx
├── store/
│   ├── authSlice.ts
│   ├── companiesSlice.ts
│   └── index.ts
└── utils/
    ├── storage.ts
    ├── api.ts
    └── push-notifications.ts
```

### 3. API Client Setup

```typescript
// src/utils/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://haguenau.pro/api/mobile';

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(credentials: LoginCredentials) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request<ProfileResponse>('/profile');
  }

  async getCompany(companyId: string) {
    return this.request<CompanyResponse>(`/companies/${companyId}`);
  }

  async getAnalytics(companyId: string, period: number = 30) {
    return this.request<AnalyticsResponse>(`/analytics/${companyId}?period=${period}`);
  }
}

export const apiClient = new ApiClient();
```

### 4. Authentication Flow

```typescript
// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await apiClient.login(credentials);
    
    // Store token securely
    await AsyncStorage.setItem('auth_token', response.token);
    
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem('auth_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});
```

### 5. Push Notifications Setup

```typescript
// src/utils/push-notifications.ts
import messaging from '@react-native-firebase/messaging';
import { apiClient } from './api';

export class PushNotificationService {
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  setupNotificationListeners() {
    // Foreground message handler
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      // Show in-app notification
    });

    // Background/quit message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
    });

    // Notification opened handler
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened:', remoteMessage);
      // Navigate to specific screen based on notification data
    });
  }
}

export const pushNotificationService = new PushNotificationService();
```

### 6. Analytics Dashboard Component

```typescript
// src/components/AnalyticsChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';

interface AnalyticsChartProps {
  data: AnalyticsData[];
  period: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, period }) => {
  const chartData = {
    dataSets: [{
      values: data.map(item => ({ y: item.views, x: item.date })),
      label: 'Vues du profil',
      config: {
        color: '#3B82F6',
        lineWidth: 2,
      },
    }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics - {period} derniers jours</Text>
      <LineChart
        style={styles.chart}
        data={chartData}
        xAxis={{
          valueFormatter: 'date',
          granularityEnabled: true,
          granularity: 1,
        }}
        yAxis={{
          left: {
            axisMinimum: 0,
          },
          right: {
            enabled: false,
          },
        }}
        autoScaleMinMaxEnabled={true}
        animation={{
          durationX: 1000,
          durationY: 1000,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    flex: 1,
  },
});
```

## 🔧 Configuration et déploiement

### 1. Variables d'environnement

Créer `.env` dans le projet React Native:

```
API_BASE_URL=https://haguenau.pro/api/mobile
FIREBASE_PROJECT_ID=haguenau-pro
STRIPE_PUBLISHABLE_KEY=pk_test_...
SENTRY_DSN=https://...
```

### 2. Configuration Firebase

- Créer un projet Firebase
- Ajouter les apps iOS et Android
- Télécharger `google-services.json` (Android) et `GoogleService-Info.plist` (iOS)
- Configurer les notifications push

### 3. Configuration Sentry (Error Tracking)

```bash
npm install @sentry/react-native
```

### 4. Build et déploiement

```bash
# iOS
cd ios && pod install
npx react-native run-ios

# Android
npx react-native run-android

# Release builds
npx react-native build-ios --configuration Release
npx react-native build-android --variant=release
```

## 📱 Fonctionnalités Mobile Spécifiques

### 1. Authentification biométrique (iOS)

```typescript
import { TouchID, FaceID } from 'react-native-touch-id';

export const BiometricAuth = {
  async isSupported(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== false;
    } catch {
      return false;
    }
  },

  async authenticate(): Promise<boolean> {
    try {
      await TouchID.authenticate('Se connecter avec votre empreinte');
      return true;
    } catch {
      return false;
    }
  },
};
```

### 2. Mode hors-ligne

```typescript
import NetInfo from '@react-native-netinfo/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineManager {
  async cacheData(key: string, data: any): Promise<void> {
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }

  async getCachedData(key: string, maxAge: number = 300000): Promise<any> {
    const cached = await AsyncStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    return data;
  }

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected;
  }
}
```

### 3. Partage social

```typescript
import Share from 'react-native-share';

export const SocialShare = {
  async shareCompany(company: Company): Promise<void> {
    const options = {
      title: `Découvrez ${company.name}`,
      message: `Je recommande ${company.name} à ${company.city}`,
      url: `https://haguenau.pro/${company.slug}`,
    };

    try {
      await Share.open(options);
    } catch (error) {
      console.log('Share cancelled');
    }
  },
};
```

## 📊 Métriques et Analytics

L'API mobile fournit des analytics détaillées:

- **Vues de profil** - Trafic quotidien
- **Actions utilisateur** - Clics téléphone, site web, email, directions
- **Taux de conversion** - Pourcentage de vues qui génèrent des actions
- **Tendances** - Comparaison avec période précédente
- **Classement** - Jours les plus performants

## 🚀 Fonctionnalités avancées

### 1. Système de notifications intelligent
- Notifications push personnalisées
- Programmation de campagnes marketing
- Notifications de nouveaux avis
- Alertes de performance

### 2. Intégration IA
- Génération automatique de réponses aux avis
- Recommandations business intelligentes
- Optimisation SEO automatique
- Insights analytiques avancés

### 3. Système de parrainage
- Génération de codes de parrainage
- Suivi des conversions
- Récompenses automatiques
- Partage social intégré

Cette architecture mobile fournit une base solide pour une application React Native complète et performante.