"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthProviderProps {
	children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
	const router = useRouter();

	const [loginOn, setLoginOn] = useState<boolean>(false);
	const [user, setUser] = useState<UserInfo | null>(null);

	const logout = async () => {
		console.log("로그아웃");
		setLoginOn(false);
		setUser(null);
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));
		location.reload();
	};

	// const loginToken = (aToken: string, rToken: string) => {
	// 	setLoginOn(true);
	// 	setTokens(aToken, rToken);
	// };

	// const handleReToken = useMutation({
	// 	mutationFn: (refreshToken: string) => authService.reToken({ refreshToken }),
	// 	onSuccess({ data }) {
	// 		setTokens(data.accessToken, data.refreshToken);
	// 	},
	// 	onError(err) {
	// 		console.error(err);
	// 	},
	// });

	useEffect(() => {}, []);

	return <authContext.Provider value={{ loginOn, logout, user, setUser }}>{children}</authContext.Provider>;
}
