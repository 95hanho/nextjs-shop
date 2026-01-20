export type HttpError = {
	message: string;
	status: number;
	data: unknown;
	url: string;
};

export const isRecord = (v: unknown): v is Record<string, unknown> => {
	return typeof v === "object" && v !== null;
};

export const isHttpError = (err: unknown): err is HttpError => {
	return isRecord(err) && typeof err.message === "string" && typeof err.status === "number" && typeof err.url === "string" && "data" in err;
};
//
const isPlainObject = (v: unknown): v is Record<string, unknown> => isRecord(v) && !Array.isArray(v);
//
export type ErrorResponse = {
	status: number;
	payload: Record<string, unknown>;
};
// nextAPI 공통 에러처리
export const toErrorResponse = (err: unknown): ErrorResponse => {
	if (isHttpError(err)) {
		const status = Number.isInteger(err.status) ? err.status : 500;
		const safeStatus = status === 0 ? 502 : status;

		const payload = isPlainObject(err.data) ? err.data : { message: err.message || "SERVER_ERROR" };

		return { status: safeStatus, payload };
	}

	return {
		status: 500,
		payload: { message: err instanceof Error ? err.message : "SERVER_ERROR" },
	};
};
