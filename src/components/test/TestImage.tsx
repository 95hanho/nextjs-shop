import Image from "next/image";

export default function TestImage() {
	return <Image className="test-image" src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt={"test"} fill style={{ objectFit: "cover" }} />;
}
