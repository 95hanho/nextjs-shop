import { SERVER_URL } from "@/lib/env";

/** 업로드 url과 cdn url을 구분하여 반환 */
export const getUploadImageUrl = (path?: string | null) => {
	if (!path) return "";

	// 이미 완전한 URL이면 그대로 사용
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	// 윈도우 절대경로가 넘어오는 경우 파일명만 추출
	const fileName = path.split(/[\\/]/).pop();

	return `${SERVER_URL}/uploads/${fileName}`;
};
