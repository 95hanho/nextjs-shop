import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export const useQuery기본형태 = (testData: string) => {
	return useQuery({
		// 쿼리 키 - 바뀌는 경우 다른 요청으로 인식. 같을 경우 캐싱데이터 반환함.
		// queryKey: ["surveyQuestion", testData],
		// 2번째 인자에 여러 개 넣을 때는 이렇게
		queryKey: ["surveyQuestion", { testData }],
		// 실제 데이터를 불러오는 비동기 함수.
		queryFn: (): Promise<AxiosResponse> => {
			return getNormal(API_URL.AUTH, { testData });
		},
		// API응답 데이터를 필요한 부분만 가공해서 반환
		// staleTime이 유지되는 동안에는 다시 실행 안함.
		select: (res: AxiosResponse) => {
			return res.data;
		},
		// 해당 쿼리를 실행할지 여부를 제어하는 조건.
		// 해당 파라미터가 없을 시 쿼리 실행이 안되게 해줌.
		enabled: !!testData,
		// enabled: false, // false면 refetch()시에만 실행
		refetchOnWindowFocus: false, // 웹 창에 다시포커스되면 데이터 재요청 할지, 기본값 true(요청함)
		refetchOnReconnect: false, // 네트워크 재연결 시 다시 데이터 재요청 할지, 기본값 true(요청함)
		// queryKey기준 신선한 캐싱 데이터를 저장함.
		// 캐싱데이터는 cacheTime 기준으로 유지되지만 다시 불러올지 정하는 시간임.
		// 이 시간이 지났는데 cacheTime이 남아있으면 기존데이터를 보여주면서 최신데이터 가져와서 바꿈.
		staleTime: 1000 * 60 * 5, // 기본 0. 현재 5분 간
		// queryKey기준 캐싱 데이터를 저장함.
		// 컴포넌트가 언마운트되어도 캐시 데이터를 유지하고 싶을 경우.
		// 사실 상 staleTime이 설정되고 유효함
		/* 없어진듯 */
		// cacheTime: 5 * 60 * 1000, // 기본 해당값(5분).
		// retry: number | boolean, // 기본 3. 실패 시 재시도 횟수, false로 하면 재시도 없음.
	});
};
// 사용시
export const Test = () => {
	const testData = "test";
	const { isSuccess, data, refetch, isLoading, isFetching, error, isError, isPending } = useQuery기본형태(testData);

	// isSuccess : API요청이 성공적으로 됐는지, if(isSuccess) {} 로 성공 시 데이터 어떻게 보여줄지 작성
	// data : 반환된 데이터
	// refetch : 요청 재요청 하기, 수동으로 refetch()하여 요청을 다시 할 수 있음.
	// isLoading : 캐시 데이터도 없고, 처음 컴포넌트 들어와서 해당 쿼리 요청할 때.
	// isFetching : 재요청 포함. 쿼리 요청할 때 마다
	// error : 쿼리 실행 중 오류가 났을 때 throw된 오류 객체값
	// isError : 쿼리 실행 중 오류가 났는지
	// isPending : 캐시데이터도 없고 쿼리도 수행 전에. 최초 실행됨.

	// 예를들어 이런식으로 쓰임
	const [view, setView] = useState<string | null>(null);
	useEffect(() => {
		if (isPending) {
			// 최초 요청 전에 실행
		}
		if (isLoading) {
			// 최초 요청 중에 실행
		}
		if (isSuccess) {
			// 요청 성공
			setView(testData);
		}
		if (isError) {
			// 에러났을 때
			console.log(error);
		}
	}, [isPending, isLoading, isSuccess, isError, testData]);

	useEffect(() => {
		// 재요청 시 마다
	}, [isFetching]);

	return <>{isLoading ? <div className="loding"></div> : <div>{testData}</div>}</>;
};
export const QueryKey_사용 = () => {
	const queryClient = useQueryClient();
	//
	queryClient.invalidateQueries({ queryKey: ["cartList"] });
	//
	queryClient.cancelQueries({ queryKey: ["cartList"] });
	//
	const prevData = queryClient.getQueryData(["cartList"]);
};
/* ----------------------------------- */
export const useMutation_기본형태 = (testData: string) => {
	return useMutation({
		// axios나 fetch
		mutationFn: () => getNormal("123", { testData }, {}),
		// ---- 밑에는 공통으로 처리할 꺼 있을 때만 작성 ----
		// 그 외에는 mutate할 때 분기함.
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate() {
			// 파라미터로 mutate에 넣은 인수가 그대로옴.
		},
		// 요청 성공 시에
		onSuccess(data, b, c) {
			console.log(data, b, c);
			return data;
		},
		// 에러 났을 떄
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(data, err, params, context) {
			console.log(data, err, params, context);
		},
	});
};
