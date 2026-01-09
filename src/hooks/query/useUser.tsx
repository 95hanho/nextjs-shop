"use client";

import { authService } from "@/api";
import { JoinForm } from "@/types/form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useAuth from "../useAuth";

export default function useUser() {
	const router = useRouter();
	const { loginToken } = useAuth();
	//
	const handleRegister = useMutation({
		mutationFn: (joinForm: JoinForm) => authService.joinUser(joinForm),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess({ data }) {
			console.log(data);
			alert("회원가입이 완료되었습니다.");
			router.push("/user");
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(a, b) {
			console.log(a, b);
		},
	});

	const handleIdDuplcheck = useMutation({
		mutationFn: (userId: string) => authService.idDuplcheck({ userId }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess({ data }) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(a, b) {},
	});

	return { handleLogin, handleRegister, handleIdDuplcheck };
}
