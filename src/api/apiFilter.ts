// 요청 Method별 빠른 처리하기 위한
import axios from "axios";

// pathString 처리
const pathString_filter = (url: string, json?: any) => {
	url = url.replace(/:([^/]+)/g, (match, param_name) => {
		if (json[param_name] != undefined) {
			const change_str = json[param_name];
			delete json[param_name];
			return change_str;
		} else {
			console.log("not pathstring");
			return match;
		}
	});
	return [url, json];
};

// get
export const get_normal = (url: string, json?: any, headers?: string) => {
	[url, json] = pathString_filter(url, json);
	url = url.replace(/ /gi, "%20");
	let queryString = "";
	if (json && Object.entries(json).length > 0) {
		queryString += "?";
		for (let key in json) {
			if (queryString.indexOf("?") !== queryString.length - 1) {
				queryString += "&";
			}
			queryString += `${key}=${json[key]}`;
		}
	}
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return axios.get(url + queryString, headersObj);
};

// put urlFormData
export const put_urlFormData = (url: string, params: any, headers: string) => {
	[url, params] = pathString_filter(url, params);
	const url_form_data = new URLSearchParams(params);
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return axios.put(url, url_form_data, headersObj);
};

// download
export const get_download = (url: string, json: any, headers: string) => {
	[url, json] = pathString_filter(url, json);
	url = url.replace(/ /gi, "%20");
	let queryString = "";
	if (json && Object.entries(json).length > 0) {
		queryString += "?";
		for (let key in json) {
			if (queryString.indexOf("?") !== queryString.length - 1) {
				queryString += "&";
			}
			queryString += `${key}=${json[key]}`;
		}
	}
	const headersObj: any = { responseType: "blob" };
	if (headers) headersObj.headers = headers;
	return axios.get(url + queryString, headersObj);
};

// post body
export const post_json = (url: string, params: any, headers: string) => {
	[url, params] = pathString_filter(url, params);
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return axios.post(url, params, headersObj);
};

// post formData
export const post_formData = (url: string, params: any, headers: string) => {
	[url, params] = pathString_filter(url, params);
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
	return axios.post(url, formData, headersObj);
};

// post urlFormData
export const post_urlFormData = (url: string, params: any, headers: string) => {
	[url, params] = pathString_filter(url, params);
	const url_form_data = new URLSearchParams(params);
	const headersObj: any = {};
	if (headers) headersObj.headers = headers;
	return axios.post(url, url_form_data, headersObj);
};

// delete
export const delete_normal = (url: string, json: any) => {
	[url, json] = pathString_filter(url, json);
	url = url.replace(/ /gi, "%20");
	let queryString = "";
	if (json && Object.entries(json).length > 0) {
		queryString += "?";
		for (let key in json) {
			if (queryString.indexOf("?") !== queryString.length - 1) {
				queryString += "&";
			}
			queryString += `${key}=${json[key]}`;
		}
	}
	return axios.delete(url + queryString);
};
