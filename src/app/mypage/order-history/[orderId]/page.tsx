import OrderDetailClient from "@/app/mypage/order-history/[orderId]/OrderDetailClient";

export default function OrderDetailPage({
	params: { orderId },
}: {
	params: {
		orderId: string;
	};
}) {
	return (
		<main id="orderDetail">
			<OrderDetailClient orderId={orderId} />;
		</main>
	);
}
