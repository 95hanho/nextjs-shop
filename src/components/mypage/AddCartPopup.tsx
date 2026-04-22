import clsx from "clsx";
import styles from "./AddCartPopup.module.scss";
import { useEffect, useState } from "react";

interface AddCartPopupProps {
	triggerKey: number;
	productId?: number;
	curProductId?: number;
}

// 장바구니 담기 완료 팝업
export const AddCartPopup = ({ triggerKey, productId, curProductId }: AddCartPopupProps) => {
	// 2) [useState / useRef] ----------------------------------------------
	// 장바구니 담기 팝업
	const [cartPopupOpen, setCartPopupOpen] = useState(false);
	const [cartPopupClose, setCartPopupClose] = useState(false);

	// 6) [useEffect] ------------------------------------------------------
	// triggerKey가 바뀔 때마다 팝업 열기
	useEffect(() => {
		if (triggerKey === 0) return;

		if (productId !== undefined && curProductId !== undefined && productId !== curProductId) return; // 현재 상품과 다른 상품의 담기 이벤트는 무시

		setCartPopupOpen(true);
		setCartPopupClose(false);
	}, [triggerKey, productId, curProductId]);
	// 장바구니 담기 팝업 애니메이션 및 자동 닫힘
	useEffect(() => {
		if (!cartPopupOpen) return;
		const closeTimer = setTimeout(() => {
			setCartPopupClose(true);
		}, 2000);
		return () => clearTimeout(closeTimer);
	}, [cartPopupOpen]);

	if (!cartPopupOpen) return null;
	return (
		<div
			className={clsx(styles.addCartPopup, cartPopupClose && "animateFadeOut")}
			onAnimationEnd={() => {
				if (!cartPopupClose) return;
				setCartPopupOpen(false);
				setCartPopupClose(false);
			}}
		>
			<p>
				장바구니에
				<br />
				담겼습니다.
			</p>
		</div>
	);
};
