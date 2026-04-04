import { StripeStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getToken = () => {
    if (typeof window === 'undefined') return '';
    return document.cookie.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1] || '';
};

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

export const fetchStripeStatus = async (orgId: string): Promise<StripeStatus | null> => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/stripe/status`, {
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') return data.data;
        return null;
    } catch (e) {
        return null;
    }
};

export const initiateStripeConnect = async (orgId: string): Promise<string | null> => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/stripe/connect`, {
            method: 'POST',
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') return data.data.url;
        return null;
    } catch (e) {
        return null;
    }
};

export const sendInvoice = async (orgId: string, invoiceId: string) => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/invoices/${invoiceId}/send`, {
            method: 'POST',
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') return data.data;
        return null;
    } catch (e) {
        return null;
    }
};

export const fetchPublicInvoice = async (token: string) => {
    try {
        const res = await fetch(`${API_URL}/p/invoices/${token}`);
        const data = await res.json();
        if (data.status === 'success') return data.data;
        return null;
    } catch (e) {
        return null;
    }
};
