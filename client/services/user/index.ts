import { create } from 'zustand'
import { Organization, tUser } from '@/types'
import { requestCreateOrganization, requestUserOrganizations } from '@/services/user/api'
import { useInvoicesStore } from '@/services/invoices'
import { useExpensesStore } from '@/services/expenses'
import { useEmployeesStore } from '@/services/employees'
import { useClientsStore } from '@/services/clients'

export const useUserStore = create((set: any) => ({
    user: null as tUser | null,
    setUser: (user: tUser | null) => set({ user }),
    organizations: [] as Organization[],
    setOrganizations: (organizations: Organization[]) => set({ organizations }),
    currentOrganization: null as Organization | null,
    setCurrentOrganization: (organization: Organization | null) => {
        set({ currentOrganization: organization })
    },
}))

export const loadUserOrganizations = async () => {
    try {
        const currentOrgs = useUserStore.getState().organizations
        const orgs = await requestUserOrganizations()

        // if the new orgs are different from the current orgs, update the store
        if (orgs.length !== currentOrgs.length || orgs.some((org, i) => org.id !== currentOrgs[i].id)) {
            useUserStore.getState().setOrganizations(orgs)
        }
    } catch (err) {
        console.log(err)
    }
}

export const setCurrentOrganization = (organization: Organization | null) => {
    // if the new org is different from the current org, updates the store and clears all the current org's data
    if (organization?.id !== useUserStore.getState().currentOrganization?.id) {
        useUserStore.getState().setCurrentOrganization(organization)
        // clear cache
        useInvoicesStore.getState().setInvoices([])
        useExpensesStore.getState().setExpenses([])
        useEmployeesStore.getState().setEmployees([])
        useClientsStore.getState().setClients([])
    }
}

export const createOrganization = async (organization: Organization) => {
    try {
        const createdOrg = await requestCreateOrganization(organization)

        console.log("createdOrg", createdOrg)

        if (createdOrg) {
            useUserStore.getState().setOrganizations([...useUserStore.getState().organizations, createdOrg])
        }

        return createdOrg
    } catch (err) {
        console.log(err)
    }
}
