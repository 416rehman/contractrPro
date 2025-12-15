import { create } from "zustand";
import {
  requestAllOrganizationInvoices,
  requestCreateInvoice,
  requestDeleteInvoice,
  requestUpdateInvoice
} from "@/services/invoices/api";
import { Invoice } from "@/types";
import { useToastsStore } from "../toast";
import { clearInvoiceCommentsStore } from "@/services/invoices/comments";

export const useInvoicesStore = create((set: any) => ({
  invoices: [] as Invoice[],
  setInvoices: (invoices: Invoice[]) => set({ invoices }),
  addInvoice: (inovice: Invoice) => set((state: any) => ({ invoices: [...state.invoices, inovice] })),
  removeInvoice: (inovice: Invoice) => set((state: any) => ({ invoices: state.invoices.filter((i: Invoice) => i.id !== inovice.id) })),
  updateInvoice: (invoice: Invoice) => {
    set((state: any) => ({ invoices: state.invoices.map((i: Invoice) => i.id === invoice.id ? invoice : i) }));
  },
  lastRequestedOn: null as Date | null
}));

export const loadInvoices = async (currentOrganizationId: string) => {
  const { lastRequestedOn } = useInvoicesStore.getState();
  if (!lastRequestedOn) {
    useInvoicesStore.getState().lastRequestedOn = new Date();
  } else {
    const now = new Date();
    const diff = now.getTime() - lastRequestedOn.getTime();
    // if the last request was less than 5 seconds ago, don't make another request
    if (diff < 5000) {
      return;
    }
    useInvoicesStore.getState().lastRequestedOn = now;
  }
  try {
    const currentInvoices = useInvoicesStore.getState().invoices;
    const orgInvoices = await requestAllOrganizationInvoices(currentOrganizationId);

    // if the new invoices are different from the current invoices, update the store
    if (orgInvoices.length !== currentInvoices.length || orgInvoices.some((invoice: any, i: number) => invoice.id !== currentInvoices[i].id)) {
      useInvoicesStore.getState().setInvoices(orgInvoices);
    }
  } catch (err: any) {
    console.log(err);
  }
};

export const updateInvoiceAndPersist = async (invoice: Invoice, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {

      // Remove empty invoice entries
      invoice.InvoiceEntries = invoice?.InvoiceEntries.filter((entry: any) => entry.name || entry.unitCost || entry.quantity || entry.description) || [];

      if (invoice?.id) {
        await requestUpdateInvoice(invoice, currentOrganizationId);
        useInvoicesStore.getState().updateInvoice(invoice);
        useToastsStore.getState().addToast({ id: invoice.id, type: "success", message: "Invoice updated" });
        return invoice;
      } else {
        const newInvoice = await requestCreateInvoice(invoice, currentOrganizationId);
        useInvoicesStore.getState().addInvoice(newInvoice);
        useToastsStore.getState().addToast({
          id: "update-invoiceEntries",
          type: "success",
          message: "Invoice created"
        });
        return newInvoice;
      }
    }

  } catch (err: any) {
    useToastsStore.getState().addToast({
      id: "update-invoiceEntries-error",
      type: "error",
      message: err?.message || err
    });
  }
};

export const deleteInvoiceAndPersist = async (invoice: Invoice, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      console.log(await requestDeleteInvoice(invoice, currentOrganizationId));
    }
    useInvoicesStore.getState().removeInvoice(invoice);
    useToastsStore.getState().addToast({ id: "delete-invoiceEntries", type: "success", message: "Invoice deleted" });

  } catch (err: any) {
    useToastsStore.getState().addToast({
      id: "delete-invoiceEntries-error",
      type: "error",
      message: err?.message || err
    });
  }
};

export const clearInvoicesStore = () => {
  useInvoicesStore.getState().setInvoices([]);
  useInvoicesStore.getState().lastRequestedOn = null;
  clearInvoiceCommentsStore();
};