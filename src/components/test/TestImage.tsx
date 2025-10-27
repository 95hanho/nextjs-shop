import Image from "next/image";

interface TestImageProps {
	classNameList?: string[];
}

export default function TestImage({ classNameList }: TestImageProps) {
	return <Image className={"test-image " + classNameList?.join(" ")} src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="test" fill />;
}
