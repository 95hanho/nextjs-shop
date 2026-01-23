import { NextRequest } from "next/server";

export const getStringParam = (req: NextRequest, key: string) => req.nextUrl.searchParams.get(key) ?? undefined;

export const getNumberParam = (req: NextRequest, key: string) => {
	const v = req.nextUrl.searchParams.get(key);
	return v ? Number(v) : undefined;
};
