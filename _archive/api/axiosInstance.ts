// Axios 인스턴스 생성 및 설정
import axios from "axios";

// const instance = axios.create({
// 	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
// 	timeout: 10000,
// });

// Next.js API 요청 인스턴스
const nextApiInstance = axios.create({
	baseURL: "", // Next.js 내부 API 요청이므로 baseURL 필요 없음
	timeout: 10000,
	withCredentials: true, // 세션 쿠키 포함
});

// Spring Boot API 요청 인스턴스
const backendInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
	timeout: 10000,
	withCredentials: true, // 세션 쿠키 포함
});

// 토큰체크 안하는 url
const notTokenCheckUrl: string[] = [];

// 요청 성공
const requestFulfill = async (res: any) => {
	console.log(res.url);
	// testlog(res.method);

	if (!notTokenCheckUrl.includes(res.url)) {
	}
	// reToken될 떄는 솔직히 aToken검사할 필요 없음. 어차피 새로 저장될꺼니까!
	// const aToken = cookies.get("accessToken");
	// testlog(aToken);
	// if (aToken) res.headers["Expert-Access"] = aToken;

	return res;
};
// 요청 에러
const requestReject = (err: any) => {
	return Promise.reject(err.response);
};
// 응답 성공
const responseFulfill = (res: any) => {
	// if(res.config.method === 'get') {
	// 	cache.set(res.config.url, res.data);
	// }
	return res;
};
// 응답 에러
const responseReject = (err: any) => {
	console.log("에러발생 : ", err.config.url);
	console.log(err);
	return Promise.reject(err);
};

backendInstance.interceptors.request.use(requestFulfill, requestReject);

backendInstance.interceptors.response.use(responseFulfill, responseReject);

nextApiInstance.interceptors.request.use(requestFulfill, requestReject);

nextApiInstance.interceptors.response.use(responseFulfill, responseReject);

export { backendInstance, nextApiInstance };
