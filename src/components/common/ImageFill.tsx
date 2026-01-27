import { BASIC_NO_IMAGE } from "@/lib/env";
import Image from "next/image";

interface ImageBasicProps {
	className?: string;
	src?: string | null;
	alt?: string | null;
	fill?: boolean;
}

export default function ImageFill({ className = "", src = "", alt, fill = true }: ImageBasicProps) {
	return <Image className={className} src={src || BASIC_NO_IMAGE} alt={alt || "사진없음"} fill={fill} sizes="1" />;
}
