// 요청 Method별 빠른 처리하기 위한

import { backendInstance, nextApiInstance } from "./axiosInstance";

const getInstance = (url: string) => {
	return nextApiInstance; // Next.js API
	console.log("url", url);
	if (url.startsWith("/api")) {
		console.log("nextApiInstance");
		return nextApiInstance; // Next.js API
	} else {
		console.log("backendInstance", process.env.NEXT_PUBLIC_BASE_URL);
		return backendInstance; // Springboot API
	}
};

// pathString 처리
const pathStringFilter = (url: string, json?: any) => {
	url = url.replace(/:([^/]+)/g, (match, paramName) => {
		if (json[paramName] != undefined) {
			const changeStr = json[paramName];
			delete json[paramName];
			return changeStr;
		} else {
			console.log("not pathstring");
			return match;
		}
	});
	return [url, json];
};

// get
export const getNormal = (url: string, json?: any, headers?: string) => {
	const instance = getInstance(url);
	[url, json] = pathStringFilter(url, json);
	url = url.replace(/ /gi, "%20");
	const queryString = json ? `?${new URLSearchParams(json).toString()}` : "";
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return instance.get(url + queryString, headersObj);
};

// put urlFormData
export const putUrlFormData = (url: string, params: any, headers?: string) => {
	const instance = getInstance(url);
	[url, params] = pathStringFilter(url, params);
	const urlFormData = new URLSearchParams(params);
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return instance.put(url, urlFormData, headersObj);
};

// download
export const getDownload = (url: string, json?: any, headers?: string) => {
	const instance = getInstance(url);
	[url, json] = pathStringFilter(url, json);
	url = url.replace(/ /gi, "%20");
	const queryString = json ? `?${new URLSearchParams(json).toString()}` : "";
	const headersObj: any = { responseType: "blob" };
	if (headers) headersObj.headers = headers;
	return instance.get(url + queryString, headersObj);
};

// post body
export const postJson = (url: string, params: any, headers?: string) => {
	const instance = getInstance(url);
	[url, params] = pathStringFilter(url, params);
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return instance.post(url, params, headersObj);
};

// post formData
export const postFormData = (url: string, params: any, headers?: string) => {
	const instance = getInstance(url);
	[url, params] = pathStringFilter(url, params);
	const formData = new FormData();
	Object.entries(params).map((v: [string, any]) => {
		if (v[1] instanceof Array || v[1] instanceof FileList) {
			for (let value of v[1]) {
				formData.append(v[0], value);
			}
		} else {
			formData.append(v[0], v[1]);
		}
	});
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return instance.post(url, formData, headersObj);
};

// post urlFormData
export const postUrlFormData = (url: string, params: any, headers?: string) => {
	const instance = getInstance(url);
	[url, params] = pathStringFilter(url, params);
	const urlFormData = new URLSearchParams(params);
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return instance.post(url, urlFormData, headersObj);
};

// delete
export const deleteNormal = (url: string, json?: any) => {
	const instance = getInstance(url);
	[url, json] = pathStringFilter(url, json);
	url = url.replace(/ /gi, "%20");
	const queryString = json ? `?${new URLSearchParams(json).toString()}` : "";
	return instance.delete(url + queryString);
};
