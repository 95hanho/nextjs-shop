import { UserInfo } from "@/types/auth";
import { createContext, Dispatch, SetStateAction } from "react";

interface AuthContextType {
	loginOn: boolean;
	logout: () => void;
	user: UserInfo | null;
	setUser: Dispatch<SetStateAction<UserInfo | null>>;
}

// 인증관련 컨텍스트
export const authContext = createContext<AuthContextType | null>(null);
