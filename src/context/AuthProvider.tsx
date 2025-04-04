"use client";

import { authService } from "@/api";
import { isTokenExpired } from "@/utils/auth";
import { cookies } from "@/utils/cookies";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

interface AuthProviderProps {
	children: React.ReactNode;
}

interface AuthContextType {
	loginOn: boolean;
	accessToken: string | null;
	loginToken: (aToken: string, rToken: string) => void;
	logout: () => void;
	tokenCheck: () => void;
}

export const authContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: AuthProviderProps) {
	const router = useRouter();
	const [loginOn, set_loginOn] = useState<boolean>(false);
	const [accessToken, set_accessToken] = useState<string | null>(null);

	useEffect(() => {
		console.log(accessToken);
	}, [accessToken]);

	const loginToken = (aToken: string, rToken: string) => {
		set_loginOn(true);
		setTokens(aToken, rToken);
	};

	const setTokens = (aToken: string, rToken: string) => {
		console.log("setTokens");
		set_accessToken(aToken);
		localStorage.setItem("accessToken", aToken);
		cookies.set("refreshToken", rToken, 60 * 10);
	};

	const handleReToken = useMutation({
		mutationFn: (refresh_token: string) => authService.reToken({ refresh_token }),
		onSuccess({ data }) {
			setTokens(data.access_token, data.refresh_token);
		},
		onError(err) {
			console.error(err);
		},
	});

	const tokenCheck = () => {
		if (!loginOn) return;
		console.log("tokenCheck", accessToken);
		const rToken = cookies.get("refreshToken");
		if (!rToken || (rToken && isTokenExpired(rToken)) || !accessToken) logout();
		else if (accessToken && isTokenExpired(accessToken)) {
			console.log("리토큰 실행");
			handleReToken.mutate(rToken!);
		} else {
			console.log("로그인토큰 유지");
		}
	};

	const logout = async () => {
		console.log("로그아웃");
		set_loginOn(false);
		set_accessToken(null);
		localStorage.removeItem("accessToken");
		cookies.remove("refreshToken");
	};

	useEffect(() => {
		const aToken = localStorage.getItem("accessToken");
		if (aToken) set_accessToken(aToken);
		set_loginOn(cookies.has("refreshToken"));
	}, []);

	return (
		<authContext.Provider value={{ loginOn, accessToken, loginToken, logout, tokenCheck }}>
			{children}
		</authContext.Provider>
	);
}
