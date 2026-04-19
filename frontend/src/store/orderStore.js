import { create } from "zustand";
import api from "../api/axios";

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  placeOrder: async (addressObj) => {
    // Build deliverAddress from address object fields
    const addressStr = [
      addressObj.street,
      addressObj.city,
      addressObj.state,
      addressObj.pincode,
    ].filter(Boolean).join(", ");

    const payload = {
      deliveryAddressId: String(addressObj.addressId || ""),
      deliverAddress: addressStr,
      specialInstructions: "",
    };
    const res = await api.post("/orders/place", payload);
    return res.data;
  },

  fetchMyOrders: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/orders/my");
      set({ orders: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchOrder: async (orderId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/orders/${orderId}`);
      set({ currentOrder: res.data, loading: false });
      return res.data;
    } catch {
      set({ loading: false });
    }
  },

  cancelOrder: async (orderId) => {
    const res = await api.post(`/orders/${orderId}/cancel`);
    set((s) => ({
      orders: s.orders.map((o) =>
        o.orderId === orderId ? { ...o, status: "CANCELLED" } : o
      ),
      currentOrder:
        s.currentOrder?.orderId === orderId
          ? { ...s.currentOrder, status: "CANCELLED" }
          : s.currentOrder,
    }));
    return res.data;
  },
}));
