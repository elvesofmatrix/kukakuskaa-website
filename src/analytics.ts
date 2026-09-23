export type AnalyticsConsentChoice = 'accepted' | 'necessary' | null;

type GtagCommand = 'js' | 'config' | 'event' | 'consent';
type GtagConsentAction = 'default' | 'update';
type GtagTarget = string | Date;
type GtagParams = Record<string, unknown>;
type GtagFunction = (command: GtagCommand, target: GtagTarget | GtagConsentAction, params?: GtagParams) => void;
type ConsentState = 'granted' | 'denied';
type AnalyticsEventName =
  | 'page_view'
  | 'contact_cta_click'
  | 'contact_method_click'
  | 'contact_form_start'
  | 'contact_submit_success'
  | 'project_film_play';
type AnalyticsParams = Record<string, string | undefined>;

const CONSENT_STORAGE_KEY = 'kukakuskaa_pro_cookie_consent';

let defaultsInitialized = false;
let analyticsEnabled = false;
let lastPageViewKey = '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

function sendGtagCommand(command: GtagCommand, target: GtagTarget | GtagConsentAction, params?: GtagParams) {
  window.gtag?.(command, target, params);
}

function consentFields(state: ConsentState) {
  return {
    analytics_storage: state,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
}

export function initializeAnalytics() {
  if (defaultsInitialized) {
    return;
  }

  defaultsInitialized = true;
}

export function getStoredConsentChoice(): AnalyticsConsentChoice {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'accepted' || stored === 'necessary' ? stored : null;
  } catch {
    return null;
  }
}

export function updateAnalyticsConsent(choice: AnalyticsConsentChoice) {
  initializeAnalytics();

  if (choice === 'accepted') {
    analyticsEnabled = true;
    sendGtagCommand('consent', 'update', consentFields('granted'));
    return;
  }

  analyticsEnabled = false;
  sendGtagCommand('consent', 'update', consentFields('denied'));
}

export function persistConsentChoice(choice: Exclude<AnalyticsConsentChoice, null>) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
}

export function canSendAnalytics() {
  return analyticsEnabled;
}

export function trackPageView(pagePath: string, pageLanguage: string) {
  const key = `${pagePath}:${pageLanguage}`;
  if (!canSendAnalytics() || key === lastPageViewKey) {
    return false;
  }

  lastPageViewKey = key;
  sendGtagCommand('event', 'page_view', {
    page_path: pagePath,
    page_language: pageLanguage,
  });
  return true;
}

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!canSendAnalytics()) {
    return false;
  }

  const safeParams = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  sendGtagCommand('event', eventName, safeParams);
  return true;
}
