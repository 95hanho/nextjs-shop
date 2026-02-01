"use client";

import { useId } from "react";
import styles from "./OnOffButton.module.scss";

interface OnOffButtonProps {
	text: string;
	checked: boolean;
}

export const OnOffButton = ({ text, checked }: OnOffButtonProps) => {
	const id = useId();

	return (
		<div className={styles.onOffBtnWrap}>
			<input type="checkbox" id={id} name="sale" className={styles.onfCheckbox} checked={checked} />
			<label htmlFor={id} className={styles.switchLabel}>
				<span className={styles.onfBtn} />
			</label>

			<label htmlFor={id} className={styles.onfTxt}>
				{text}
			</label>
		</div>
	);
};
