import clsx from "clsx";
import styles from "./AddCartPopup.module.scss";
import { useEffect, useState } from "react";

interface AddCartPopupProps {
	triggerKey: number;
}

// 장바구니 담기 완료 팝업
export const AddCartPopup = ({ triggerKey }: AddCartPopupProps) => {
	// 장바구니 담기 팝업
	const [cartPopupOpen, setCartPopupOpen] = useState(false);
	const [cartPopupClose, setCartPopupClose] = useState(false);

	// triggerKey가 바뀔 때마다 팝업 열기
	useEffect(() => {
		if (triggerKey === 0) return;

		setCartPopupOpen(true);
		setCartPopupClose(false);
	}, [triggerKey]);

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
