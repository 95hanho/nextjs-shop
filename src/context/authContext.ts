import { createContext } from "react";

interface AuthContextType {
	loginOn: boolean;
	accessToken: string | null;
	loginToken: (aToken: string, rToken: string) => void;
	logout: () => void;
	tokenCheck: () => void;
}

// 인증관련 컨텍스트
export const authContext = createContext<AuthContextType | null>(null);
