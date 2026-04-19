import { create } from "zustand";
import api from "../api/axios";

export const useWalletStore = create((set) => ({
  balance: null,
  transactions: [],
  loading: false,
  error: null,

  fetchBalance: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/wallet/balance");
      // WalletResponse fields: availableBalance, lockedBalance, totalBalance
      const b = res.data;
      set({
        balance: b?.availableBalance ?? b?.balance ?? 0,
        loading: false,
      });
    } catch {
      // Try to create wallet if it doesn't exist
      try {
        const res = await api.post("/wallet/create");
        const b = res.data;
        set({ balance: b?.availableBalance ?? b?.balance ?? 0, loading: false });
      } catch {
        set({ balance: 0, loading: false, error: "Could not load balance" });
      }
    }
  },

  addFunds: async (amount) => {
    const res = await api.post("/wallet/add-funds", { amount: parseFloat(amount) });
    const b = res.data;
    if (b?.availableBalance !== undefined) set({ balance: b.availableBalance });
    else if (b?.balance !== undefined) set({ balance: b.balance });
    return res.data;
  },

  fetchTransactions: async () => {
    try {
      const res = await api.get("/transactions");
      // Backend returns { count: N, transactions: [...] }
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.transactions)
          ? data.transactions
          : [];
      set({ transactions: list });
    } catch {
      set({ transactions: [] });
    }
  },
}));
