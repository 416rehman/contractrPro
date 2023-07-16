import { create } from "zustand";
import { requestCreateInvoiceEntry, requestUpdateInvoiceEntry, requestOrganizationInvoiceEntries, requestDeleteInvoiceEntry } from "@/services/invoiceEntries/api";
import { InvoiceEntry } from "@/types";
import { useToastsStore } from "../toast";

export const useInvoiceEntriesStore = create((set: any) => ({
    invoiceEntries: [] as InvoiceEntry[],
    setInvoiceEntries: (invoiceEntries: InvoiceEntry[]) => set({ invoiceEntries }),
    addInvoiceEntry: (invoiceEntry: InvoiceEntry) => set((state : any) => ({ invoiceEntries: [...state.invoiceEntries, invoiceEntry] })),
    removeInvoiceEntry: (invoiceEntry: InvoiceEntry) => set((state: any) => ({ invoiceEntries: state.invoiceEntries.filter((ie: InvoiceEntry) => ie.id !== invoiceEntry.id) })),
    updateInvoiceEntry: (invoiceEntry: InvoiceEntry) => set((state: any) => ({ invoiceEntries: state.invoiceEntries.map((ie: InvoiceEntry) => ie.id === invoiceEntry.id ? invoiceEntry : ie) }))
}));

export const loadInvoiceEntries = async (currentInvoiceId: string, currentOrganizationId: string) => {
    try {
      useInvoiceEntriesStore.getState().setInvoiceEntries(await requestOrganizationInvoiceEntries(currentInvoiceId, currentOrganizationId));
    } catch (err) {
      console.log(err);
    }
};
  
export const updateInvoiceEntry = async (invoiceEntry: InvoiceEntry, currentInvoiceId: string, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        if (currentInvoiceId) {
            if (invoiceEntry?.id) {
                await requestUpdateInvoiceEntry(invoiceEntry, currentInvoiceId, currentOrganizationId);
                useInvoiceEntriesStore.getState().updateInvoiceEntry(invoiceEntry);
                useToastsStore.getState().addToast({ id: invoiceEntry.id, type: "success", message: "Invoice Entry updated" });
            } else {
                const newInvoiceEntry = await requestCreateInvoiceEntry(invoiceEntry, currentInvoiceId, currentOrganizationId);
                useInvoiceEntriesStore.getState().addInvoiceEntry(newInvoiceEntry);
                useToastsStore.getState().addToast({ id: "update-invoice-entry", type: "success", message: "Invoice Entry created" });
            }
        }
        
      }
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "update-invoice-entry-error", type: "error", message: err?.message || err });
    }
};
  
export const deleteInvoiceEntry = async (invoiceEntry: InvoiceEntry, currentInvoiceId: string, currentOrganizationId: string) => {
    try {
        if (currentOrganizationId) {
            if (currentInvoiceId) {
                console.log(await requestDeleteInvoiceEntry(invoiceEntry, currentInvoiceId, currentOrganizationId));
            }
        }
        useInvoiceEntriesStore.getState().removeInvoiceEntry(invoiceEntry);
        useToastsStore.getState().addToast({ id: "delete-invoice-entry", type: "success", message: "Invoice Entry deleted" });

    } catch (err) {
        useToastsStore.getState().addToast({ id: "delete-invoice-entry-error", type: "error", message: err?.message || err });
    }
};