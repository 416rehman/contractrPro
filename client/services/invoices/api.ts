import { request } from "@/utils/request";
import { Invoice } from "@/types";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the current organization's invoices from the server
export async function requestOrganizationInvoices (OrganizationId : string) {
    try {
        const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices`, {
            method: "GET",
            credentials: "include"
            });

        return Promise.resolve(data);

    } catch (err) {
        console.log(err);
        return Promise.reject(err?.message || err);
    }
}

// Updates an organization's invoice
export async function requestUpdateInvoice(invoice: Invoice, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${invoice.id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(invoice)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Deletes an organization's invoice
  export async function requestDeleteInvoice(invoice: Invoice, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${invoice.id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Creates an invoice for an organization
  export async function requestCreateInvoice(invoice: Invoice, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(invoice)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }