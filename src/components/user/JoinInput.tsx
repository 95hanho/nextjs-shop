import "./joinInput.css";
import { ChangeEvent } from "@/types/auth";
import { forwardRef } from "react";

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

const JoinInput = forwardRef<HTMLInputElement, FormInputProps>((props, ref) => {
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
	}: FormInputProps = props;

	return (
		<div className="join-input">
			<div className="join-label">
				<label htmlFor={name}>{label}</label>
			</div>
			<div className={`join-text${failMessage ? " fail" : ""}${successMessage ? " success" : ""}`}>
				<div>
					<input
						type={type}
						placeholder={placeholder}
						name={name}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						readOnly={readOnly}
						onClick={onClick}
						ref={ref}
						inputMode={inputMode}
						pattern={pattern}
						maxLength={maxLength}
					/>
					{searchBtn && (
						<button type="button" className={`search-btn ${name}`} onClick={searchBtn.fnc}>
							{searchBtn.txt}
						</button>
					)}
				</div>
				<p className={`${failMessage ? "c-red" : ""}${successMessage ? "c-green" : ""}`}>
					* <span>{failMessage || successMessage}</span>
				</p>
			</div>
		</div>
	);
});

export default JoinInput;
