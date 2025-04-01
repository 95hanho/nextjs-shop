"use client";

import { isTokenExpired } from "@/utils/auth";
import { cookies } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GiSverdIFjell } from "react-icons/gi";

export default function useAuth() {
	const [accessToken, set_accessToken] = useState<string | null>(null);
	const router = useRouter();

	const loginToken = (aToken: string, rToken: string) => {
		reToken(aToken, rToken);
	};

	const reToken = (aToken: string, rToken: string) => {
		set_accessToken(aToken);
		cookies.set("refreshToken", rToken, 60);
	};

	const tokenCheck = () => {
		const rToken = cookies.get("refreshToken");

		if (accessToken && isTokenExpired(accessToken)) {
			console.warn("만료");
		}
	};

	// 로그아웃 함수
	const logout = async () => {
		set_accessToken(null);
		cookies.remove("refreshToken");
	};

	return { accessToken, loginToken, tokenCheck, logout };
}
