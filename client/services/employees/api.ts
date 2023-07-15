import { request } from "@/utils/request";
import { Employee } from "@/types";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the current organization's employees from the server
export async function requestOrganizationEmployees (OrganizationId : string) {
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

// Updates an employee
export async function requestUpdateEmployee(employee: Employee, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${employee.id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(employee)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Deletes an employee
  export async function requestDeleteEmployee(employee: Employee, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${employee.id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }
  
  // Creates an employee
  export async function requestCreateEmployee(employee: Employee, OrganizationId: string) {
    try {
      const data = await request(`${apiUrl}/organizations/${OrganizationId}/members`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(employee)
      });
  
      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
      return Promise.reject(err?.message || err);
    }
  }