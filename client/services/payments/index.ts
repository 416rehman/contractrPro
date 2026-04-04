import { create } from 'zustand';
import { Payment } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface PaymentStore {
    payments: Payment[];
    loading: boolean;
    error: string | null;
}

export const usePaymentStore = create<PaymentStore>(() => ({
    payments: [],
    loading: false,
    error: null,
}));

const getToken = () => {
    if (typeof window === 'undefined') return '';
    return document.cookie.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1] || '';
};

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

export const fetchPayments = async (orgId: string, filters?: Record<string, string>) => {
    usePaymentStore.setState({ loading: true, error: null });
    try {
        const params = new URLSearchParams(filters || {});
        const res = await fetch(`${API_URL}/organizations/${orgId}/payments?${params}`, {
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') {
            usePaymentStore.setState({ payments: data.data, loading: false });
            return data.data;
        }
        usePaymentStore.setState({ error: data.code, loading: false });
        return [];
    } catch (e: any) {
        usePaymentStore.setState({ error: e.message, loading: false });
        return [];
    }
};

export const createPayment = async (orgId: string, payment: Partial<Payment>) => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/payments`, {
            method: 'POST',
            headers: headers(),
            credentials: 'include',
            body: JSON.stringify(payment),
        });
        const data = await res.json();
        if (data.status === 'success') {
            const current = usePaymentStore.getState().payments;
            usePaymentStore.setState({ payments: [data.data, ...current] });
            return data.data;
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const deletePayment = async (orgId: string, paymentId: string) => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/payments/${paymentId}`, {
            method: 'DELETE',
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') {
            const current = usePaymentStore.getState().payments;
            usePaymentStore.setState({ payments: current.filter(p => p.id !== paymentId) });
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

export const clearPaymentsStore = () => {
    usePaymentStore.setState({ payments: [], loading: false, error: null });
};
