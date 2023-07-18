import { create } from "zustand";
import { requestCreateExpense, requestUpdateExpense, requestOrganizationExpenses, requestDeleteExpense } from "@/services/expenses/api";
import { Expense } from "@/types";
import { useToastsStore } from "../toast";

export const useExpensesStore = create((set: any) => ({
    expenses: [] as Expense[],
    setExpenses: (expenses: Expense[]) => set({ expenses }),
    addExpense: (expense: Expense) => set((state : any) => ({ expenses: [...state.expenses, expense] })),
    removeExpense: (expense: Expense) => set((state: any) => ({ expenses: state.expenses.filter((e: Expense) => e.id !== expense.id) })),
    updateExpense: (expense: Expense) => set((state: any) => ({ expenses: state.expenses.map((e: Expense) => e.id === expense.id ? expense : e) }))
}));

export const loadExpenses = async (currentOrganizationId: string) => {
    try {
      useExpensesStore.getState().setExpenses(await requestOrganizationExpenses(currentOrganizationId));
    } catch (err) {
      console.log(err);
    }
};
  
export const updateExpenses = async (expense: Expense, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        if (expense?.id) {
          await requestUpdateExpense(expense, currentOrganizationId);
          useExpensesStore.getState().updateExpense(expense);
          useToastsStore.getState().addToast({ id: expense.id, type: "success", message: "Expense updated" });
        } else {
          const newExpense = await requestCreateExpense(expense, currentOrganizationId);
          useExpensesStore.getState().addExpense(newExpense);
          useToastsStore.getState().addToast({ id: "update-expense", type: "success", message: "Expense created" });
        }
      }
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "update-expense-error", type: "error", message: err?.message || err });
    }
};
  
export const deleteExpense = async (expense: Expense, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        console.log(await requestDeleteExpense(expense, currentOrganizationId));
      }
      useExpensesStore.getState().removeExpense(expense);
      useToastsStore.getState().addToast({ id: "delete-expense", type: "success", message: "Expense deleted" });
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "delete-expense-error", type: "error", message: err?.message || err });
    }
};