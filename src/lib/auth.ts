import { cookies } from "next/headers";

export async function getServerSession() {
	const accessToken = (await cookies()).get("accessToken")?.value;
	console.log("accessToken", accessToken);
	if (!accessToken) return null;

	return;

	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
		headers: { Cookie: `accessToken=${accessToken}` },
		cache: "no-store",
	});

	if (!res.ok) return null;
	const { user } = await res.json();
	return user;
}

/**
 * 로그아웃쿼리 추가
 * @param originUrl 원래url
 * @returns 추가 url
 */
export const addLogoutQuery = (originUrl: string): string => {
	const url = new URL(originUrl); // originURL이 'https://...'값이므로 뒤에 baseURL을 안넣어도됨.
	url.searchParams.set("logout", "1");
	return url.pathname + (url.search ? url.search : "");
};
