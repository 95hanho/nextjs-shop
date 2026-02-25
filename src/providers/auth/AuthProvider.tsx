import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { isAuthRequiredPath } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AuthProviderProps {
	children: React.ReactNode;
}

const initUser = {
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
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const { replace, refresh } = useRouter();
	const [user, setUser] = useState<UserInfo>(initUser);

	const loginOn = !!user;

	const logout = async () => {
		console.log("로그아웃");
		console.log("pathname", pathname);
		const needsAuth = isAuthRequiredPath(pathname);
		setUser(initUser);
		// React Query 캐시 무효화
		queryClient.setQueryData(["me"], initUser); // 직접 캐시 업데이트
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));

		// 로그인 필요 페이지였으면 메인으로 이동.
		if (needsAuth) {
			// ✅ 보호 페이지에서 로그아웃이면 캐시 꼬임 방지 위해 강제 문서 이동
			window.location.assign("/");
			return;
			replace("/");
		}

		// ✅ 로그아웃 반영(서버 컴포넌트/RSC 캐시 갱신)
		refresh();
	};

	return <authContext.Provider value={{ loginOn, logout, user, setUser }}>{children}</authContext.Provider>;
};
