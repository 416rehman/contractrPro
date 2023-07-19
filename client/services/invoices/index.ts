import { create } from "zustand";
import {
  requestAllOrganizationInvoices,
  requestCreateInvoice,
  requestDeleteInvoice,
  requestUpdateInvoice
} from "@/services/invoices/api";
import { Invoice } from "@/types";
import { useToastsStore } from "../toast";

export const useInvoicesStore = create((set: any) => ({
  invoices: [] as Invoice[],
  setInvoices: (invoices: Invoice[]) => set({ invoices }),
  addInvoice: (inovice: Invoice) => set((state: any) => ({ invoices: [...state.invoices, inovice] })),
  removeInvoice: (inovice: Invoice) => set((state: any) => ({ invoices: state.invoices.filter((i: Invoice) => i.id !== inovice.id) })),
  updateInvoice: (invoice: Invoice) => {
    set((state: any) => ({ invoices: state.invoices.map((i: Invoice) => i.id === invoice.id ? invoice : i) }));
  }
}));

export const loadInvoices = async (currentOrganizationId: string) => {
  try {
    useInvoicesStore.getState().setInvoices(await requestAllOrganizationInvoices(currentOrganizationId));
  } catch (err) {
    console.log(err);
  }
};

export const updateInvoiceAndPersist = async (invoice: Invoice, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      if (invoice?.id) {
        await requestUpdateInvoice(invoice, currentOrganizationId);
        useInvoicesStore.getState().updateInvoice(invoice);
        useToastsStore.getState().addToast({ id: invoice.id, type: "success", message: "Invoice updated" });
      } else {
        const newInvoice = await requestCreateInvoice(invoice, currentOrganizationId);
        useInvoicesStore.getState().addInvoice(newInvoice);
        useToastsStore.getState().addToast({
          id: "update-invoiceEntries",
          type: "success",
          message: "Invoice created"
        });
      }
    }

  } catch (err) {
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

  } catch (err) {
    useToastsStore.getState().addToast({
      id: "delete-invoiceEntries-error",
      type: "error",
      message: err?.message || err
    });
  }
};