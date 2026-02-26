"use client";

import { useModalStore } from "@/store/modal.store";
import { useEffect } from "react";

// 모달 테스트
export const ModalTest = () => {
	const { openModal } = useModalStore();

	useEffect(() => {
		// alrt modal 테스트
		// confirm modal 테스트
		// openModal("CONFIRM", {
		// 	title: "테스트 모달",
		// 	content: "모달 테스트입니다. 닫으려면 확인 또는 취소를 눌러주세요.",
		// 	hideCancel: true,
		// });
	}, [openModal]);

	return <></>;
};
