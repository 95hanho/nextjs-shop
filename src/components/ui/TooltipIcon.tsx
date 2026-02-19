import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { FaQuestion } from "react-icons/fa";

interface TooltipIconProps {
	className?: string;
	tooltipText: string;
}

export const TooltipIcon = ({ className, tooltipText }: TooltipIconProps) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const tooltipRef = useRef<HTMLParagraphElement | null>(null);

	useEffect(() => {
		if (!showTooltip || !tooltipRef.current) return;

		const tooltip = tooltipRef.current;
		const rect = tooltip.getBoundingClientRect();

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// 초기값 리셋
		tooltip.style.left = "50%";
		tooltip.style.right = "auto";
		tooltip.style.top = "100%";
		tooltip.style.bottom = "auto";
		tooltip.style.transform = "translateX(-50%)";

		// 👉 오른쪽 화면 초과
		if (rect.right > viewportWidth) {
			tooltip.style.left = "auto";
			tooltip.style.right = "0";
			tooltip.style.transform = "translateX(0)";
		}

		// 👉 왼쪽 화면 초과
		if (rect.left < 0) {
			tooltip.style.left = "0";
			tooltip.style.right = "auto";
			tooltip.style.transform = "translateX(0)";
		}

		// 👉 아래쪽 화면 초과 → 위로 표시
		if (rect.bottom > viewportHeight) {
			tooltip.style.top = "auto";
			tooltip.style.bottom = "100%";
			tooltip.style.transform = "translateX(-50%) translateY(-4px)";
		}
	}, [showTooltip]);

	return (
		<i
			className={clsx(
				"relative inline-block p-[2px] ml-1 text-[6px] border border-solid border-gray-400 rounded-full text-gray-800 cursor-pointer",
				className,
			)}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<FaQuestion />
			{showTooltip && (
				<p
					ref={tooltipRef}
					className="absolute z-50 p-1 text-[10px] text-black bg-white border rounded shadow whitespace-nowrap top-full left-1/2 transform -translate-x-1/2"
				>
					{tooltipText}
				</p>
			)}
		</i>
	);
};
