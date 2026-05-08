import { BASIC_NO_IMAGE } from "@/lib/env.client";
import Image from "next/image";
import styles from "./SmartImage.module.scss";
import { FaCopyright, FaRegCopyright } from "react-icons/fa";
import { useState } from "react";

type CommonProps = {
	className?: string;
	src?: string | null;
	alt?: string | null;
	sizes?: string;
	priority?: boolean; // 모바일: 2~4개, 데스크탑: 4~8개 정도만 true로 주는 걸 권장. 너무 많이 주면 오히려 성능 저하될 수 있음
	quality?: number;
	objectFit?: "cover" | "contain";
	style?: React.CSSProperties;
	copyright?: string | null;
	copyrightUrl?: string | null;
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

export const SmartImage = ({
	className = "",
	src = "",
	alt,
	sizes,
	priority,
	quality,
	objectFit = "cover",
	style,
	copyright,
	copyrightUrl,
	...rest
}: SmartImageProps) => {
	// 2) [useState / useRef] ----------------------------------------------
	// copyright hover
	const [isCopyrightHovered, setIsCopyrightHovered] = useState(false);

	// 4) [derived values / useMemo] ---------------------------------------
	const finalSrc = src || BASIC_NO_IMAGE;
	const finalAlt = alt || "사진없음";
	const isExternal = finalSrc.startsWith("http://") || finalSrc.startsWith("https://");
	const isCdn = finalSrc.includes("cdn1.cafe24.com");

	// fill: true 케이스finalSrc
	if ("fill" in rest && rest.fill) {
		return (
			<>
				{copyright && (
					<a
						href={copyrightUrl || "#"}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.copyright}
						title={copyright}
						onMouseEnter={() => setIsCopyrightHovered(true)}
						onMouseLeave={() => setIsCopyrightHovered(false)}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						{isCopyrightHovered ? <FaCopyright /> : <FaRegCopyright />}
					</a>
				)}
				<Image
					className={className}
					src={finalSrc}
					alt={finalAlt}
					fill
					sizes={sizes ?? "(max-width: 650px) 100vw, 50vw"}
					priority={priority}
					quality={quality}
					style={{ ...style, objectFit }}
					unoptimized={isExternal || isCdn}
				/>
			</>
		);
	}

	// width/height 케이스
	return (
		<>
			{copyright && (
				<a
					href={copyrightUrl || "#"}
					target="_blank"
					rel="noopener noreferrer"
					className={styles.copyright}
					title={copyright}
					onMouseEnter={() => setIsCopyrightHovered(true)}
					onMouseLeave={() => setIsCopyrightHovered(false)}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{isCopyrightHovered ? <FaCopyright /> : <FaRegCopyright />}
				</a>
			)}
			<Image
				className={className}
				src={finalSrc}
				alt={finalAlt}
				width={rest.width}
				height={rest.height}
				sizes={sizes ?? "(max-width: 650px) 100vw, 50vw"}
				priority={priority}
				quality={quality}
				style={{ ...style, objectFit }}
				unoptimized={isExternal || isCdn}
				// style={{ width: "100%", height: "auto", objectFit }}
			/>
		</>
	);
};
