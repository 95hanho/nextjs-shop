//
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""; // BFF만 쓰면 ''로 둬도 OK
/** 사진없음 이미지 */
export const BASIC_NO_IMAGE = process.env.NEXT_PUBLIC_BASIC_NO_IMAGE || "";
// 업로드 사진 경로
export const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL ?? "";
/** 마일리지 적립률 */
export const MILEAGE_RATE = isNaN(Number(process.env.MILEAGE_RATE)) ? 0.01 : Number(process.env.MILEAGE_RATE);
