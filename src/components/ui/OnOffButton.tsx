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

const OnOffBtnWrap = styled.div<{ $size: OnOffButtonSize }>`
	padding: 0 ${({ $size }) => sizeMap[$size].wrapPaddingX}px;
`;

const SwitchLabel = styled.label<{ $size: OnOffButtonSize }>`
	width: ${({ $size }) => sizeMap[$size].switchWidth}px;
	height: ${({ $size }) => sizeMap[$size].switchHeight}px;
`;

const OnfBtn = styled.span<{ $size: OnOffButtonSize; $checked: boolean }>`
	width: ${({ $size }) => sizeMap[$size].knobSize}px;
	height: ${({ $size }) => sizeMap[$size].knobSize}px;
	left: ${({ $size, $checked }) => ($checked ? `${getKnobCheckedLeft($size)}px` : `${sizeMap[$size].knobLeft}px`)};
`;

const OnfTxt = styled.label<{ $size: OnOffButtonSize }>`
	font-size: ${({ $size }) => sizeMap[$size].fontSize}px;
	margin-left: ${({ $size }) => sizeMap[$size].textMarginLeft}px;
`;

interface OnOffButtonProps {
	text: string;
	checked: boolean;
	size?: OnOffButtonSize;
	name?: string;
	onChange?: (checked: boolean) => void;
}

export const OnOffButton = ({ text, checked, size = "md", name = "sale", onChange }: OnOffButtonProps) => {
	const id = useId();

	return (
		<OnOffBtnWrap $size={size} className={styles.onOffBtnWrap}>
			<input
				type="checkbox"
				id={id}
				name={name}
				className={styles.onfCheckbox}
				checked={checked}
				readOnly
				onChange={(e) => {
					if (onChange) {
						onChange(e.target.checked);
					}
				}}
			/>

			<SwitchLabel htmlFor={id} $size={size} className={styles.switchLabel}>
				<OnfBtn $size={size} $checked={checked} className={styles.onfBtn} />
			</SwitchLabel>

			<OnfTxt htmlFor={id} $size={size} className={styles.onfTxt}>
				{text}
			</OnfTxt>
		</OnOffBtnWrap>
	);
};
