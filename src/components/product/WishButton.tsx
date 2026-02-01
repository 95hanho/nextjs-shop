import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

interface WishButtonProps {
	clickFnc: () => void;
}

export const WishButton = ({ clickFnc }: WishButtonProps) => {
	const [wishOn, setWishOn] = useState(true);

	return (
		<button
			className="absolute right-2 bottom-2 text-base block text-[#e79278]"
			onClick={() => {
				clickFnc();
				setWishOn(!wishOn);
			}}
		>
			{wishOn ? <FaStar /> : <FiStar />}
		</button>
	);
};
