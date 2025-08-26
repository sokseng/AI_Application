
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user_id: 0,
      userRights: {},
      setUserRights: (rights) => set({ userRights: rights }),
      setUser: (user) => set({ user_id: user }),
    }),
    {
      name: "user-storage",         // localStorage key
      getStorage: () => localStorage, // where to store
    }
  )
);

export default useUserStore;
