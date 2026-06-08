import { Role } from "@/lib/auth/types";

const TTL_MS = 30_000;

export type CachedTokenRefresh = {
	primaryValue: number;
	newAccessToken: string;
	newRefreshToken: string;
	cachedAt: number;
};

type RefreshCacheStore = Map<string, CachedTokenRefresh>;

const getStore = (): RefreshCacheStore => {
	const globalStore = globalThis as typeof globalThis & { __tokenRefreshCache?: RefreshCacheStore };
	if (!globalStore.__tokenRefreshCache) {
		globalStore.__tokenRefreshCache = new Map();
	}
	return globalStore.__tokenRefreshCache;
};

const buildKey = (role: Role, refreshToken: string) => `${role}:${refreshToken.slice(-10)}`;

export const getCachedTokenRefresh = (role: Role, refreshToken: string): CachedTokenRefresh | null => {
	const key = buildKey(role, refreshToken);
	const cached = getStore().get(key);
	if (!cached) return null;

	if (Date.now() - cached.cachedAt > TTL_MS) {
		getStore().delete(key);
		return null;
	}

	return cached;
};

export const setCachedTokenRefresh = (
	role: Role,
	oldRefreshToken: string,
	data: Pick<CachedTokenRefresh, "primaryValue" | "newAccessToken" | "newRefreshToken">,
) => {
	getStore().set(buildKey(role, oldRefreshToken), { ...data, cachedAt: Date.now() });
};
