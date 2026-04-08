import { FormInputAlarm } from "@/types/form";
import DatePicker from "react-datepicker";
import styled from "@emotion/styled";
import clsx from "clsx";
import styles from "./Form.module.scss";
import { forwardRef } from "react";

const LeftLabel = styled.div<{ $labelWidthPercent?: number }>`
	width: ${({ $labelWidthPercent }) => $labelWidthPercent || 33.333333}%;
`;
const RightInput = styled.div<{ $inputWidthPercent?: number; $labelWidthPercent?: number }>`
	width: ${({ $labelWidthPercent }) => ($labelWidthPercent ? 100 - $labelWidthPercent : 66.666667)}%;
	> div input {
		width: ${({ $inputWidthPercent }) => $inputWidthPercent || 70}%;
	}
`;

interface DateInputProps<T extends string, K extends string = T> {
	name: T;
	label: string;
	alarm?: FormInputAlarm<K>;
	labelWidthPercent?: number;
	inputWidthPercent?: number;
	requiredMark?: boolean;
	selectedDate: Date | null;
	changeDate: (date: Date | null) => void;
}

export const DateInput = forwardRef(<T extends string>(props: DateInputProps<T>, ref: React.ForwardedRef<DatePicker>) => {
	const { name, label, alarm, labelWidthPercent, inputWidthPercent, requiredMark = false, selectedDate, changeDate } = props;

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
					<DatePicker
						dateFormat="yyyy.MM.dd HH:mm" // 날짜 형태
						shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
						selected={selectedDate}
						onChange={(date: Date | null) => changeDate(date)}
						showTimeSelect // 시간 선택 기능 활성화
						minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))} // minTime은 현재 시간 3년전까지 가능
						maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))} // maxTime은 3년 뒤까지 가능
						ref={ref}
					/>
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
DateInput.displayName = "DateInput";
