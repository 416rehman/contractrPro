import { create } from "zustand";
import { requestCreateEmployee, requestUpdateEmployee, requestOrganizationEmployees, requestDeleteEmployee } from "@/services/employees/api";
import { Employee } from "@/types";
import { useToastsStore } from "../toast";

export const useEmployeesStore = create((set: any) => ({
    employees: [] as Employee[],
    setEmployees: (employees: Employee[]) => set({ employees }),
    addEmployee: (employee: Employee) => set((state : any) => ({ employees: [...state.employees, employee] })),
    removeEmployee: (employee: Employee) => set((state: any) => ({ employees: state.employees.filter((e: Employee) => e.id !== employee.id) })),
    updateEmployee: (employee: Employee) => set((state: any) => ({ employees: state.employees.map((e: Employee) => e.id === employee.id ? employee : e) }))
}));

export const loadEmployees = async (currentOrganizationId: string) => {
    try {
      useEmployeesStore.getState().setEmployees(await requestOrganizationEmployees(currentOrganizationId));
    } catch (err) {
      console.log(err);
    }
  };
  
  export const updateEmployee = async (employee: Employee, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        if (employee?.id) {
          await requestUpdateEmployee(employee, currentOrganizationId);
          useEmployeesStore.getState().updateEmployee(employee);
          useToastsStore.getState().addToast({ id: employee.id, type: "success", message: "Employee updated" });
        } else {
          const newEmployee = await requestCreateEmployee(employee, currentOrganizationId);
          useEmployeesStore.getState().addEmployee(newEmployee);
          useToastsStore.getState().addToast({ id: "update-employee", type: "success", message: "Employee created" });
        }
      }
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "update-employee-error", type: "error", message: err?.message || err });
    }
  };
  
  export const deleteEmployee = async (employee: Employee, currentOrganizationId: string) => {
    try {
      if (currentOrganizationId) {
        console.log(await requestDeleteEmployee(employee, currentOrganizationId));
      }
      useEmployeesStore.getState().removeEmployee(employee);
      useToastsStore.getState().addToast({ id: "delete-employee", type: "success", message: "Employee deleted" });
  
    } catch (err) {
      useToastsStore.getState().addToast({ id: "delete-employee-error", type: "error", message: err?.message || err });
    }
  };