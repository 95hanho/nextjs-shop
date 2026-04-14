import { SERVER_URL } from "@/lib/env";

export const getUploadImageUrl = (storeName?: string | null) => {
	if (!storeName) return "";
	return `${SERVER_URL}/uploads/${storeName}`;
};
