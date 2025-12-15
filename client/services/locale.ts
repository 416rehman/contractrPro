import { create } from 'zustand';

export type Locale = 'en' | 'fr' | 'es' | 'zh' | 'ar';

// rtl languages
export const RTL_LOCALES: Locale[] = ['ar'];

interface LocaleState {
    locale: Locale;
    setLocale: (l: Locale) => void;
}

// detect browser language, fallback to english
const getInitialLocale = (): Locale => {
    if (typeof window === 'undefined') return 'en';
    const browserLang = navigator.language?.split('-')[0] as Locale;
    const supported: Locale[] = ['en', 'fr', 'es', 'zh', 'ar'];
    return supported.includes(browserLang) ? browserLang : 'en';
};

export const useLocaleStore = create<LocaleState>((set) => ({
    locale: getInitialLocale(),
    setLocale: (locale) => set({ locale }),
}));
