import { create } from "zustand";
import { requestCreateExpenseEntry, requestUpdateExpenseEntry, requestOrganizationExpenseEntries, requestDeleteExpenseEntry } from "@/services/expenseEntries/api";
import { ExpenseEntry } from "@/types";
import { useToastsStore } from "../toast";

export const useExpenseEntriesStore = create((set: any) => ({
    expenseEntries: [] as ExpenseEntry[],
    setExpenseEntries: (expenseEntries: ExpenseEntry[]) => set({ expenseEntries }),
    addExpenseEntry: (expenseEntry: ExpenseEntry) => set((state : any) => ({ expenseEntries: [...state.expenseEntries, expenseEntry] })),
    removeExpenseEntry: (expenseEntry: ExpenseEntry) => set((state: any) => ({ expenseEntries: state.expenseEntries.filter((ee: ExpenseEntry) => ee.id !== expenseEntry.id) })),
    updateExpenseEntry: (expenseEntry: ExpenseEntry) => set((state: any) => ({ expenseEntries: state.expenseEntries.map((ee: ExpenseEntry) => ee.id === expenseEntry.id ? expenseEntry : ee) }))
}));

export const loadExpenseEntries = async (currentExpenseId: string, currentOrganizationId: string) => {
    try {
      useExpenseEntriesStore.getState().setExpenseEntries(await requestOrganizationExpenseEntries(currentExpenseId, currentOrganizationId));
    } catch (err) {
      console.log(err);
    }
};
  
export const updateExpenseEntry = async (expenseEntry: ExpenseEntry, currentExpenseId: string, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        if (currentExpenseId) {
            if (expenseEntry?.id) {
                await requestUpdateExpenseEntry(expenseEntry, currentExpenseId, currentOrganizationId);
                useExpenseEntriesStore.getState().updateExpenseEntry(expenseEntry);
                useToastsStore.getState().addToast({ id: expenseEntry.id, type: "success", message: "Expense Entry updated" });
            } else {
                const newExpenseEntry = await requestCreateExpenseEntry(expenseEntry,currentExpenseId, currentOrganizationId);
                useExpenseEntriesStore.getState().addExpenseEntry(newExpenseEntry);
                useToastsStore.getState().addToast({ id: "update-expense-entry", type: "success", message: "Expense Entry created" });
            }
        }
        
      }
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "update-expense-entry-error", type: "error", message: err?.message || err });
    }
};
  
export const deleteExpenseEntry = async (expenseEntry: ExpenseEntry, currentExpenseId: string, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        if (currentExpenseId) {
            console.log(await requestDeleteExpenseEntry(expenseEntry, currentExpenseId, currentOrganizationId));
        }
      }
      useExpenseEntriesStore.getState().removeExpenseEntry(expenseEntry);
      useToastsStore.getState().addToast({ id: "delete-expense-entry", type: "success", message: "Expense Entry deleted" });
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "delete-expense-entry-error", type: "error", message: err?.message || err });
    }
};