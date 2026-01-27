"use client";

import styles from "./JoinInput.module.scss";
import { forwardRef } from "react";
import clsx from "clsx";
import { ChangeEvent } from "@/types/event";

interface FormInputProps {
	name: string;
	label: string;
	placeholder: string;
	type?: string;
	value: string;
	failMessage: string;
	successMessage?: string;
	onChange?: (e: ChangeEvent) => void;
	onBlur?: (e: ChangeEvent) => void;
	readOnly?: boolean;
	onClick?: () => void;
	searchBtn?: { txt: string; fnc: () => void };
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
	pattern?: string;
	maxLength?: number;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>((props, ref) => {
	const {
		name,
		label,
		placeholder,
		type = "text",
		value,
		failMessage,
		successMessage,
		onChange,
		onBlur,
		readOnly = false,
		onClick,
		searchBtn,
		inputMode,
		pattern,
		maxLength,
	} = props;

	return (
		<div className={styles.joinInput}>
			<div className={styles.joinLabel}>
				<label htmlFor={name}>{label}</label>
			</div>

			<div className={clsx(styles.joinText, failMessage && styles.fail, successMessage && styles.success)}>
				<div>
					<input
						ref={ref}
						type={type}
						name={name}
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						readOnly={readOnly}
						onClick={onClick}
						inputMode={inputMode}
						pattern={pattern}
						maxLength={maxLength}
					/>

					{searchBtn && (
						<button
							type="button"
							onClick={searchBtn.fnc}
							className={clsx(
								styles.searchBtn,
								styles[name as keyof typeof styles] // address / phone / phoneAuth
							)}
						>
							{searchBtn.txt}
						</button>
					)}
				</div>

				<p className={clsx(failMessage && styles.red, successMessage && styles.green)}>
					* <span>{failMessage || successMessage}</span>
				</p>
			</div>
		</div>
	);
});

FormInput.displayName = "FormInput";
export default FormInput;
