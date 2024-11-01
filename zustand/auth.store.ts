import { Tables } from "@/supabase/database.types";
import { create } from "zustand";
type AuthStoreState = {
  isAuthInitialized: boolean;
  isLoggedIn: boolean;
  initializeAuth: () => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  logIn: () => void;
  logOut: () => void;
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
  firstPetIdState: number | null;
  setFirstPetIdState: (id: number | null) => void;
  profile: Tables<"profiles"> | null;
  setProfile: (profile: AuthStoreState["profile"]) => void;
};

type kakaoLoginState = {
  kakaoLogin: kakaoLoginState | null;
  setKakaoLogin: (profile: kakaoLoginState) => void;
  resetToKakaoProfile: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthInitialized: false,
  isLoggedIn: false,
  logIn: () => set({ isLoggedIn: true }),
  logOut: () => set({ isLoggedIn: false }),
  initializeAuth: () => set({ isAuthInitialized: true }),
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  currentUserId: null,
  setCurrentUserId: (id: string | null) => set({ currentUserId: id }),
  firstPetIdState: null,
  setFirstPetIdState: (id) => set({ firstPetIdState: id }),
  profile: null,
  setProfile: (profile) => set({ profile }),
}));

export const useKakaoLoginStore = create<kakaoLoginState>((set) => ({
  kakaoLogin: null,
  setKakaoLogin: (kakao) => set({ kakaoLogin: kakao }),
  resetToKakaoProfile: () => set({ kakaoLogin: null }), // 기본 프로필로 되돌리는 기능 추가
}));
