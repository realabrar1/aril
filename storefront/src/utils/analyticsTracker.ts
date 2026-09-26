'use client';

/**
 * ARILHA Storefront Production Customer Analytics Tracker
 * Non-blocking, privacy-conscious, asynchronous tracking system.
 */

export interface AnalyticsPageViewData {
  page_url: string;
  route_name?: string;
  page_title?: string;
  page_type?: 'homepage' | 'product' | 'collection' | 'category' | 'search' | 'cart' | 'checkout' | 'account' | 'static' | 'other';
  product_id?: number;
  collection_id?: number;
  category_id?: number;
  active_time_seconds?: number;
  max_scroll_percentage?: number;
}

export interface AnalyticsEventData {
  event_name: 'product_view' | 'product_image_view' | 'variant_select' | 'color_select' | 'size_select' | 'add_to_cart' | 'remove_from_cart' | 'wishlist_add' | 'wishlist_remove' | 'buy_now' | 'product_share' | 'review_view' | 'review_submit' | 'begin_checkout' | 'purchase';
  page_url?: string;
  product_id?: number;
  collection_id?: number;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private apiBaseUrl: string;
  private visitorId: string = '';
  private sessionId: string = '';
  private activeTimeSeconds: number = 0;
  private maxScrollPercentage: number = 0;
  private startTime: number = Date.now();
  private timerInterval: any = null;
  private currentPath: string = '';

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
    if (typeof window !== 'undefined') {
      this.visitorId = this.getOrCreateVisitorId();
      this.sessionId = this.getOrCreateSessionId();
      this.setupEngagementListeners();
    }
  }

  private getOrCreateVisitorId(): string {
    let vid = localStorage.getItem('arilha_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('arilha_visitor_id', vid);
    }
    return vid;
  }

  private getOrCreateSessionId(): string {
    let sid = sessionStorage.getItem('arilha_session_id');
    let lastActive = sessionStorage.getItem('arilha_session_last');
    const now = Date.now();

    // Reset session if inactive for more than 30 minutes (1800000 ms)
    if (!sid || (lastActive && now - parseInt(lastActive, 10) > 1800000)) {
      sid = 's_' + Math.random().toString(36).substring(2, 15) + now.toString(36);
      sessionStorage.setItem('arilha_session_id', sid);
    }
    sessionStorage.setItem('arilha_session_last', now.toString());
    return sid;
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'Desktop';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  private getBrowser(): string {
    if (typeof window === 'undefined') return 'Browser';
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Trident')) return 'IE';
    if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Browser';
  }

  private getOS(): string {
    if (typeof window === 'undefined') return 'OS';
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'OS';
  }

  private getTrafficSource(): string {
    if (typeof window === 'undefined') return 'Direct';
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    if (utmSource) return utmSource;

    const ref = document.referrer;
    if (!ref) return 'Direct';
    if (ref.includes('google.')) return 'Organic Search (Google)';
    if (ref.includes('instagram.')) return 'Social (Instagram)';
    if (ref.includes('facebook.')) return 'Social (Facebook)';
    if (ref.includes('pinterest.')) return 'Social (Pinterest)';
    if (ref.includes('t.co') || ref.includes('twitter.')) return 'Social (Twitter/X)';
    if (ref.includes('youtube.')) return 'Social (YouTube)';
    return 'Referral';
  }

  private getUTMParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || '',
    };
  }

  private setupEngagementListeners(): void {
    // Reset counters on page switch
    this.activeTimeSeconds = 0;
    this.maxScrollPercentage = 0;

    // Track scroll milestones (25%, 50%, 75%, 90%, 100%)
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
        if (scrollPercent > this.maxScrollPercentage) {
          this.maxScrollPercentage = scrollPercent;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Active time tracking using visibilityState
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.activeTimeSeconds += 1;
        sessionStorage.setItem('arilha_session_last', Date.now().toString());
      }
    }, 1000);
  }

  public determinePageType(pathname: string): 'homepage' | 'product' | 'collection' | 'category' | 'search' | 'cart' | 'checkout' | 'account' | 'static' | 'other' {
    if (pathname === '/' || pathname === '') return 'homepage';
    if (pathname.startsWith('/product/')) return 'product';
    if (pathname.startsWith('/collections') || pathname.startsWith('/collection/')) return 'collection';
    if (pathname.startsWith('/category/') || pathname.startsWith('/women')) return 'category';
    if (pathname.startsWith('/search')) return 'search';
    if (pathname === '/cart') return 'cart';
    if (pathname.startsWith('/checkout')) return 'checkout';
    if (pathname.startsWith('/account')) return 'account';
    if (['/about', '/contact', '/privacy', '/terms', '/shipping-policy', '/return-policy', '/faq'].includes(pathname)) return 'static';
    return 'other';
  }

  public async trackPageView(data: AnalyticsPageViewData): Promise<void> {
    if (typeof window === 'undefined') return;

    this.currentPath = data.page_url;
    this.setupEngagementListeners();

    const utm = this.getUTMParams();

    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      page_url: data.page_url,
      route_name: data.route_name || data.page_url,
      page_title: data.page_title || document.title,
      page_type: data.page_type || this.determinePageType(data.page_url),
      product_id: data.product_id || null,
      collection_id: data.collection_id || null,
      category_id: data.category_id || null,
      referrer_url: document.referrer || null,
      landing_page: sessionStorage.getItem('arilha_landing_page') || data.page_url,
      traffic_source: this.getTrafficSource(),
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_term: utm.utm_term,
      utm_content: utm.utm_content,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
      active_time_seconds: this.activeTimeSeconds,
      max_scroll_percentage: this.maxScrollPercentage,
    };

    if (!sessionStorage.getItem('arilha_landing_page')) {
      sessionStorage.setItem('arilha_landing_page', data.page_url);
    }

    try {
      fetch(`${this.apiBaseUrl}/analytics/track-pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (err) {}
  }

  public async trackEvent(data: AnalyticsEventData): Promise<void> {
    if (typeof window === 'undefined') return;

    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      event_name: data.event_name,
      page_url: data.page_url || window.location.pathname,
      product_id: data.product_id || null,
      collection_id: data.collection_id || null,
      metadata: data.metadata || null,
    };

    try {
      fetch(`${this.apiBaseUrl}/analytics/track-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (err) {}
  }

  public async trackSearch(query: string, resultsCount: number, clickedProductId?: number): Promise<void> {
    if (typeof window === 'undefined' || !query) return;

    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      search_query: query,
      results_count: resultsCount,
      clicked_product_id: clickedProductId || null,
    };

    try {
      fetch(`${this.apiBaseUrl}/analytics/track-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (err) {}
  }
}

export const analyticsTracker = new AnalyticsTracker();
