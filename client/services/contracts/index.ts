import { create } from "zustand";
import {
  requestAllOrganizationContracts,
  requestCreateContract,
  requestDeleteContract,
  requestUpdateContract
} from "@/services/contracts/api";
import { Contract } from "@/types";
import { useToastsStore } from "../toast";

export const useContractsStore = create((set: any) => ({
  contracts: [] as Contract[],
  setContracts: (contracts: Contract[]) => set({ contracts }),
  addContract: (inovice: Contract) => set((state: any) => ({ contracts: [...state.contracts, inovice] })),
  removeContract: (inovice: Contract) => set((state: any) => ({ contracts: state.contracts.filter((i: Contract) => i.id !== inovice.id) })),
  updateContract: (contract: Contract) => {
    set((state: any) => ({ contracts: state.contracts.map((i: Contract) => i.id === contract.id ? contract : i) }));
  }
}));

export const loadContracts = async (currentOrganizationId: string) => {
  try {
    const currentContracts = useContractsStore.getState().contracts;
    const orgContracts = await requestAllOrganizationContracts(currentOrganizationId);

    // if the new contracts are different from the current contracts, update the store
    if (orgContracts.length !== currentContracts.length || orgContracts.some((contract, i) => contract.id !== currentContracts[i].id)) {
      useContractsStore.getState().setContracts(orgContracts);
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateContractAndPersist = async (contract: Contract, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      if (contract?.id) {
        console.log(contract);
        await requestUpdateContract(contract, currentOrganizationId);
        useContractsStore.getState().updateContract(contract);
        useToastsStore.getState().addToast({ id: contract.id, type: "success", message: "Contract updated" });
      } else {
        const newContract = await requestCreateContract(contract, currentOrganizationId);
        useContractsStore.getState().addContract(newContract);
        useToastsStore.getState().addToast({
          id: "update-contractEntries",
          type: "success",
          message: "Contract created"
        });
      }
    }

  } catch (err) {
    useToastsStore.getState().addToast({
      id: "update-contractEntries-error",
      type: "error",
      message: err?.message || err
    });
  }
};

export const deleteContractAndPersist = async (contract: Contract, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      console.log(await requestDeleteContract(contract, currentOrganizationId));
    }
    useContractsStore.getState().removeContract(contract);
    useToastsStore.getState().addToast({ id: "delete-contract", type: "success", message: "Contract deleted" });

  } catch (err) {
    useToastsStore.getState().addToast({
      id: "delete-contract-error",
      type: "error",
      message: err?.message || err
    });
  }
};