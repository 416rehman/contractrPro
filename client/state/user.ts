import { create } from "zustand";
import jwtDecode from "jwt-decode";
import { getAccessToken } from "@/services/auth";

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const useUserStore = create((set: any) => ({
  user: null as IUser | null,
  setUser: (user: IUser | null) => set({ user }),
  isUserLoggedIn: () => !!set?.user?.id,
  async refresh() {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");
    if (!refreshToken || !accessToken) {
      return;
    }

    const decodedToken: any = jwtDecode(accessToken);
    if (!decodedToken || !decodedToken.exp) {
      return;
    }

    // if its expired use the refresh token to get a new access token
    if (decodedToken.exp * 1000 < Date.now()) {
      const newAccessToken = await getAccessToken(refreshToken);
      if (!newAccessToken) {
        return;
      }

      const newDecodedToken: any = jwtDecode(newAccessToken);
      if (!newDecodedToken) {
        return;
      }

      set({ user: newDecodedToken });
    } else {
      set({ user: decodedToken });
    }
  }
}));