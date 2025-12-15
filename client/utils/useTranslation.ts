"use client";

import { useCallback } from 'react';
import { IntlMessageFormat } from 'intl-messageformat';
import { useLocaleStore, Locale } from '@/services/locale';

// import all locales
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import zh from '@/locales/zh.json';
import ar from '@/locales/ar.json';

const locales: Record<Locale, typeof en> = { en, fr, es, zh, ar };

// get nested key from object. supports dot notation like "auth.login_title"
function getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === undefined || current === null) return undefined;
        current = current[key];
    }
    return typeof current === 'string' ? current : undefined;
}

export function useTranslation() {
    const locale = useLocaleStore((s) => s.locale);
    const setLocale = useLocaleStore((s) => s.setLocale);
    const messages = locales[locale] || locales.en;

    // translate a key, optionally with ICU interpolation values
    const t = useCallback((key: string, values?: Record<string, any>): string => {
        const msg = getNestedValue(messages, key);

        // fallback to english if not found in current locale
        if (!msg) {
            const fallback = getNestedValue(locales.en, key);
            if (!fallback) return key; // return key if no translation exists
            if (values) {
                try {
                    return new IntlMessageFormat(fallback, 'en').format(values) as string;
                } catch {
                    return fallback;
                }
            }
            return fallback;
        }

        // if values provided, use ICU formatting
        if (values) {
            try {
                return new IntlMessageFormat(msg, locale).format(values) as string;
            } catch {
                return msg;
            }
        }

        return msg;
    }, [locale, messages]);

    // translate an API error code. codes are stored under "errors" namespace
    const tError = useCallback((code: string): string => {
        return t(`errors.${code}`);
    }, [t]);

    return { t, tError, locale, setLocale };
}
