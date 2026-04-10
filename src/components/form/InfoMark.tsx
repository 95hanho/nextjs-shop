import clsx from "clsx";
import { ReactNode } from "react";
import styles from "./Form.module.scss";

interface InfoMarkProps {
	title: string;
	infoVal: ReactNode;
	noMargin?: boolean;
}

export const InfoMark = ({ title, infoVal, noMargin }: InfoMarkProps) => {
	return (
		<div className={clsx(styles.infoMark, "flex items-center")}>
			<div className="w-1/3 text-left">
				<label>{title}</label>
			</div>
			<div className="w-2/3 text-left">
				<div className={clsx(styles.infoVal, noMargin && styles.noMargin, "font-semibold")}>{infoVal}</div>
			</div>
		</div>
	);
};
