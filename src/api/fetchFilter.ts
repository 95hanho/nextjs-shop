// fetchFilters.ts
type Primitive = string | number | boolean;
type ParamValue = Primitive | Blob | File | FileList | Primitive[] | undefined;

export type Params = Record<string, ParamValue>;
export type HeadersMap = Record<string, string>;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""; // BFF만 쓰면 ''로 둬도 OK
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

// 공통 fetch 래퍼: ok 체크 + JSON/텍스트/빈 응답 처리
async function http<T>(url: string, init?: RequestInit & { baseUrl?: string; timeoutMs?: number }): Promise<T> {
	const fullUrl = (init?.baseUrl ?? BASE_URL) + url;
	const { timeoutMs = 20000, ...rest } = init ?? {};
	const timer = withTimeout(timeoutMs);

	try {
		const res = await fetch(fullUrl, {
			credentials: "include", // 쿠키 인증 기본
			cache: "no-store", // 개인화 API 기본
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
		const raw = ct.includes("application/json")
			? await res.json().catch(async () => ({ _raw: await res.text() }))
			: ct.startsWith("text/") || ct.includes("application/xml")
			? await res.text()
			: await res.blob();

		if (!res.ok) {
			const msg =
				(typeof raw === "object" && raw && ("msg" in raw || "message" in raw)
					? (raw as any).msg ?? (raw as any).message
					: typeof raw === "string"
					? raw
					: res.statusText) || "REQUEST_FAILED";
			console.log("132123123", msg, res.status, raw);
			const error = Object.assign(new Error(msg), { status: res.status, data: raw });
			console.log(error);
			throw error;
		}

		return raw as T;
	} finally {
		timer.clear();
	}
}

// ---- 메서드별 헬퍼 ----

// GET (쿼리스트링)
export function getNormal<T>(url: string, params?: Params, headers?: HeadersMap) {
	const [u2, rest] = applyPathParams(url, cloneParams(params));
	const qs = rest && Object.keys(rest).length > 0 ? `?${toSearchParams(rest).toString()}` : "";
	// 공백 인코딩
	const safeUrl = (u2 + qs).replace(/ /g, "%20");
	return http<T>(safeUrl, { headers });
}

// 파일 다운로드 (Blob + 에러 파싱)
export async function getDownload(url: string, params?: Params, headers?: HeadersMap) {
	const [u2, rest] = applyPathParams(url, cloneParams(params));
	const qs = rest && Object.keys(rest).length > 0 ? `?${toSearchParams(rest).toString()}` : "";
	const blob = await http<Blob>((u2 + qs).replace(/ /g, "%20"), {
		headers,
	});
	return blob;
}

// POST JSON
export function postJson<T>(url: string, params: Params, headers?: HeadersMap) {
	const [u2, body] = applyPathParams(url, cloneParams(params));
	return http<T>(u2, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...headers },
		body: JSON.stringify(body ?? {}),
	});
}

// POST FormData (Content-Type 설정 X: 브라우저가 boundary 포함 설정)
export function postFormData<T>(url: string, params: Params, headers?: HeadersMap) {
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

export function postUrlFormData<T>(url: string, params: Params, headers?: HeadersMap) {
	const [u2, body] = applyPathParams(url, cloneParams(params));
	return http<T>(u2, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
		body: urlEncodedBody(body),
	});
}

export function putUrlFormData<T>(url: string, params: Params, headers?: HeadersMap) {
	const [u2, body] = applyPathParams(url, cloneParams(params));
	return http<T>(u2, {
		method: "PUT",
		headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
		body: urlEncodedBody(body),
	});
}

// DELETE (쿼리스트링)
export function deleteNormal<T>(url: string, params?: Params, headers?: HeadersMap) {
	const [u2, rest] = applyPathParams(url, cloneParams(params));
	const qs = rest && Object.keys(rest).length > 0 ? `?${toSearchParams(rest).toString()}` : "";
	return http<T>((u2 + qs).replace(/ /g, "%20"), {
		method: "DELETE",
		headers,
	});
}
