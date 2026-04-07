import clsx from "clsx";
import { ReactNode } from "react";
import styles from "./Form.module.scss";

interface InfoMarkProps {
	title: string;
	infoVal: ReactNode;
}

export const InfoMark = ({ title, infoVal }: InfoMarkProps) => {
	return (
		<div className={clsx(styles.infoMark, "flex")}>
			<div className="w-1/3 text-left">
				<label>{title}</label>
			</div>
			<div className="w-2/3 px-2 text-left">
				<div className={clsx(styles.infoVal, "font-semibold")}>{infoVal}</div>
			</div>
		</div>
	);
};
