import { ReactNode } from "react";

interface InfoMarkProps {
	title: string;
	infoVal: ReactNode;
}

export const InfoMark = ({ title, infoVal }: InfoMarkProps) => {
	return (
		<div className="flex my-2 text-xl">
			<div className="w-1/3 text-left">
				<label>{title}</label>
			</div>
			<div className="w-2/3 px-2 text-left">
				<div className="font-semibold">
					<span>{infoVal}</span>
				</div>
			</div>
		</div>
	);
};
