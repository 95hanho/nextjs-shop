import styled from "@emotion/styled";

const FormWrapper = styled.div<{ minPx?: number }>`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: calc(100vh - ${(props) => props.minPx ?? 50}px);
	padding: 50px 0;
`;
const FormWrap = styled.div<{ formWidth?: number; overflow?: string }>`
	width: ${(props) => props.formWidth ?? 350}px;
	background-color: #fff;
	border: 5px double #777;
	border-radius: 25px;
	text-align: center;
	overflow: ${(props) => props.overflow ?? "hidden"};
	box-shadow: 3px 3px 3px #aaa;
	padding: 20px;
	font-size: 18px;
`;

interface FormPageShellProps {
	title: React.ReactNode;
	children: React.ReactNode;
	wrapMinHeight?: number;
	formWidth?: number;
	overflow?: string;
}

/* 로그인, 회원가입, 아이디,비번찾기 */
export const FormPageShell = ({ title, children, wrapMinHeight, formWidth, overflow }: FormPageShellProps) => {
	return (
		<FormWrapper minPx={wrapMinHeight}>
			<FormWrap formWidth={formWidth} overflow={overflow}>
				<h2 className="py-4 text-5xl tracking-wider">{title}</h2>
				{children}
			</FormWrap>
		</FormWrapper>
	);
};
