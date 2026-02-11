import { BASIC_NO_IMAGE } from "@/lib/env";
import Image from "next/image";

type CommonProps = {
	className?: string;
	src?: string | null;
	alt?: string | null;
	sizes?: string;
	priority?: boolean;
	quality?: number;
	objectFit?: "cover" | "contain";
};

type FillVariant = CommonProps & {
	fill: true;
	// fill일 땐 width/height를 받지 않게 막음
	width?: never;
	height?: never;
};

type FixedVariant = CommonProps & {
	fill?: false; // 또는 아예 fill을 안 넘기는 케이스도 여기로
	width: number;
	height: number;
};

type SmartImageProps = FillVariant | FixedVariant;

export const SmartImage = ({ className = "", src = "", alt, sizes, priority, quality, objectFit = "cover", ...rest }: SmartImageProps) => {
	const finalSrc = src || BASIC_NO_IMAGE;
	const finalAlt = alt || "사진없음";

	// fill: true 케이스
	if ("fill" in rest && rest.fill) {
		return (
			<Image
				className={className}
				src={finalSrc}
				alt={finalAlt}
				fill
				sizes={sizes ?? "(max-width: 650px) 100vw, 50vw"}
				priority={priority}
				quality={quality}
				style={{ objectFit }}
			/>
		);
	}

	// width/height 케이스
	return (
		<Image
			className={className}
			src={finalSrc}
			alt={finalAlt}
			width={rest.width}
			height={rest.height}
			sizes={sizes ?? "(max-width: 650px) 100vw, 50vw"}
			priority={priority}
			quality={quality}
			style={{ width: "100%", height: "auto", objectFit }}
		/>
	);
};
