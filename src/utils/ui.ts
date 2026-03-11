/**
 * 유효한 날짜인지 확인
 * @param dateStr YYYYMMDD
 * @returns 유효한 날짜면 true
 */
export const isValidDateString = (dateStr: string): boolean => {
	if (dateStr.length != 8) return false;

	const year = Number(dateStr.slice(0, 4));
	const month = Number(dateStr.slice(4, 6));
	const day = Number(dateStr.slice(6, 8));

	console.log(year, month, day);

	if (year < 1900 || new Date().getFullYear() < year) return false;
	if (month < 1 || 12 < month) return false;
	// 윤년인지
	const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	const daysIsMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (day > daysIsMonth[month - 1]) return false;
	return true;
};
/** 해당 요소가 있는 위치가 스크롤 중앙에 위치하게 */
export const scrollIntoCenter = (element: HTMLElement, extraOffset = 0, behavior: ScrollBehavior = "instant") => {
	const rect = element.getBoundingClientRect();
	const absoluteTop = rect.top + window.pageYOffset;
	const elementCenterY = absoluteTop + rect.height / 2;
	const targetTop = elementCenterY - window.innerHeight / 2 - extraOffset;

	const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
	const clampedTop = Math.max(0, Math.min(targetTop, maxScroll));

	window.scrollTo({ top: clampedTop, behavior });
};
