import { FormPageShell } from "@/components/form/FormPageShell";
import styles from "./ProductSet.module.scss";
import { ProductImage } from "@/types/seller";
import { SmartImage } from "@/components/ui/SmartImage";

interface ProductImageSetProps {
	prevImageList?: ProductImage[];
}

export const ProductImageSet = ({ prevImageList }: ProductImageSetProps) => {
	return (
		<div className={styles.productImageSetWrap}>
			<div>
				<h3>제품 썸네일 이미지</h3>
				<div className={styles.productImageGrid}></div>
				<div className={styles.fileButtonWrap}>
					<button>파일 선택</button>
				</div>
				<input type="file" className="hidden" />
			</div>
			<div>
				<h3>제품 상세 이미지</h3>
				<div className={styles.productImageGrid}></div>
				<div className={styles.fileButtonWrap}>
					<button>파일 선택</button>
				</div>
				<input type="file" className="hidden" />
			</div>
		</div>
	);
};
