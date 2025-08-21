
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userRights: {},
      setUserRights: (rights) => set({ userRights: rights }),
    }),
    {
      name: "user-storage",         // localStorage key
      getStorage: () => localStorage, // where to store
    }
  )
);

export default useUserStore;
