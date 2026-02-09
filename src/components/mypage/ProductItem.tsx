// import { BsExclamationCircle } from "react-icons/bs";
// import styles from "./ProductItem.module.scss";
// import { ImageFill } from "@/components/common/ImageFill";
// import { WishButton } from "@/components/product/WishButton";
// import { money } from "@/lib/format";
// import { CartItem } from "@/types/mypage";
// import { IoIosClose } from "react-icons/io";

// interface ProductItemProps {
// 	product: CartItem;
// }

// export const ProductItem = ({ product }: ProductItemProps) => {
// 	const selectDisabled = product.stock < product.quantity;

// 	let productAlarm = "";
// 	if (product.stock !== 0 && selectDisabled) {
// 		productAlarm = "재고가 부족합니다. 옵션을 변경하시면 선택이 가능합니다.";
// 	}

// 	return (
// 		<li key={"cartBrandItem-" + product.cartId} className={styles.productItem} data-sku="DEN0861">
// 			{/* 상품 체크 */}
// 			<div className={styles.productItemCheck}>
// 				<input
// 					id="item-DEN0861"
// 					type="checkbox"
// 					className="checkbox"
// 					checked={product.selected}
// 					disabled={selectDisabled}
// 					onChange={async () => {
// 						await handleChangeSelected.mutateAsync({
// 							cartIdList: [product.cartId],
// 							selected: !product.selected,
// 						});
// 						queryClient.invalidateQueries({ queryKey: ["cartList"] });
// 					}}
// 				/>
// 			</div>

// 			<div className={styles.productItemSection}>
// 				<div className={styles.productItemOverview}>
// 					<div className={styles.productItemMedia}>
// 						<a href="" className={styles.productItemThumb}>
// 							<ImageFill src={product.filePath} alt={product.fileName} />

// 							{selectDisabled && (
// 								<div className={styles.productOutOfStockCover}>
// 									<span className={styles.productOutOfStockSticker}>
// 										{product.stock === 0 && "품절"}
// 										{product.stock !== 0 && selectDisabled && "재고부족"}
// 									</span>
// 								</div>
// 							)}
// 						</a>

// 						<WishButton productId={product.productId} initWishOn={product.wishId !== null} />
// 					</div>

// 					<div className={styles.productItemContent}>
// 						<div className={styles.productItemInfo}>
// 							<a href="" className={styles.productItemName}>
// 								{product.productName}
// 							</a>

// 							<p className={styles.productItemOption}>
// 								{product.size} / {product.quantity}개
// 							</p>

// 							{/* 10개 이하 시에 표시 */}
// 							{product.stock < 10 && (
// 								<div className={styles.productItemWarning}>
// 									<span>품절임박 {product.stock}개 남음</span>
// 								</div>
// 							)}

// 							<div className={styles.productItemPrices}>
// 								<h5 className={`${styles.price} ${styles.priceSale}`}>
// 									<del>129,000원</del>
// 								</h5>
// 								<h5 className={`${styles.price} ${styles.priceOrigin}`}>
// 									<span>{money(product.finalPrice)}원</span>
// 								</h5>
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				{productAlarm && <p className={styles.productAlert}>* {productAlarm}</p>}

// 				<h5 className={styles.productItemDelivery}>
// 					<b>10.02(목) 도착 예정</b>
// 					<span>
// 						<BsExclamationCircle />
// 					</span>
// 				</h5>

// 				<div className={styles.productItemActions}>
// 					<button className="btn btn--ghost" onClick={() => openOptionChangeModal(product)}>
// 						옵션 변경
// 					</button>
// 					<button className="btn btn--ghost">쿠폰 사용</button>
// 				</div>
// 			</div>

// 			<div className={styles.productItemDelete}>
// 				<button
// 					onClick={() => {
// 						setDeletingCartIdList([product.cartId]);
// 						cartDeleteModalOpen("해당 제품을 장바구니에서 삭제하시겠습니까?");
// 					}}
// 				>
// 					<IoIosClose />
// 				</button>
// 			</div>
// 		</li>
// 	);
// };
