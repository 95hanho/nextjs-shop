import { useId } from "react";
import styles from "./OnOffButton.module.scss";
import styled from "@emotion/styled";

type OnOffButtonSize = "sm" | "md" | "lg";

const sizeMap = {
	sm: {
		wrapPaddingX: 6,
		switchWidth: 42,
		switchHeight: 22,
		knobSize: 14,
		knobLeft: 3,
		fontSize: 14,
		textMarginLeft: 8,
	},
	md: {
		wrapPaddingX: 10,
		switchWidth: 58,
		switchHeight: 28,
		knobSize: 20,
		knobLeft: 4,
		fontSize: 18,
		textMarginLeft: 10,
	},
	lg: {
		wrapPaddingX: 12,
		switchWidth: 72,
		switchHeight: 36,
		knobSize: 26,
		knobLeft: 4,
		fontSize: 20,
		textMarginLeft: 12,
	},
} as const;

const getKnobCheckedLeft = (size: OnOffButtonSize) => {
	const current = sizeMap[size];
	return current.switchWidth - current.knobSize - current.knobLeft - 2;
};

const clamp = (value: number, min = 0, max = 255) => Math.max(min, Math.min(max, value));

const hexToRgb = (hex: string) => {
	let normalized = hex.replace("#", "").trim();

	if (normalized.length === 3) {
		normalized = normalized
			.split("")
			.map((char) => char + char)
			.join("");
	}

	const num = parseInt(normalized, 16);

	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255,
	};
};

const rgbToHex = (r: number, g: number, b: number) => {
	return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
};

/**
 * amount
 *  + 값이면 밝게
 *  - 값이면 어둡게
 */
const shiftColor = (hex: string, amount: number) => {
	const { r, g, b } = hexToRgb(hex);
	return rgbToHex(r + amount, g + amount, b + amount);
};

const getSwitchColors = (checked: boolean, onColor: string, offColor: string) => {
	if (checked) {
		return {
			background: onColor,
			border: shiftColor(onColor, -7),
			hover: shiftColor(onColor, -25),
			knob: "#ffffff",
			boxShadow: "1px 2px 3px rgba(0, 0, 0, 0.1254901961)",
		};
	}

	return {
		background: "#ffffff",
		border: offColor,
		hover: "#efefef",
		knob: offColor,
		boxShadow: "none",
	};
};

const OnOffBtnWrap = styled.div<{ $size: OnOffButtonSize }>`
	padding: 0 ${({ $size }) => sizeMap[$size].wrapPaddingX}px;
`;

const SwitchLabel = styled.label<{
	$size: OnOffButtonSize;
	$checked: boolean;
	$onColor: string;
	$offColor: string;
	$cursor?: boolean;
}>`
	width: ${({ $size }) => sizeMap[$size].switchWidth}px;
	height: ${({ $size }) => sizeMap[$size].switchHeight}px;
	cursor: ${({ $cursor }) => ($cursor ? "pointer" : "default")};

	${({ $checked, $onColor, $offColor }) => {
		const colors = getSwitchColors($checked, $onColor, $offColor);

		return `
			background: ${colors.background};
			border: 2px solid ${colors.border};

			&:hover {
				background: ${colors.hover};
			}
		`;
	}}
`;

const OnfBtn = styled.span<{
	$size: OnOffButtonSize;
	$checked: boolean;
	$onColor: string;
	$offColor: string;
}>`
	width: ${({ $size }) => sizeMap[$size].knobSize}px;
	height: ${({ $size }) => sizeMap[$size].knobSize}px;
	left: ${({ $size, $checked }) => ($checked ? `${getKnobCheckedLeft($size)}px` : `${sizeMap[$size].knobLeft}px`)};

	${({ $checked, $onColor, $offColor }) => {
		const colors = getSwitchColors($checked, $onColor, $offColor);

		return `
			background: ${colors.knob};
			box-shadow: ${colors.boxShadow};
		`;
	}}
`;

const OnfTxt = styled.label<{ $size: OnOffButtonSize }>`
	font-size: ${({ $size }) => sizeMap[$size].fontSize}px;
	margin-left: ${({ $size }) => sizeMap[$size].textMarginLeft}px;
`;

interface OnOffButtonProps {
	checkId?: string;
	text?: string;
	checked: boolean;
	size?: OnOffButtonSize;
	name?: string;
	onOffColor?: [string, string]; // [onColor, offColor]
	onChange?: (checked: boolean) => void;
	cursor?: boolean;
}

export const OnOffButton = ({
	checkId,
	text,
	checked,
	size = "md",
	name = "sale",
	onOffColor = ["#80C580", "#DAA"],
	onChange,
	cursor = true,
}: OnOffButtonProps) => {
	const generatedId = useId();
	const id = checkId || generatedId;

	const [onColor, offColor] = onOffColor;

	return (
		<OnOffBtnWrap $size={size} className={styles.onOffBtnWrap}>
			<input
				type="checkbox"
				id={id}
				name={name}
				className={styles.onfCheckbox}
				checked={checked}
				onChange={(e) => onChange?.(e.target.checked)}
			/>

			<SwitchLabel
				htmlFor={id}
				$size={size}
				$checked={checked}
				$onColor={onColor}
				$offColor={offColor}
				className={styles.switchLabel}
				$cursor={cursor}
			>
				<OnfBtn $size={size} $checked={checked} $onColor={onColor} $offColor={offColor} className={styles.onfBtn} />
			</SwitchLabel>

			{text && (
				<OnfTxt htmlFor={id} $size={size} className={styles.onfTxt}>
					{text}
				</OnfTxt>
			)}
		</OnOffBtnWrap>
	);
};
