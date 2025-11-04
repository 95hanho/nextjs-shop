import { authService } from "@/api";
import useAuth from "@/hooks/useAuth";
import { LoginForm, loginResponse } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function useLogin() {
	const router = useRouter();
	const { loginToken } = useAuth();

	return useMutation({
		mutationFn: (obj: LoginForm) => authService.login(obj),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess({ data }: { data: loginResponse }) {
			console.log(data);
			alert("로그인!");
			loginToken(data.accessToken, data.refreshToken);
			router.push("/");
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(data, err, params, context) {
			// console.log(data, err, params, context);
		},
	});
}
