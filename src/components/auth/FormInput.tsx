"use client";

import styles from "./FormInput.module.scss";
import { forwardRef } from "react";
import clsx from "clsx";
import { ChangeEvent } from "@/types/event";
import { JoinFormAlert } from "@/types/auth";

interface FormInputProps {
	name: string;
	label: string;
	placeholder: string;
	type?: string;
	value: string;
	alarm: JoinFormAlert | null;
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
		alarm,
		onChange,
		onBlur,
		readOnly = false,
		onClick,
		searchBtn,
		inputMode,
		pattern,
		maxLength,
	} = props;

	let alarmStatus,
		alarmMessage = null;
	if (alarm && name === alarm.name) {
		alarmStatus = alarm.status || "SUCCESS";
		alarmMessage = alarm.message;
	}

	return (
		<div className={styles.joinInput}>
			<div className={styles.joinLabel}>
				<label htmlFor={name}>{label}</label>
			</div>

			<div className={clsx(styles.joinText, alarmStatus === "FAIL" && styles.fail, alarmStatus === "SUCCESS" && styles.success)}>
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
						className={name === "address" ? "cursor-pointer" : ""}
					/>
					{searchBtn && (
						<button
							type="button"
							onClick={searchBtn.fnc}
							className={clsx(
								styles.searchBtn,
								styles[name as keyof typeof styles], // address / phone / phoneAuth
							)}
						>
							{searchBtn.txt}
						</button>
					)}
				</div>
				{alarmMessage && (
					<p>
						* <span>{alarmMessage}</span>
					</p>
				)}
			</div>
		</div>
	);
});

FormInput.displayName = "FormInput";
export default FormInput;
