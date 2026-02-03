import type { ISODate, ISODateTimeLocal } from "@/types/common";

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * "2024-01-12", "2024/01/12"
 * → "2024-01-12"
 */
export const parseISODate = (value: string): ISODate => {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid date format: ${value}`);
	}

	const y = date.getFullYear();
	const m = pad2(date.getMonth() + 1);
	const d = pad2(date.getDate());

	return `${y}-${m}-${d}` as ISODate;
};

/**
 * "2024-01-12 13:20"
 * "2024/01/12 13:20:30"
 * → "2024-01-12T13:20:00" | "2024-01-12T13:20:30"
 */
export const parseISODateTimeLocal = (value: string): ISODateTimeLocal => {
	// Date는 "YYYY-MM-DD HH:mm:ss"를 못 알아보는 경우가 있어서
	// 공백을 T로 치환
	const normalized = value.replace(" ", "T");
	const date = new Date(normalized);

	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid datetime format: ${value}`);
	}

	const y = date.getFullYear();
	const m = pad2(date.getMonth() + 1);
	const d = pad2(date.getDate());
	const hh = pad2(date.getHours());
	const mm = pad2(date.getMinutes());
	const ss = pad2(date.getSeconds());

	return `${y}-${m}-${d}T${hh}:${mm}:${ss}` as ISODateTimeLocal;
};
