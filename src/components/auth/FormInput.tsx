import styles from "./FormInput.module.scss";
import { forwardRef } from "react";
import clsx from "clsx";
import { ChangeFunction } from "@/types/event";
import { FormInputAlarm } from "@/types/form";

interface FormInputProps<T extends string, K extends string = T> {
	name: T;
	label: string;
	placeholder: string;
	type?: string;
	value: string;
	alarm: FormInputAlarm<K>;
	onChange?: ChangeFunction;
	onBlur?: ChangeFunction;
	readOnly?: boolean;
	onClick?: () => void;
	searchBtn?: { txt: string; fnc: () => void };
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
	pattern?: string;
	maxLength?: number;
	inputWidthFill?: boolean;
}

export const FormInput = forwardRef(<T extends string>(props: FormInputProps<T>, ref: React.ForwardedRef<HTMLInputElement>) => {
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
		inputWidthFill = false,
	} = props;

	let alarmStatus,
		alarmMessage = null;
	if (alarm && name === alarm.name) {
		alarmStatus = alarm.status || "SUCCESS";
		alarmMessage = alarm.message;
	}

	return (
		<div className={styles.joinInput}>
			<div className={clsx(styles.joinLabel, "w-1/3")}>
				<label htmlFor={name}>{label}</label>
			</div>

			<div className={clsx(styles.joinText, alarmStatus === "FAIL" && styles.fail, alarmStatus === "SUCCESS" && styles.success, "w-2/3")}>
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
						className={clsx(name === "address" && "cursor-pointer", inputWidthFill && styles.fill)}
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
