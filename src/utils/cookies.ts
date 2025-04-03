export const cookies = {
	/**
	 * 쿠키 만들기
	 * @param {*} name 이름
	 * @param {*} value 값
	 * @param {*} seconds 지속시간(초)
	 */
	set(name: string, value: string, seconds: number) {
		const date = new Date();
		date.setTime(date.getTime() + seconds * 1000);
		const expires = "expires=" + date.toUTCString();
		const maxAge = "max-age=" + seconds; // 추가
		const secureFlag = location.protocol === "https:" ? "; Secure" : "";
		document.cookie = `${name}=${value}; ${expires}; ${maxAge}; path=/;${secureFlag}`;
	},
	/**
	 * 쿠키 가져오기
	 * @param {*} name 이름
	 * @returns 값
	 */
	get(name: string) {
		const decodedCookie = decodeURIComponent(document.cookie);
		const cookies = decodedCookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.startsWith(name + "=")) {
				return cookie.substring(name.length + 1, cookie.length);
			}
		}
		return null;
	},
	/**
	 * 쿠키 삭제
	 * @param {*} name 이름
	 */
	remove(name: string) {
		document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	},
	/**
	 * 쿠키가 존재하는지 확인
	 * @param {string} name 쿠키 이름
	 * @returns {boolean} 존재 여부
	 */
	has(name: string): boolean {
		return document.cookie.split("; ").some((cookie) => cookie.startsWith(name + "="));
	},
};
