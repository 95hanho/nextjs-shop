import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

interface WishButtonProps {
	clickFnc: () => void;
}

export default function WishButton({ clickFnc }: WishButtonProps) {
	const [wishOn, setWishOn] = useState(true);

	return (
		<button
			className="product__wish-btn"
			onClick={() => {
				clickFnc();
				setWishOn(!wishOn);
			}}
		>
			{wishOn ? <FaStar /> : <FiStar />}
		</button>
	);
}
