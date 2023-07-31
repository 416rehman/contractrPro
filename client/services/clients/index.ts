import { create } from "zustand";
import {
  requestCreateClient,
  requestDeleteClient,
  requestOrganizationClients,
  requestUpdateClient
} from "@/services/clients/api";
import { Client } from "@/types";
import { useToastsStore } from "@/services/toast";
import { clearClientCommentsStore } from "@/services/clients/comments";

export const useClientsStore = create((set: any) => ({
  clients: [] as Client[],
  setClients: (clients: Client[]) => set({ clients }),
  addClient: (client: Client) => set((state: any) => ({ clients: [...state.clients, client] })),
  removeClient: (client: Client) => set((state: any) => ({ clients: state.clients.filter((c: Client) => c.id !== client.id) })),
  updateClient: (client: Client) => set((state: any) => ({ clients: state.clients.map((c: Client) => c.id === client.id ? client : c) })),
  lastRequestedOn: null as Date | null
}));

export const loadClients = async (OrganizationId: string) => {
  if (!useClientsStore.getState().lastRequestedOn) {
    useClientsStore.getState().lastRequestedOn = new Date();
  } else {
    const now = new Date();
    const diff = now.getTime() - useClientsStore.getState().lastRequestedOn.getTime();
    // if the last request was less than 5 seconds ago, don't make another request
    if (diff < 5000) {
      return;
    }
    useClientsStore.getState().lastRequestedOn = now;
  }
  try {
    const currentClients = useClientsStore.getState().clients;
    const orgClients = await requestOrganizationClients(OrganizationId);

    // if the new clients are different from the current clients, update the store
    if (orgClients.length !== currentClients.length || orgClients.some((client, i) => client.id !== currentClients[i].id)) {
      useClientsStore.getState().setClients(orgClients);
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateClient = async (client: Client, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      if (client?.id) {
        await requestUpdateClient(client, currentOrganizationId);
        useClientsStore.getState().updateClient(client);
        useToastsStore.getState().addToast({ id: client.id, type: "success", message: "Client updated" });
      } else {
        const newClient = await requestCreateClient(client, currentOrganizationId);
        useClientsStore.getState().addClient(newClient);
        useToastsStore.getState().addToast({ id: "update-client", type: "success", message: "Client created" });
      }
    }

  } catch (err) {
    useToastsStore.getState().addToast({ id: "update-client-error", type: "error", message: err?.message || err });
  }
};

export const deleteClient = async (client: Client, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      console.log(await requestDeleteClient(client, currentOrganizationId));
    }
    useClientsStore.getState().removeClient(client);
    useToastsStore.getState().addToast({ id: "delete-client", type: "success", message: "Client deleted" });

  } catch (err) {
    useToastsStore.getState().addToast({ id: "delete-client-error", type: "error", message: err?.message || err });
  }
};

export const clearClientsStore = () => {
  useClientsStore.getState().setClients([]);
  useClientsStore.getState().lastRequestedOn = null;
  clearClientCommentsStore();
};