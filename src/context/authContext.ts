import { AdminInfo } from "@/types/admin";
import { UserInfo } from "@/types/auth";
import { SellerInfo } from "@/types/seller";
import { createContext, Dispatch, SetStateAction } from "react";

interface AuthContextType {
	loginOn: boolean;
	logout: () => void;
	user: UserInfo;
	setUser: Dispatch<SetStateAction<UserInfo>>;
}

interface SellerAuthContextType {
	loginOn: boolean;
	logout: () => void;
	seller: SellerInfo;
	setSeller: Dispatch<SetStateAction<SellerInfo>>;
}

interface AdminAuthContextType {
	loginOn: boolean;
	logout: () => void;
	admin: AdminInfo;
	setAdmin: Dispatch<SetStateAction<AdminInfo>>;
}

// 인증관련 컨텍스트
export const authContext = createContext<AuthContextType | null>(null);
// 판매자 인증관련 컨텍스트
export const sellerAuthContext = createContext<SellerAuthContextType | null>(null);
// 관리자 인증관련 컨텍스트
export const adminAuthContext = createContext<AdminAuthContextType | null>(null);
