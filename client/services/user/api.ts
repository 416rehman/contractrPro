import { request } from "@/utils/request";
import { Organization } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the loggedInUser's organizations from the server, and stores them in the loggedInUser store and returns them
export async function requestUserWithOrganizations(UserId = "me") {
  try {
    const data = await request(`${apiUrl}/users/${UserId}/organizations`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestCreateOrganization(organization: Organization) {
  try {
    const data = await request(`${apiUrl}/organizations`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(organization)
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestUpdateOrganization(organization: Organization) {
  try {
    const data = await request(`${apiUrl}/organizations/${organization.id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(organization)
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestDeleteOrganization(organizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${organizationId}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestAvatarChange(avatarUrl: any, UserId = "me") {
  try {
    const data = await request(`${apiUrl}/users/${UserId}/avatar`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ avatarUrl })
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestNameChange(name: any, UserId = "me") {
  try {
    const data = await request(`${apiUrl}/users/${UserId}/name`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ name })
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestEmailChange(email: any, UserId = "me") {
  try {
    const data = await request(`${apiUrl}/users/${UserId}/email`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email })
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestPhoneChange(phoneCountry: any, phoneNumber: any, UserId = "me") {
  try {
    const data = await request(`${apiUrl}/users/${UserId}/phone`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ phoneCountry, phoneNumber })
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function getOrganizationSummary(organizationId: any) {
  try {
    const data = await request(`${apiUrl}/organizations/${organizationId}/summary`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err: any) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}