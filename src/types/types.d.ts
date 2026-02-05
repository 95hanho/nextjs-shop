/* 글로벌 타입 지정 파일 */
declare global {
	interface Window {
		kakao: {
			Postcode: new (options: {
				oncomplete: (data: { userSelectedType: string; roadAddress: string; jibunAddress: string; zonecode: string }) => void;
			}) => {
				open: (options?: { popupKey?: string }) => void;
			};
		};
	}

	const kakao: Window["kakao"];
}

export {};
