import { request } from "@/utils/request";
import { InvoiceEntry } from "@/types";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the current organization's invoice entries from the server
export async function requestOrganizationInvoiceEntries (InvoiceId: string, OrganizationId : string) {
    try {
        const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${InvoiceId}/entries`, {
            method: "GET",
            credentials: "include"
            });

        return Promise.resolve(data);

    } catch (err) {
        console.log(err);
        return Promise.reject(err?.message || err);
    }
}

// Updates an organization's invoice entry
export async function requestUpdateInvoiceEntry(invoiceEntry: InvoiceEntry, InvoiceId: string, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${InvoiceId}/entries/${invoiceEntry.id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(invoiceEntry)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Deletes an organization's invoice entry
  export async function requestDeleteInvoiceEntry(invoiceEntry: InvoiceEntry, InvoiceId: string, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/${InvoiceId}/entries/${invoiceEntry.id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Creates an invoice entry for an organization
  export async function requestCreateInvoiceEntry(invoiceEntry: InvoiceEntry, InvoiceId: string, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${InvoiceId}/entries/${invoiceEntry.id}`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(invoiceEntry)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }