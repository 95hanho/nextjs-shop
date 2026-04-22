import API_URL from "@/api/endpoints";
import { postJson, postMultipart, putJson } from "@/api/fetchFilter";
import { ProductSetForm } from "@/components/seller/product/ProductSetForm";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddFile, AddSellerProductRequest, SetSellerProductImageRequest, UpdateFile, UpdateSellerProductRequest } from "@/types/seller";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// 판매자제품 추가/수정
export function useSellerProductSubmit() {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const queryClient = useQueryClient();

	// 3) [useQuery / useMutation] -----------------------------------------
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
		mutationFn: ({ files, productId, addFiles, updateFiles, deleteImageIds }: SetSellerProductImageRequest) => {
			const formData = new FormData();
			formData.append(
				"request",
				JSON.stringify({
					productId,
					addFiles,
					updateFiles,
					deleteImageIds,
				}),
			);
			files.forEach((file) => {
				formData.append("files", file);
			});

			return postMultipart(getApiUrl(API_URL.SELLER_PRODUCT_IMAGE), formData);
		},
	});

	// 5) [handlers / useCallback] -----------------------------------------
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
				// updateFiles는 순서만 바뀐거므로 제외
				imageUpdate: addFiles.length > 0 || deleteImageIds.length > 0, // 이미지 변경사항이 있을 때만 true
			}).then(() => {
				productImageSubmit("UPDATE", productId);
			});
		}
		function productImageSubmit(type: "ADD" | "UPDATE", productId: number) {
			const addFilesMeta = addFiles.map((item, index) => {
				const clientKey = `new-file-${index}-${item.sortKey}`;

				return {
					clientKey,
					sortKey: item.sortKey,
					isThumbnail: item.isThumbnail,
					fileName: item.file.name,
				};
			});
			setSellerProductImage({
				files: [...addFiles.map((file) => file.file)], // File 객체 배열로 변환
				productId: productId || 0,
				addFiles: addFilesMeta,
				updateFiles,
				deleteImageIds,
			}).then(() => {
				if (type === "ADD") {
					router.push(`/seller/product/${productId}`);
				} else if (type === "UPDATE") {
					console.log("이미지 설정 API 요청");
					queryClient.invalidateQueries({ queryKey: ["sellerProductDetail", productId] });
				}
			});
		}
		return true;
	};

	return {
		sellerProductSubmit,
	};
}
