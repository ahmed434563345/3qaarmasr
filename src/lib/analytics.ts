// Google Analytics integration
// Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-HXF64LRQPP';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date() as any);
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag === 'undefined') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track property views
export const trackPropertyView = (propertyId: string, propertyTitle: string) => {
  trackEvent('view_property', 'Properties', propertyTitle);
};

// Track lead submissions
export const trackLeadSubmission = (location: string) => {
  trackEvent('submit_lead', 'Leads', location);
};

// Track property searches
export const trackPropertySearch = (searchTerm: string) => {
  trackEvent('search', 'Properties', searchTerm);
};

// Track user registration
export const trackUserRegistration = (method: string) => {
  trackEvent('sign_up', 'User', method);
};

// Track user login
export const trackUserLogin = (method: string) => {
  trackEvent('login', 'User', method);
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('click', 'Button', `${buttonName} - ${location}`);
};

// Track form submissions
export const trackFormSubmission = (formName: string) => {
  trackEvent('submit_form', 'Form', formName);
};

// Track navigation
export const trackNavigation = (destination: string) => {
  trackEvent('navigate', 'Navigation', destination);
};

// Track property contact
export const trackPropertyContact = (propertyId: string, contactMethod: string) => {
  trackEvent('contact', 'Properties', `${propertyId} - ${contactMethod}`);
};

// Track wishlist actions
export const trackWishlistAction = (action: 'add' | 'remove', propertyId: string) => {
  trackEvent(`wishlist_${action}`, 'Wishlist', propertyId);
};

// Track appointment bookings
export const trackAppointmentBooking = (propertyId: string) => {
  trackEvent('book_appointment', 'Appointments', propertyId);
};

// Track property filtering
export const trackPropertyFilter = (filterType: string, filterValue: string) => {
  trackEvent('filter', 'Properties', `${filterType}: ${filterValue}`);
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent('scroll', 'Engagement', `${depth}%`);
};

// Track time on page
export const trackTimeOnPage = (pageName: string, seconds: number) => {
  trackEvent('time_on_page', 'Engagement', pageName, seconds);
};

// Track user interactions
export const trackUserInteraction = (interactionType: string, details: string) => {
  trackEvent('interaction', 'User', `${interactionType} - ${details}`);
};