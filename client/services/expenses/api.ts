import { request } from "@/utils/request";
import { Expense } from "@/types";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the current organization's expenses from the server
export async function requestOrganizationExpenses (OrganizationId : string) {
    try {
        const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses`, {
            method: "GET",
            credentials: "include"
            });

        return Promise.resolve(data);

    } catch (err) {
        console.log(err);
        return Promise.reject(err?.message || err);
    }
}

// Updates an organization's expense
export async function requestUpdateExpense(expense: Expense, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expense.id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(expense)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Deletes an organization's expense
  export async function requestDeleteExpense(expense: Expense, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expense.id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Creates an expense for an organization
  export async function requestCreateExpense(expense: Expense, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(expense)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }