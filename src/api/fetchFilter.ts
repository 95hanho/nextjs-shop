import { HttpError, isHttpError, isRecord } from "@/api/error";
import { BASE_URL } from "@/lib/env";

// fetchFilters.ts
type Primitive = string | number | boolean;
type ParamValue = Primitive | Blob | File | FileList | Primitive[] | undefined;

export type Params = Record<string, ParamValue>;
type AuthorizationHeader = `Bearer ${string}`;
export type RequestHeaders = {
	Authorization?: AuthorizationHeader;
	"user-agent"?: string;
	"x-forwarded-for"?: string;
} & Record<string, string>;

const isServer = typeof window === "undefined";

// ---- 공통 유틸 ----
const cloneParams = (params?: Params): Params | undefined => (params ? { ...params } : undefined);

// :id 같은 path param 치환 (원본 불변)
const applyPathParams = (url: string, params?: Params): [string, Params | undefined] => {
	if (!params) return [url, params];
	const rest: Params = { ...params };
	const newUrl = url.replace(/:([^/]+)/g, (_, name: string) => {
		if (rest[name] !== undefined) {
			const v = rest[name];
			delete rest[name];
			return String(Array.isArray(v) ? v[0] : v);
		}
		return _;
	});
	return [newUrl, rest];
};

// type JsonPrimitive = string | number | boolean | null;
// type PathParamFromBody = JsonPrimitive | JsonPrimitive[];
type BodyLike = object;

// JSON body용 :id 치환 헬퍼
const applyPathParamsFromBody = <T extends BodyLike | undefined>(url: string, body: T): [string, T] => {
	if (!body) return [url, body];

	const rest = { ...(body as Record<string, unknown>) };

	const newUrl = url.replace(/:([^/]+)/g, (_, name: string) => {
		if (Object.prototype.hasOwnProperty.call(rest, name)) {
			const v = rest[name];
			delete rest[name];

			if (Array.isArray(v)) return String(v[0] ?? "");
			if (v === null) return "null";
			if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
		}
		return _;
	});

	return [newUrl, rest as T];
};

const toSearchParams = (params: Params): URLSearchParams => {
	const search = new URLSearchParams();
	for (const key of Object.keys(params)) {
		const value = params[key];
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			for (const item of value) search.append(key, String(item));
		} else {
			search.append(key, String(value));
		}
	}
	return search;
};

// Abort + timeout
const withTimeout = (ms: number) => {
	const ctrl = new AbortController();
	const id = setTimeout(() => ctrl.abort(), ms);
	return { signal: ctrl.signal, clear: () => clearTimeout(id) };
};

const extractMessage = (raw: unknown, fallback: string) => {
	// Spring이 {message:"..."}로 내려주는 케이스
	if (isRecord(raw)) {
		const msg = raw["msg"];
		if (typeof msg === "string" && msg.trim()) return msg;

		const message = raw["message"];
		if (typeof message === "string" && message.trim()) return message;
	}

	// text/plain 응답
	if (typeof raw === "string" && raw.trim()) return raw;

	return fallback;
};

// 공통 fetch 래퍼: ok 체크 + JSON/텍스트/빈 응답 처리
async function http<T>(url: string, init?: RequestInit & { baseUrl?: string; timeoutMs?: number }): Promise<T> {
	const fullUrl = (init?.baseUrl ?? BASE_URL) + url;
	const { timeoutMs = 20000, ...rest } = init ?? {};
	const timer = withTimeout(timeoutMs);

	try {
		const res = await fetch(fullUrl, {
			credentials: "include",
			cache: "no-store",
			...rest,
			signal: timer.signal,
			headers: {
				Accept: "application/json, text/plain, */*",
				...(rest.headers ?? {}),
			},
		});

		// 204 no content
		if (res.status === 204) return undefined as unknown as T;

		const ct = res.headers.get("content-type") ?? "";

		let raw: unknown;
		if (ct.includes("application/json")) {
			raw = await res.json().catch(async () => ({ _raw: await res.text() }));
		} else if (ct.startsWith("text/") || ct.includes("application/xml")) {
			raw = await res.text();
		} else {
			raw = await res.blob();
		}

		if (!res.ok) {
			const message = extractMessage(raw, res.statusText || "REQUEST_FAILED");
			const err: HttpError = { message, status: res.status, data: raw, url };
			throw err;
		}

		return raw as T;
	} catch (err: unknown) {
		// 타임아웃
		if (err instanceof DOMException && err.name === "AbortError") {
			const status = isServer ? 504 : 0;
			const e: HttpError = { message: "REQUEST_TIMEOUT", status, data: null, url };
			throw e;
		}

		// 네트워크 실패 (브라우저/노드 환경에서 fetch 실패)
		if (err instanceof TypeError) {
			const status = isServer ? 502 : 0;
			const e: HttpError = { message: "NETWORK_ERROR", status, data: null, url };
			throw e;
		}

		// 우리가 던진 HttpError면 그대로 전달
		if (isHttpError(err)) throw err;

		// 그 외 알 수 없는 에러
		const e: HttpError = { message: "SERVER_ERROR", status: 500, data: err, url };
		throw e;
	} finally {
		timer.clear();
	}
}

// ---- 메서드별 헬퍼 ----

// GET (쿼리스트링)
export function getNormal<T>(url: string, params?: Params, headers?: RequestHeaders) {
	const [u2, rest] = applyPathParams(url, cloneParams(params));
	const qs = rest && Object.keys(rest).length > 0 ? `?${toSearchParams(rest).toString()}` : "";
	// 공백 인코딩
	const safeUrl = (u2 + qs).replace(/ /g, "%20");
	return http<T>(safeUrl, { headers });
}

// 파일 다운로드 (Blob + 에러 파싱)
export async function getDownload(url: string, params?: Params, headers?: RequestHeaders) {
	const [u2, rest] = applyPathParams(url, cloneParams(params));
	const qs = rest && Object.keys(rest).length > 0 ? `?${toSearchParams(rest).toString()}` : "";
	const blob = await http<Blob>((u2 + qs).replace(/ /g, "%20"), {
		headers,
	});
	return blob;
}

// POST JSON
export function postJson<TRes, TBody extends object = object>(url: string, body?: TBody, headers?: RequestHeaders) {
	const [u2, restBody] = applyPathParamsFromBody(url, body);
	return http<TRes>(u2, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...(headers ?? {}) },
		body: JSON.stringify(restBody ?? {}),
	});
}

// POST FormData (Content-Type 설정 X: 브라우저가 boundary 포함 설정)
export function postFormData<T>(url: string, params: Params, headers?: RequestHeaders) {
	const [u2, body] = applyPathParams(url, cloneParams(params));
	const formData = new FormData();

	if (body) {
		Object.entries(body).forEach(([key, value]) => {
			if (Array.isArray(value) || value instanceof FileList) {
				for (const v of value) {
					formData.append(key, v instanceof Blob ? v : String(v)); // 파일(File, Blob)이면 그대로 넘겨야 함.
				}
			} else if (value !== undefined) {
				formData.append(key, value instanceof Blob ? value : String(value)); // 파일(File, Blob)이면 그대로 넘겨야 함.
			}
		});
	}

	return http<T>(u2, {
		method: "POST",
		headers, // Content-Type 넣지 마세요
		body: formData,
	});
}

// x-www-form-urlencoded (POST/PUT 공용 빌더)
function urlEncodedBody(params?: Params) {
	const sp = new URLSearchParams();
	if (params) {
		Object.entries(params).forEach(([k, v]) => {
			if (v === undefined) return;
			if (Array.isArray(v)) v.forEach((i) => sp.append(k, String(i)));
			else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") sp.append(k, String(v));
			// Blob/File은 지원 X
		});
	}
	return sp.toString();
}

export function postUrlFormData<T>(url: string, params: Params, headers?: RequestHeaders) {
	const [u2, body] = applyPathParams(url, cloneParams(params));
	return http<T>(u2, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
		body: urlEncodedBody(body),
	});
}

export function putUrlFormData<T>(url: string, params: Params, headers?: RequestHeaders) {
	const [u2, body] = applyPathParams(url, cloneParams(params));
	return http<T>(u2, {
		method: "PUT",
		headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
		body: urlEncodedBody(body),
	});
}

// PUT JSON
export function putJson<TRes, TBody extends object = object>(url: string, body?: TBody, headers?: RequestHeaders) {
	const [u2, restBody] = applyPathParamsFromBody(url, body);
	return http<TRes>(u2, {
		method: "PUT",
		headers: { "Content-Type": "application/json", ...(headers ?? {}) },
		body: JSON.stringify(restBody ?? {}),
	});
}

// DELETE (쿼리스트링)
export function deleteNormal<T>(url: string, params?: Params, headers?: RequestHeaders) {
	const [u2, rest] = applyPathParams(url, cloneParams(params));
	const qs = rest && Object.keys(rest).length > 0 ? `?${toSearchParams(rest).toString()}` : "";
	return http<T>((u2 + qs).replace(/ /g, "%20"), {
		method: "DELETE",
		headers,
	});
}
