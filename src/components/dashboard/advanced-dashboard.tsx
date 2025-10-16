/**
 * Advanced Dashboard Components
 * Real-time widgets, analytics, customizable layouts
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Widget Types
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: WidgetConfig;
  data?: any;
}

export type WidgetType = 
  | 'revenue-chart'
  | 'visitor-stats'
  | 'recent-orders'
  | 'conversion-funnel'
  | 'real-time-metrics'
  | 'booking-calendar'
  | 'review-sentiment'
  | 'traffic-sources'
  | 'performance-metrics'
  | 'goal-tracker';

export interface WidgetConfig {
  refreshInterval?: number; // seconds
  dateRange?: string;
  filters?: Record<string, any>;
  displayOptions?: Record<string, any>;
}

// Dashboard Layout Props
interface AdvancedDashboardProps {
  tenantId: string;
  userId: string;
  initialWidgets?: Widget[];
  canEditLayout?: boolean;
}

// Main Dashboard Component
export function AdvancedDashboard({ 
  tenantId, 
  userId, 
  initialWidgets = [], 
  canEditLayout = true 
}: AdvancedDashboardProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  // Real-time data updates
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    widgets.forEach(widget => {
      if (widget.config.refreshInterval) {
        const interval = setInterval(() => {
          refreshWidgetData(widget.id);
        }, widget.config.refreshInterval * 1000);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [widgets]);

  // Widget data refresh
  const refreshWidgetData = async (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    try {
      const response = await fetch(`/api/dashboard/widget-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          widgetType: widget.type,
          config: widget.config,
        }),
      });

      const data = await response.json();
      
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? { ...w, data } : w
      ));
    } catch (error) {
      console.error('Failed to refresh widget data:', error);
    }
  };

  // Drag and drop handler
  const handleDragEnd = (result: any) => {
    if (!result.destination || !isEditMode) return;

    const newWidgets = Array.from(widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    setWidgets(newWidgets);
    saveDashboardLayout(newWidgets);
  };

  // Save layout to backend
  const saveDashboardLayout = async (newWidgets: Widget[]) => {
    try {
      await fetch('/api/dashboard/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          widgets: newWidgets,
        }),
      });
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  };

  // Add new widget
  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: 'medium',
      position: { x: 0, y: 0 },
      config: getDefaultConfig(type),
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetPicker(false);
  };

  // Remove widget
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <DashboardHeader
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onShowWidgetPicker={() => setShowWidgetPicker(true)}
        canEdit={canEditLayout}
      />

      {/* Dashboard Grid */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {widgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${getWidgetSizeClass(widget.size)} ${
                          snapshot.isDragging ? 'opacity-75' : ''
                        } ${isEditMode ? 'ring-2 ring-blue-300' : ''}`}
                      >
                        <WidgetRenderer
                          widget={widget}
                          isEditMode={isEditMode}
                          onRemove={() => removeWidget(widget.id)}
                          onRefresh={() => refreshWidgetData(widget.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Widget Picker Modal */}
      <WidgetPickerModal
        isOpen={showWidgetPicker}
        onClose={() => setShowWidgetPicker(false)}
        onAddWidget={addWidget}
      />
    </div>
  );
}

// Dashboard Header Component
function DashboardHeader({
  isEditMode,
  onToggleEditMode,
  onShowWidgetPicker,
  canEdit,
}: {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onShowWidgetPicker: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aperçu de vos performances en temps réel
            </p>
          </div>

          {canEdit && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onShowWidgetPicker}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Ajouter Widget
              </button>

              <button
                onClick={onToggleEditMode}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isEditMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <CogIcon className="w-4 h-4 mr-2" />
                {isEditMode ? 'Terminer' : 'Modifier'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Widget Renderer Component
function WidgetRenderer({
  widget,
  isEditMode,
  onRemove,
  onRefresh,
}: {
  widget: Widget;
  isEditMode: boolean;
  onRemove: () => void;
  onRefresh: () => void;
}) {
  return (
    <motion.div
      layout
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      whileHover={isEditMode ? { scale: 1.02 } : {}}
    >
      {/* Widget Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {widget.title}
        </h3>
        
        {isEditMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onRemove}
              className="p-1 text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="p-4">
        <WidgetContent widget={widget} />
      </div>
    </motion.div>
  );
}

// Widget Content Renderer
function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'revenue-chart':
      return <RevenueChartWidget data={widget.data} />;
    case 'visitor-stats':
      return <VisitorStatsWidget data={widget.data} />;
    case 'recent-orders':
      return <RecentOrdersWidget data={widget.data} />;
    case 'real-time-metrics':
      return <RealTimeMetricsWidget data={widget.data} />;
    case 'booking-calendar':
      return <BookingCalendarWidget data={widget.data} />;
    case 'traffic-sources':
      return <TrafficSourcesWidget data={widget.data} />;
    default:
      return <div className="text-gray-500">Widget not implemented</div>;
  }
}

// Individual Widget Components
function RevenueChartWidget({ data }: { data?: any }) {
  const revenue = data?.revenue || 0;
  const growth = data?.growth || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(revenue)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chiffre d'affaires
          </p>
        </div>
        <div className={`flex items-center ${
          growth >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {growth >= 0 ? (
            <TrendingUpIcon className="w-5 h-5 mr-1" />
          ) : (
            <TrendingDownIcon className="w-5 h-5 mr-1" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Simple bar chart simulation */}
      <div className="h-20 flex items-end space-x-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-t"
            style={{
              height: `${Math.random() * 80 + 20}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function VisitorStatsWidget({ data }: { data?: any }) {
  const visitors = data?.visitors || 0;
  const pageViews = data?.pageViews || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {visitors.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Visiteurs</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {pageViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pages vues</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <DevicePhoneMobileIcon className="w-4 h-4 mr-1" />
          Mobile: 65%
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <GlobeAltIcon className="w-4 h-4 mr-1" />
          Desktop: 35%
        </div>
      </div>
    </div>
  );
}

function RecentOrdersWidget({ data }: { data?: any }) {
  const orders = data?.orders || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Commandes récentes
        </h4>
        <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        {orders.slice(0, 3).map((order: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                #{order.id || `ORD-${index + 1}`}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {order.customer || 'Client anonyme'}
              </p>
            </div>
            <span className="text-sm font-medium text-green-600">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(order.total || Math.random() * 100)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealTimeMetricsWidget({ data }: { data?: any }) {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    conversions: 0,
    revenue: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 5),
        revenue: Math.random() * 1000,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Temps réel
        </h4>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {realTimeData.activeUsers}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {realTimeData.conversions}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Conversions/5min</p>
        </div>
      </div>
    </div>
  );
}

function BookingCalendarWidget({ data }: { data?: any }) {
  const bookings = data?.bookings || [];
  const today = new Date();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Réservations du jour
        </h4>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        {bookings.slice(0, 3).map((booking: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {booking.service || 'Service'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {booking.time || `${9 + index}:00`}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              booking.status === 'confirmed' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            }`}>
              {booking.status || 'Confirmé'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficSourcesWidget({ data }: { data?: any }) {
  const sources = data?.sources || [
    { name: 'Google', percentage: 45, color: 'bg-blue-500' },
    { name: 'Direct', percentage: 30, color: 'bg-green-500' },
    { name: 'Social', percentage: 15, color: 'bg-purple-500' },
    { name: 'Autres', percentage: 10, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Sources de trafic
        </h4>
        <EyeIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${source.color}`} />
              <span className="text-sm text-gray-900 dark:text-white">
                {source.name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {source.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Widget Picker Modal
function WidgetPickerModal({
  isOpen,
  onClose,
  onAddWidget,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
}) {
  const availableWidgets: { type: WidgetType; title: string; description: string; icon: any }[] = [
    {
      type: 'revenue-chart',
      title: 'Graphique de revenus',
      description: 'Suivi du chiffre d\'affaires',
      icon: ChartBarIcon,
    },
    {
      type: 'visitor-stats',
      title: 'Statistiques visiteurs',
      description: 'Analyse du trafic web',
      icon: UserGroupIcon,
    },
    {
      type: 'recent-orders',
      title: 'Commandes récentes',
      description: 'Dernières transactions',
      icon: ShoppingBagIcon,
    },
    {
      type: 'real-time-metrics',
      title: 'Métriques temps réel',
      description: 'Données en direct',
      icon: TrendingUpIcon,
    },
    {
      type: 'booking-calendar',
      title: 'Calendrier réservations',
      description: 'Planning des RDV',
      icon: CalendarIcon,
    },
    {
      type: 'traffic-sources',
      title: 'Sources de trafic',
      description: 'Origine des visiteurs',
      icon: GlobeAltIcon,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Ajouter un widget
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => onAddWidget(widget.type)}
                className="flex items-start p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <widget.icon className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {widget.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {widget.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function getWidgetSizeClass(size: 'small' | 'medium' | 'large'): string {
  switch (size) {
    case 'small':
      return 'col-span-1';
    case 'large':
      return 'col-span-2 row-span-2';
    default:
      return 'col-span-1';
  }
}

function getWidgetTitle(type: WidgetType): string {
  const titles: Record<WidgetType, string> = {
    'revenue-chart': 'Graphique de revenus',
    'visitor-stats': 'Statistiques visiteurs',
    'recent-orders': 'Commandes récentes',
    'conversion-funnel': 'Entonnoir de conversion',
    'real-time-metrics': 'Métriques temps réel',
    'booking-calendar': 'Calendrier réservations',
    'review-sentiment': 'Sentiment des avis',
    'traffic-sources': 'Sources de trafic',
    'performance-metrics': 'Métriques de performance',
    'goal-tracker': 'Suivi des objectifs',
  };
  return titles[type];
}

function getDefaultConfig(type: WidgetType): WidgetConfig {
  return {
    refreshInterval: 30, // 30 seconds
    dateRange: '7d',
    filters: {},
    displayOptions: {},
  };
}