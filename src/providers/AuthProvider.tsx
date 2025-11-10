"use client";

import { authService } from "@/api";
import { authContext } from "@/context/authContext";
import { isTokenExpired } from "@/utils/auth";
import { cookies } from "@/utils/cookies";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [loginOn, setLoginOn] = useState<boolean>(false);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		// console.log(accessToken);
	}, [accessToken]);

	// const loginToken = (aToken: string, rToken: string) => {
	// 	setLoginOn(true);
	// 	setTokens(aToken, rToken);
	// };

	const setTokens = (aToken: string, rToken: string) => {
		console.log("setTokens");
		setAccessToken(aToken);
		localStorage.setItem("accessToken", aToken);
		cookies.set("refreshToken", rToken, 60 * 10);
	};

	// const handleReToken = useMutation({
	// 	mutationFn: (refreshToken: string) => authService.reToken({ refreshToken }),
	// 	onSuccess({ data }) {
	// 		setTokens(data.accessToken, data.refreshToken);
	// 	},
	// 	onError(err) {
	// 		console.error(err);
	// 	},
	// });

	// 일단 쓰는거 보류 => middleware.ts로 처리할듯
	const tokenCheck = () => {
		if (!loginOn) return;
		console.log("tokenCheck", accessToken);
		const rToken = cookies.get("refreshToken");
		if (!rToken || (rToken && isTokenExpired(rToken)) || !accessToken) logout();
		else if (accessToken && isTokenExpired(accessToken)) {
			console.log("리토큰 실행");
			// handleReToken.mutate(rToken!);
		} else {
			console.log("로그인토큰 유지");
		}
	};

	const logout = async () => {
		console.log("로그아웃");
		setLoginOn(false);
		setAccessToken(null);
		localStorage.removeItem("accessToken");
		cookies.remove("refreshToken");
	};

	useEffect(() => {
		const aToken = localStorage.getItem("accessToken");
		if (aToken) setAccessToken(aToken);
		setLoginOn(cookies.has("refreshToken"));
	}, []);

	return <authContext.Provider value={{ loginOn, accessToken, /* loginToken, */ logout, tokenCheck }}>{children}</authContext.Provider>;
}
