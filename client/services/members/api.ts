import { request } from "@/utils/request";
import { Member } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the current organization's members from the server
export async function requestMembers(OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Updates a member
export async function requestUpdateMember(member: Member, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${member.id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(member)
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Deletes a member
export async function requestDeleteMember(member: Member, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${member.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

// Creates a member
export async function requestCreateMember(member: Member, OrganizationId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(member)
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}