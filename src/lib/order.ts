/** 주문 상태 라벨을 반환하는 함수 */
export const getOrderStatusLabel = (status: "ORDERED" | "CANCELLED" | "SHIPPED" | "DELIVERED" | "PREPARING") => {
	switch (status) {
		case "ORDERED":
			return "주문 완료";
		case "CANCELLED":
			return "주문 취소";
		case "SHIPPED":
			return "배송 중";
		case "DELIVERED":
			return "배송 완료";
		case "PREPARING":
			return "배송 준비 중";
		default:
			return "알 수 없는 상태";
	}
};
