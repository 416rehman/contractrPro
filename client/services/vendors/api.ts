import { request } from "@/utils/request";
import { Vendor } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the current organization's vendors from the server
export async function requestOrganizationVendors(OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/vendors`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Updates a vendor
export async function requestUpdateVendor(vendor: Vendor, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/vendors/${vendor.id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(vendor)
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Deletes a vendor
export async function requestDeleteVendor(vendor: Vendor, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/vendors/${vendor.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Creates a vendor
export async function requestCreateVendor(vendor: Vendor, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/vendors`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(vendor)
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}