import { create } from 'zustand';
import { TaxRate } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface TaxRateStore {
    taxRates: TaxRate[];
    loading: boolean;
}

export const useTaxRateStore = create<TaxRateStore>(() => ({
    taxRates: [],
    loading: false,
}));

const getToken = () => {
    if (typeof window === 'undefined') return '';
    return document.cookie.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1] || '';
};

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

export const fetchTaxRates = async (orgId: string) => {
    useTaxRateStore.setState({ loading: true });
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/tax-rates`, {
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') {
            useTaxRateStore.setState({ taxRates: data.data, loading: false });
            return data.data;
        }
        useTaxRateStore.setState({ loading: false });
        return [];
    } catch (e) {
        useTaxRateStore.setState({ loading: false });
        return [];
    }
};

export const createTaxRate = async (orgId: string, taxRate: Partial<TaxRate>) => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/tax-rates`, {
            method: 'POST',
            headers: headers(),
            credentials: 'include',
            body: JSON.stringify(taxRate),
        });
        const data = await res.json();
        if (data.status === 'success') {
            const current = useTaxRateStore.getState().taxRates;
            useTaxRateStore.setState({ taxRates: [...current, data.data] });
            return data.data;
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const updateTaxRate = async (orgId: string, taxRateId: string, updates: Partial<TaxRate>) => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/tax-rates/${taxRateId}`, {
            method: 'PUT',
            headers: headers(),
            credentials: 'include',
            body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.status === 'success') {
            const current = useTaxRateStore.getState().taxRates;
            useTaxRateStore.setState({
                taxRates: current.map(r => r.id === taxRateId ? data.data : r),
            });
            return data.data;
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const deleteTaxRate = async (orgId: string, taxRateId: string) => {
    try {
        const res = await fetch(`${API_URL}/organizations/${orgId}/tax-rates/${taxRateId}`, {
            method: 'DELETE',
            headers: headers(),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.status === 'success') {
            const current = useTaxRateStore.getState().taxRates;
            useTaxRateStore.setState({ taxRates: current.filter(r => r.id !== taxRateId) });
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

export const clearTaxRateStore = () => {
    useTaxRateStore.setState({ taxRates: [], loading: false });
};
