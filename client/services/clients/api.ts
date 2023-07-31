import { request } from "@/utils/request";
import { Client } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the current organization's clients from the server
export async function requestOrganizationClients(OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/clients`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Updates a client
export async function requestUpdateClient(client: Client, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/clients/${client.id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(client)
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Deletes a client
export async function requestDeleteClient(client: Client, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/clients/${client.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Creates a client
export async function requestCreateClient(client: Client, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/clients`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(client)
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}