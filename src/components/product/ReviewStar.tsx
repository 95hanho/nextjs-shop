import styles from "./ReviewStar.module.scss";

const Star = ({ filled, size }: { filled: boolean; size: number }) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
	</svg>
);

interface ReviewStarProps {
	rate: number; // 0 ~ 5
	starColor?: string;
	size?: number;
	clickable?: boolean;
	onClick?: (rate: number) => void;
}

export const ReviewStar = ({ rate, starColor = "#000", size = 18, clickable = false, onClick }: ReviewStarProps) => {
	return (
		<div className={styles.reviewStar} style={{ display: "flex", gap: 2, color: starColor }}>
			{[1, 2, 3, 4, 5].map((i) => (
				<div
					key={i}
					style={{ position: "relative", width: size, height: size, cursor: clickable ? "pointer" : "default" }}
					onClick={clickable ? () => onClick?.(i) : undefined}
				>
					<Star filled={rate >= i} size={size} />
					{rate + 1 > i && rate < i && (
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: `${(rate - (i - 1)) * 100}%`,
								overflow: "hidden",
							}}
						>
							<Star filled size={size} />
						</div>
					)}
				</div>
			))}
		</div>
	);
};
