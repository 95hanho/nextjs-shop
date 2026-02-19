import { CommonLoginForm } from "./CommonLoginForm";

export const LoginForm = () => {
	return <CommonLoginForm apiUrl="/api/user/login" redirectTo="/" invalidateKeys={["me"]} />;
};
