import { request } from "@/utils/request";
import { Contract } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the current organization's contracts from the server
export async function requestAllOrganizationContracts(OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/contracts?expand=true`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);

  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Updates an organization's contractEntries
export async function requestUpdateContract(contract: Contract, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/contracts/${contract.id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(contract)
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Deletes an organization's contractEntries
export async function requestDeleteContract(contract: Contract, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/contracts/${contract.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Creates an contractEntries for an organization
export async function requestCreateContract(contract: Contract, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/contracts`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(contract)
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}