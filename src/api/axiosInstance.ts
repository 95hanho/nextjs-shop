// Axios 인스턴스 생성 및 설정
import axios from "axios";
import API_URL from "./endpoints";

const instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
	timeout: 10000,
});
// 토큰체크 안하는 url
const notTokenCheckUrl: string[] = [];

instance.interceptors.request.use(
	async (res: any) => {
		console.log(res.url);
		// testlog(res.method);

		if (!notTokenCheckUrl.includes(res.url)) {
		}
		// reToken될 떄는 솔직히 aToken검사할 필요 없음. 어차피 새로 저장될꺼니까!
		// const aToken = cookies.get("access_token");
		// testlog(aToken);
		// if (aToken) res.headers["Expert-Access"] = aToken;

		return res;
	},
	(err: any) => {
		return Promise.reject(err.response);
	}
);

instance.interceptors.response.use(
	(res: any) => {
		// if(res.config.method === 'get') {
		// 	cache.set(res.config.url, res.data);
		// }
		return res;
	},
	(err: any) => {
		console.log("에러발생 : ", err.config.url);
		console.log(err);
		return Promise.reject(err);
	}
);

export default instance;
