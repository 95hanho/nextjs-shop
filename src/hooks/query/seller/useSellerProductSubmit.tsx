import API_URL from "@/api/endpoints";
import { postJson, putJson } from "@/api/fetchFilter";
import { ProductSetForm } from "@/components/seller/product/ProductSetForm";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddFile, AddSellerProductRequest, SetSellerProductImageRequest, UpdateFile, UpdateSellerProductRequest } from "@/types/seller";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// 판매자제품 추가/수정
export function useSellerProductSubmit() {
	const router = useRouter();
	const queryClient = useQueryClient();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------
	// 제품 추가
	const { mutateAsync: addSellerProduct } = useMutation<BaseResponse & { productId: number }, Error, AddSellerProductRequest>({
		mutationFn: (productForm: AddSellerProductRequest) =>
			postJson(getApiUrl(API_URL.SELLER_PRODUCT), {
				...productForm,
			}),
	});
	// 제품 수정
	const { mutateAsync: updateSellerProduct } = useMutation<BaseResponse, Error, UpdateSellerProductRequest>({
		mutationFn: (productForm: UpdateSellerProductRequest) =>
			putJson(getApiUrl(API_URL.SELLER_PRODUCT), {
				...productForm,
			}),
	});
	// 제품 이미지 설정
	const { mutateAsync: setSellerProductImage } = useMutation<BaseResponse, Error, SetSellerProductImageRequest>({
		mutationFn: ({ addFiles, updateFiles, deleteImageIds }: SetSellerProductImageRequest) => {
			return postJson(getApiUrl(API_URL.SELLER_PRODUCT_IMAGE), {
				addFiles: [...addFiles],
				updateFiles: [...updateFiles],
				deleteImageIds: [...deleteImageIds],
			});
		},
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	type SellerProductSubmitParams = {
		productId?: number;
		productSetForm: ProductSetForm;
		addFiles: AddFile[];
		updateFiles: UpdateFile[];
		deleteImageIds: number[];
	};
	// submit handler
	const sellerProductSubmit = async ({ productId, productSetForm, addFiles, updateFiles, deleteImageIds }: SellerProductSubmitParams) => {
		console.log("제품 이미지 테스트");
		setSellerProductImage({
			productId: productId || 0,
			addFiles,
			updateFiles,
			deleteImageIds,
		});
		return;
		// 제품 추가
		if (!productId) {
			await addSellerProduct({
				...productSetForm,
			}).then((data) => {
				productImageSubmit("ADD", data.productId);
			});
		}
		// 제품 수정
		else {
			// console.log("제품 수정", {
			// 	productId,
			// 	...productSetForm,
			// 	saleStop: productSetForm.saleStop || false,
			// });
			// return;
			console.log("제품 수정 API 요청", {
				addFiles,
				deleteImageIds,
			});
			await updateSellerProduct({
				productId,
				...productSetForm,
				saleStop: productSetForm.saleStop || false,
				// updateFiles는 순서만 바뀐거므로 제외
				imageUpdate: addFiles.length > 0 || deleteImageIds.length > 0, // 이미지 변경사항이 있을 때만 true
			}).then(() => {
				productImageSubmit("UPDATE", productId);
			});
		}
		function productImageSubmit(type: "ADD" | "UPDATE", productId: number) {
			console.log({ type, productId });
			if (type === "ADD") {
				router.push(`/seller/product/${productId}`);
			} else if (type === "UPDATE") {
				console.log("이미지 설정 API 요청");
				queryClient.invalidateQueries({ queryKey: ["sellerProductDetail", productId] });
			}
		}
		return true;
	};

	return {
		sellerProductSubmit,
	};
}
