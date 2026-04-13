import API_URL from "@/api/endpoints";
import { postJson, putJson } from "@/api/fetchFilter";
import { ProductSetForm } from "@/components/seller/product/ProductSetForm";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddFile, AddSellerProductRequest, SetSellerProductImageRequest, UpdateFile, UpdateSellerProductRequest } from "@/types/seller";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// 판매자제품 추가/수정
export function useSellerProductSubmit() {
	const router = useRouter();

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
			await updateSellerProduct({
				productId,
				...productSetForm,
				saleStop: productSetForm.saleStop || false,
			}).then(() => {
				productImageSubmit("UPDATE", undefined);
			});
		}
		function productImageSubmit(type: "ADD" | "UPDATE", productId?: number) {
			if (type === "ADD" && productId) {
				router.push(`/seller/product/${productId}`);
			} else if (type === "UPDATE" && productId) {
			}
		}
		return true;
	};

	return {
		sellerProductSubmit,
	};
}
