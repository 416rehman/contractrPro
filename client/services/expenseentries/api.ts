import { request } from "@/utils/request";
import { ExpenseEntry } from "@/types";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the current organization's expense entries from the server
export async function requestOrganizationExpenseEntries (ExpenseId: string, OrganizationId : string) {
    try {
        const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${ExpenseId}/entries`, {
            method: "GET",
            credentials: "include"
            });

        return Promise.resolve(data);

    } catch (err) {
        console.log(err);
        return Promise.reject(err?.message || err);
    }
}

// Updates an organization's expense entry
export async function requestUpdateExpenseEntry(expenseEntry: ExpenseEntry, ExpenseId: string, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${ExpenseId}/entries/${expenseEntry.id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(expenseEntry)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Deletes an organization's expense entry
  export async function requestDeleteExpenseEntry(expenseEntry: ExpenseEntry, ExpenseId: string, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${ExpenseId}/entries/${expenseEntry.id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Creates an expense entry for an organization
  export async function requestCreateExpenseEntry(expenseEntry: ExpenseEntry, ExpenseId: string, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${ExpenseId}/entries/${expenseEntry.id}`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(expenseEntry)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }