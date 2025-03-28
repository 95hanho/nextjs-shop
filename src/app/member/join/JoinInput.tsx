import { ChangeEvent } from "@/types/form";
import { forwardRef } from "react";

interface FormInputProps {
	name: string;
	label: string;
	placeholder: string;
	type?: string;
	value: string;
	alertMessage: string;
	onChange?: (e: ChangeEvent) => void;
	onBlur?: (e: ChangeEvent) => void;
	readOnly?: boolean;
	onClick?: () => void;
	searchBtn?: { txt: string; fnc: () => void };
}

const JoinInput = forwardRef<HTMLInputElement, FormInputProps>((props, ref) => {
	const {
		name,
		label,
		placeholder,
		type = "text",
		value,
		alertMessage,
		onChange,
		onBlur,
		readOnly = false,
		onClick,
		searchBtn,
	}: FormInputProps = props;

	return (
		<div className="join-input">
			<div className="join-label">
				<label htmlFor={name}>{label}</label>
			</div>
			<div className={`join-text${alertMessage ? " alert-on" : ""}`}>
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
					/>
					{searchBtn && (
						<button className={`search-btn ${name}`} onClick={searchBtn.fnc}>
							{searchBtn.txt}
						</button>
					)}
				</div>
				<p className="c_red">
					* <span>{alertMessage}</span>
				</p>
			</div>
		</div>
	);
});

export default JoinInput;
