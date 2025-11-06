export interface BaseResponse {
	msg: string;
	code?: number; // 선택적 필드
}
export interface ApiError {
	/** 사용자에게 보여줄 에러 메시지 */
	msg: string;
	/** HTTP 상태 코드 (0은 FE 네트워크 전용) */
	status: number;
	/** 서버에서 온 상세 데이터 (선택) */
	data?: any;
}
