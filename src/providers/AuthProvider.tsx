"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const initialUser = {
	userId: "",
	name: "",
	zonecode: "",
	address: "",
	addressDetail: "",
	birthday: "",
	phone: "",
	email: "",
	createdAt: new Date(),
	mileage: 0,
	tall: 0,
	weight: 0,
	withdrawalStatus: false,
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [loginOn, setLoginOn] = useState<boolean>(false);
	const [user, setUser] = useState<UserInfo>(initialUser);

	const logout = async () => {
		console.log("로그아웃");
		setLoginOn(false);
		postJson(getBaseUrl(API_URL.USER_LOGOUT));
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
