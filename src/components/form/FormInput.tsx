import styles from "./Form.module.scss";
import { forwardRef } from "react";
import clsx from "clsx";
import { ChangeFunction } from "@/types/event";
import { FormInputAlarm } from "@/types/form";
import styled from "@emotion/styled";

const LeftLabel = styled.div<{ $labelWidthPercent?: number }>`
	width: ${({ $labelWidthPercent }) => $labelWidthPercent || 33.333333}%;
`;
const RightInput = styled.div<{ $inputWidthPercent?: number; $labelWidthPercent?: number }>`
	width: ${({ $labelWidthPercent }) => ($labelWidthPercent ? 100 - $labelWidthPercent : 66.666667)}%;
	> div input {
		width: ${({ $inputWidthPercent }) => $inputWidthPercent || 70}%;
	}
`;

interface FormInputProps<T extends string, K extends string = T> {
	name: T;
	label: string;
	placeholder: string;
	type?: string;
	value: string | number;
	alarm?: FormInputAlarm<K>;
	onChange?: ChangeFunction;
	onBlur?: ChangeFunction;
	readOnly?: boolean;
	onClick?: () => void;
	searchBtn?: { txt: string; fnc: () => void };
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
	pattern?: string;
	max?: number;
	maxLength?: number;
	labelWidthPercent?: number;
	inputWidthPercent?: number;
	requiredMark?: boolean;
	cursorPointer?: boolean;
	unit?: string; // 단위
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
		max,
		maxLength,
		labelWidthPercent,
		inputWidthPercent,
		requiredMark = false,
		cursorPointer = false,
		unit,
	} = props;

	// 4) [derived values / useMemo] ---------------------------------------
	let alarmStatus,
		alarmMessage = null;
	if (alarm && name === alarm.name) {
		alarmStatus = alarm.status || "SUCCESS";
		alarmMessage = alarm.message;
	}

	return (
		<div className={styles.formInput}>
			<LeftLabel className={clsx(styles.formInputLabel)} $labelWidthPercent={labelWidthPercent}>
				<label htmlFor={name}>{label}</label>
				{requiredMark && <mark className={styles.requiredMark}>*</mark>}
			</LeftLabel>

			<RightInput
				className={clsx(styles.formInputText, alarmStatus === "FAIL" && styles.fail, alarmStatus === "SUCCESS" && styles.success)}
				$labelWidthPercent={labelWidthPercent}
				$inputWidthPercent={inputWidthPercent}
			>
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
						max={max}
						maxLength={maxLength}
						className={clsx(cursorPointer && styles.cursorPointer)}
					/>
					{unit && <span className={clsx(styles.unit, "ml-1")}>{unit}</span>}
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
			</RightInput>
		</div>
	);
});
FormInput.displayName = "FormInput";
