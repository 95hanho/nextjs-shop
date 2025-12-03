import Image from "next/image";

interface ImageBasicProps {
	src?: string | null;
	alt?: string | null;
	fill?: boolean;
}

export default function ImageFill({ src, alt, fill = true }: ImageBasicProps) {
	return <Image src={src || process.env.NEXT_PUBLIC_BASIC_IMAGE} alt={alt || "사진없음"} fill={fill} />;
}
