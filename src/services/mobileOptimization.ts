/**
 * Mobile Optimization Service
 * 
 * Provides utilities for detecting device capabilities, optimizing performance
 * for mobile devices, and managing responsive behavior across the application.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  networkType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export interface PerformanceMetrics {
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface MobileOptimizationConfig {
  enableLazyLoading: boolean;
  reduceAnimations: boolean;
  optimizeImages: boolean;
  enableOfflineMode: boolean;
  maxConcurrentRequests: number;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

class MobileOptimizationService {
  private deviceInfo: DeviceInfo;
  private performanceMetrics: PerformanceMetrics = {};
  private config: MobileOptimizationConfig;
  private resizeObserver: ResizeObserver | null = null;
  private orientationChangeListeners: ((orientation: 'portrait' | 'landscape') => void)[] = [];

  constructor() {
    this.deviceInfo = this.detectDeviceInfo();
    this.config = this.generateOptimizationConfig();
    this.initializePerformanceMonitoring();
    this.setupOrientationDetection();
  }

  /**
   * Detect current device information and capabilities
   */
  private detectDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth < 768,
      isTablet: /iPad|Android/i.test(userAgent) && screenWidth >= 768 && screenWidth < 1024,
      isDesktop: screenWidth >= 1024,
      screenWidth,
      screenHeight,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      touchSupported: 'ontouchstart' in window,
      networkType: this.getNetworkType(),
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    };
  }

  /**
   * Get network connection type if available
   */
  private getNetworkType(): string | undefined {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.type || connection?.effectiveType;
  }

  /**
   * Generate optimization configuration based on device capabilities
   */
  private generateOptimizationConfig(): MobileOptimizationConfig {
    const isMobile = this.deviceInfo.isMobile;
    const isLowEnd = Boolean((this.deviceInfo.deviceMemory && this.deviceInfo.deviceMemory <= 2) || 
                     (this.deviceInfo.hardwareConcurrency && this.deviceInfo.hardwareConcurrency <= 2));

    return {
      enableLazyLoading: isMobile || isLowEnd,
      reduceAnimations: isMobile || isLowEnd,
      optimizeImages: isMobile,
      enableOfflineMode: isMobile,
      maxConcurrentRequests: isLowEnd ? 2 : isMobile ? 4 : 8,
      cacheStrategy: isLowEnd ? 'minimal' : isMobile ? 'moderate' : 'aggressive'
    };
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Monitor memory usage if available
    if ('memory' in performance) {
      this.performanceMetrics.memoryUsage = (performance as any).memory;
    }

    // Monitor network information if available
    const connection = (navigator as any).connection;
    if (connection) {
      this.performanceMetrics.connectionType = connection.type;
      this.performanceMetrics.effectiveType = connection.effectiveType;
      this.performanceMetrics.downlink = connection.downlink;
      this.performanceMetrics.rtt = connection.rtt;

      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.performanceMetrics.effectiveType = connection.effectiveType;
        this.performanceMetrics.downlink = connection.downlink;
        this.performanceMetrics.rtt = connection.rtt;
        this.updateOptimizationConfig();
      });
    }
  }

  /**
   * Setup orientation change detection
   */
  private setupOrientationDetection(): void {
    const handleOrientationChange = () => {
      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      if (newOrientation !== this.deviceInfo.orientation) {
        this.deviceInfo.orientation = newOrientation;
        this.deviceInfo.screenWidth = window.innerWidth;
        this.deviceInfo.screenHeight = window.innerHeight;
        
        this.orientationChangeListeners.forEach(listener => {
          listener(newOrientation);
        });
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }

  /**
   * Update optimization configuration based on current performance
   */
  private updateOptimizationConfig(): void {
    const isSlowConnection = this.performanceMetrics.effectiveType === 'slow-2g' || 
                           this.performanceMetrics.effectiveType === '2g';
    
    if (isSlowConnection) {
      this.config.enableLazyLoading = true;
      this.config.reduceAnimations = true;
      this.config.optimizeImages = true;
      this.config.maxConcurrentRequests = 1;
      this.config.cacheStrategy = 'aggressive';
    }
  }

  /**
   * Get current device information
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get current optimization configuration
   */
  getOptimizationConfig(): MobileOptimizationConfig {
    return { ...this.config };
  }

  /**
   * Check if device should use mobile layout
   */
  shouldUseMobileLayout(): boolean {
    return this.deviceInfo.isMobile || this.deviceInfo.screenWidth < 768;
  }

  /**
   * Check if device supports advanced features
   */
  supportsAdvancedFeatures(): boolean {
    return !this.deviceInfo.isMobile || 
           Boolean((this.deviceInfo.deviceMemory && this.deviceInfo.deviceMemory > 2) ||
           (this.deviceInfo.hardwareConcurrency && this.deviceInfo.hardwareConcurrency > 2));
  }

  /**
   * Get recommended component lazy loading threshold
   */
  getLazyLoadingThreshold(): number {
    if (this.config.enableLazyLoading) {
      return this.deviceInfo.isMobile ? 200 : 400;
    }
    return 0;
  }

  /**
   * Get recommended animation duration multiplier
   */
  getAnimationDurationMultiplier(): number {
    if (this.config.reduceAnimations) {
      return 0.5; // Reduce animations by half
    }
    return 1;
  }

  /**
   * Listen for orientation changes
   */
  onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void): () => void {
    this.orientationChangeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.orientationChangeListeners.indexOf(callback);
      if (index > -1) {
        this.orientationChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Optimize image source based on device capabilities
   */
  optimizeImageSrc(baseSrc: string, width: number, height: number): string {
    if (!this.config.optimizeImages) {
      return baseSrc;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    const optimizedWidth = Math.round(width * pixelRatio);
    const optimizedHeight = Math.round(height * pixelRatio);

    // Add optimization parameters (this would work with a image optimization service)
    const url = new URL(baseSrc);
    url.searchParams.set('w', optimizedWidth.toString());
    url.searchParams.set('h', optimizedHeight.toString());
    url.searchParams.set('q', this.deviceInfo.isMobile ? '75' : '85');
    url.searchParams.set('f', 'webp');

    return url.toString();
  }

  /**
   * Debounce function optimized for mobile devices
   */
  debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    const optimizedWait = this.deviceInfo.isMobile ? Math.max(wait, 16) : wait; // Minimum 16ms on mobile
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), optimizedWait);
    }) as T;
  }

  /**
   * Throttle function optimized for mobile devices
   */
  throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    const optimizedLimit = this.deviceInfo.isMobile ? Math.max(limit, 16) : limit; // Minimum 16ms on mobile
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), optimizedLimit);
      }
    }) as T;
  }

  /**
   * Check if device is in low power mode (iOS Safari)
   */
  isLowPowerMode(): boolean {
    // This is a heuristic check - iOS Safari in low power mode has reduced performance
    if (this.deviceInfo.isMobile && /Safari/i.test(navigator.userAgent)) {
      return this.performanceMetrics.effectiveType === 'slow-2g' || 
             this.performanceMetrics.effectiveType === '2g';
    }
    return false;
  }

  /**
   * Get viewport safe area for mobile devices with notches
   */
  getViewportSafeArea(): { top: number; bottom: number; left: number; right: number } {
    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.orientationChangeListeners = [];
  }
}

// Create singleton instance
export const mobileOptimizationService = new MobileOptimizationService();

// Export service
export default mobileOptimizationService;