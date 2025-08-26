
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user_id: 0,
      userRights: null, // make it null so we can detect "not loaded yet"
      setUserRights: (rights) => set({ userRights: rights }),
      setUser: (user) => set({ user_id: user }),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true); // mark store as ready after rehydration
      },
    }
  )
);

export default useUserStore;
