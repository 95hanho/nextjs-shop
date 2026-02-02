import { ReactNode } from "react";

interface InfoMarkProps {
	title: string;
	infoVal: ReactNode;
}

export const InfoMark = ({ title, infoVal }: InfoMarkProps) => {
	return (
		<div className="flex text-xl">
			<div className="w-1/3">
				<label>{title}</label>
			</div>
			<div className="w-2/3">
				<div className="font-semibold">
					<span>{infoVal}</span>
				</div>
			</div>
		</div>
	);
};
