import { request } from "@/utils/request";
import { Invoice } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the current organization's invoices from the server
export async function requestAllOrganizationInvoices(OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices?expand=true`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);

  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Updates an organization's invoiceEntries
export async function requestUpdateInvoice(invoice: Invoice, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${invoice.id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(invoice)
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Deletes an organization's invoiceEntries
export async function requestDeleteInvoice(invoice: Invoice, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices/${invoice.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Creates an invoiceEntries for an organization
export async function requestCreateInvoice(invoice: Invoice, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/invoices`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(invoice)
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}