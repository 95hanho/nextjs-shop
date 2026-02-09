import styled from "@emotion/styled";

const FormWrapper = styled.div<{ minPx?: number }>`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: calc(100vh - ${(props) => props.minPx ?? 50}px);
	padding: 50px 0;
`;
const FormWrap = styled.div<{ formWidth?: number }>`
	width: ${(props) => props.formWidth ?? 350}px;
	background-color: #fff;
	border: 5px double #777;
	border-radius: 25px;
	text-align: center;
	overflow: hidden;
	box-shadow: 3px 3px 3px #aaa;
	padding: 20px;
	font-size: 18px;
`;

interface FormPageShellProps {
	title: React.ReactNode;
	children: React.ReactNode;
	wrapMinHeight?: number;
	formWidth?: number;
}

/* 로그인, 회원가입, 아이디,비번찾기 */
export const FormPageShell = ({ title, children, wrapMinHeight, formWidth }: FormPageShellProps) => {
	return (
		<FormWrapper minPx={wrapMinHeight}>
			<FormWrap formWidth={formWidth}>
				<h2 className="py-4 text-5xl">{title}</h2>
				{children}
			</FormWrap>
		</FormWrapper>
	);
};
