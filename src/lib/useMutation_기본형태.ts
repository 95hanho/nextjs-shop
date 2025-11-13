import { getNormal } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import { getBaseUrl } from "./getBaseUrl";
import API_URL from "@/api/endpoints";

// 동작이름(한글)
const handle동작이름 = useMutation({
	mutationFn: (userId: string) => getNormal<BaseResponse>(getBaseUrl(API_URL.USER_ID), { userId }),
	// Mutation이 시작되기 직전에 특정 작업을 수행
	onMutate(a) {
		console.log(a);
	},
	onSuccess(data) {
		console.log(data);
	},
	onError(err) {
		console.log(err);
	},
	// 결과에 관계 없이 무언가 실행됨
	onSettled(a, b) {},
});
