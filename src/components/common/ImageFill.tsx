import Image from "next/image";

interface ImageBasicProps {
	className?: string;
	src?: string | null;
	alt?: string | null;
	fill?: boolean;
}

export default function ImageFill({ className = "", src = "", alt, fill = true }: ImageBasicProps) {
	return <Image className={className} src={src || process.env.NEXT_PUBLIC_BASIC_IMAGE} alt={alt || "사진없음"} fill={fill} sizes="1" />;
}
