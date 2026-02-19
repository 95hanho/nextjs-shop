import styled from "@emotion/styled";

const ButtonUI = styled.button<{ bgColor?: string; borderColor?: string; bgHoverColor?: string; bgActiveColor?: string }>`
	background: ${(props) => props.bgColor ?? "#000"};
	padding: 5px 11px;
	font-size: 17px;
	border: 1px solid ${(props) => props.borderColor ?? "#fff"};
	border-radius: 5px;
	color: #ffffff;
	font-weight: 500;
	&:hover {
		background: ${(props) => props.bgHoverColor ?? "#fff"};
	}
	&:active {
		background: ${(props) => props.bgActiveColor ?? "#fff"};
	}
`;

interface NormalButtonProps {
	title: string;
	onClick: () => void;
	bgColor?: string;
	borderColor?: string;
	bgHoverColor?: string;
	bgActiveColor?: string;
}

export const NormalButton = ({ title, onClick, bgColor, borderColor, bgHoverColor, bgActiveColor }: NormalButtonProps) => {
	const btnStyleProps = {
		bgColor,
		borderColor,
		bgHoverColor,
		bgActiveColor,
	};

	return (
		<ButtonUI onClick={onClick} {...btnStyleProps}>
			{title}
		</ButtonUI>
	);
};
