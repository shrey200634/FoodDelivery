import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

// BUG FIX #6: DriverResponse.status is "AVAILABLE"|"OFFLINE"|"ON_DELIVERY"
// There's no `available` boolean — we derive isOnline from status
const isAvailable = (profile) => profile?.status === "AVAILABLE";

export const useDriverStore = create(
  persist(
    (set, get) => ({
      driverProfile: null,
      activeDelivery: null,
      deliveryHistory: [],
      isOnline: false,
      currentLocation: null,
      locationWatchId: null,
      loading: false,

      fetchProfile: async () => {
        set({ loading: true });
        try {
          const res = await api.get("/driver/profile");
          const profile = res.data;
          set({
            driverProfile: profile,
            isOnline: isAvailable(profile),
            loading: false,
          });
          return profile;
        } catch {
          set({ loading: false });
          return null;
        }
      },

      // BUG FIX #5: backend expects `vehicleNum` not `vehicleNumber`
      // Also requires name + phone (from user profile ideally)
      registerDriver: async (data) => {
        const payload = {
          name: data.name,
          phone: data.phone,
          vehicleType: data.vehicleType,
          vehicleNum: data.vehicleNumber || data.vehicleNum, // accept both
        };
        const res = await api.post("/driver/register", payload);
        // Response: { message, driver: DriverResponse }
        const profile = res.data?.driver || res.data;
        set({ driverProfile: profile, isOnline: isAvailable(profile) });
        return res.data;
      },

      goOnline: async (latitude, longitude) => {
        const res = await api.post("/driver/go-online", null, {
          params: { latitude, longitude },
        });
        const profile = res.data?.driver || res.data;
        set({ isOnline: true, driverProfile: profile });
        return res.data;
      },

      goOffline: async () => {
        const res = await api.post("/driver/go-offline");
        const profile = res.data?.driver || res.data;
        set({ isOnline: false, driverProfile: profile });
        const watchId = get().locationWatchId;
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
          set({ locationWatchId: null });
        }
        return res.data;
      },

      updateLocation: async (latitude, longitude) => {
        const driverId = get().driverProfile?.driverId;
        if (!driverId) return;
        set({ currentLocation: { latitude, longitude } });
        try {
          await api.post("/driver/location", { driverId, latitude, longitude });
        } catch {}
      },

      startLocationTracking: () => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            get().updateLocation(latitude, longitude);
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
        set({ locationWatchId: watchId });
      },

      stopLocationTracking: () => {
        const watchId = get().locationWatchId;
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
          set({ locationWatchId: null });
        }
      },

      fetchActiveDelivery: async () => {
        try {
          const res = await api.get("/delivery/driver/active");
          // Response can be a single DeliveryResponse or wrapped
          const delivery = res.data?.delivery || res.data;
          set({ activeDelivery: delivery?.deliveryId ? delivery : null });
          return delivery;
        } catch {
          set({ activeDelivery: null });
          return null;
        }
      },

      fetchDeliveryHistory: async () => {
        try {
          const res = await api.get("/delivery/driver/history");
          // Backend returns { count, deliveries: [...] }
          const deliveries = res.data?.deliveries || res.data || [];
          set({ deliveryHistory: Array.isArray(deliveries) ? deliveries : [] });
        } catch {}
      },

      confirmPickup: async () => {
        const res = await api.post("/delivery/pickup");
        const delivery = res.data?.delivery || res.data;
        set({ activeDelivery: delivery });
        return res.data;
      },

      completeDelivery: async () => {
        const res = await api.post("/delivery/complete");
        set({ activeDelivery: null });
        return res.data;
      },
    }),
    {
      name: "foodrush-driver",
      partialize: (state) => ({
        driverProfile: state.driverProfile,
        isOnline: state.isOnline,
      }),
    }
  )
);
