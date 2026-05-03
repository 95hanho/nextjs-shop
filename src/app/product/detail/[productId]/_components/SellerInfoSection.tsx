import BrandOtherProducts from "@/app/product/detail/[productId]/_components/BrandOtherProducts";
import styles from "../ProductDetail.module.scss";
import { ProductDetailResponse, SellerLikeAndOtherProductsResponse, OtherProduct } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useParams } from "next/navigation";

export default function SellerInfoSection({ productDetail }: { productDetail: ProductDetailResponse }) {
	// 1) [store / custom hooks] -------------------------------------------
	const params = useParams<{
		productId: string;
	}>();
	const productId = Number(params.productId);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 판매자 좋아요 여부 및 판매자 다른 제품 조회
	const {
		data: { sellerOtherProducts } = {
			sellerOtherProducts: [],
		},
	} = useQuery<SellerLikeAndOtherProductsResponse, Error, { sellerOtherProducts: OtherProduct[] }>({
		queryKey: ["sellerLikeAndOtherProducts", productId],
		queryFn: async () =>
			getNormal(getApiUrl(API_URL.PRODUCT_SELLER_LIKE_OTHER_PRODUCT), {
				productId: productId,
			}),
		enabled: !!productId,
		select: (data) => ({
			sellerOtherProducts: data.sellerOtherProducts,
		}),
	});
	// 판매자 좋아요/취소
	// const { mutate: toggleSellerLike } = useMutation({
	// 	mutationFn: async (liked: boolean) => {
	// 		console.log("toggleSellerLike", { productId, like: !liked });
	// 		return postJson(getApiUrl(API_URL.PRODUCT_SELLER_LIKE), { productId, like: !liked });
	// 	},
	// 	onSuccess() {
	// 		queryClient.invalidateQueries({ queryKey: ["sellerLikeAndOtherProducts", productId] });
	// 	},
	// });

	return (
		<article className={styles.sellerInfoSection}>
			<h2>판매자정보</h2>

			<table>
				<tbody>
					{productDetail.sellerName && (
						<tr>
							<th>주식회사</th>
							<td>
								{productDetail.sellerName}
								{productDetail.sellerNameEn && `(${productDetail.sellerNameEn})`}
							</td>
						</tr>
					)}
					{productDetail.businessRegistrationNumber && (
						<tr>
							<th>사업자등록번호</th>
							<td>{productDetail.businessRegistrationNumber}</td>
						</tr>
					)}
					{productDetail.telecomSalesNumber && (
						<tr>
							<th>통신판매업번호</th>
							<td>{productDetail.telecomSalesNumber}</td>
						</tr>
					)}
					{productDetail.representativeName && (
						<tr>
							<th>대표자</th>
							<td>{productDetail.representativeName}</td>
						</tr>
					)}
					{productDetail.businessZipcode && productDetail.businessAddress && productDetail.businessAddressDetail && (
						<tr>
							<th>사업장 소재지</th>
							<td>
								({productDetail.businessZipcode}) {productDetail.businessAddress} {productDetail.businessAddressDetail}
							</td>
						</tr>
					)}
				</tbody>
			</table>

			{/* <div className={styles.relatedBrandProducts}>
				<div className={styles.brandThumbnail}>
					{loginOn && (
						<button
							className={styles.brandLike}
							onClick={() => {
								toggleSellerLike(isSellerLiked);
							}}
						>
							<div>{isSellerLiked ? <FaHeart /> : <FiHeart />}</div>
							<p>{productDetail.sellerLikeCount}</p>
						</button>
					)}

					<a className={styles.brandHomeLink} href="">
						<span className={styles.brandHomeLinkTitle}>Brand Home</span>
						<span className={styles.brandHomeLinkArrow}>
							<BsChevronRight />
						</span>
					</a>
				</div>
			</div> */}

			{/* 판매자 다른 상품 */}
			<BrandOtherProducts sellerOtherProducts={sellerOtherProducts} />
		</article>
	);
}
