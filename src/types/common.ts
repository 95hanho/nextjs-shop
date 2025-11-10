export interface BaseResponse {
	/** 사용자에게 보여줄 메시지 */
	message: string;
}
export interface ApiError {
	/** 사용자에게 보여줄 에러 메시지 */
	message: string;
	/** HTTP 상태 코드 (0은 FE 네트워크 전용) */
	status: number;
	/** 서버에서 온 상세 데이터 (선택) */
	data?: any;
}
