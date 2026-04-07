// This file is used to declare global types for the project. It allows us to define types that can be used across the entire codebase without needing to import them in every file.
// 한국어 : 이 파일은 프로젝트의 전역 타입을 선언하는 데 사용됩니다. 이를 통해 모든 파일에서 별도의 import 없이 사용할 수 있는 타입을 정의할 수 있습니다.

declare module "*.css";
declare module "*.scss";

declare module "*.module.css" {
	const classes: { [key: string]: string };
	export default classes;
}

declare module "*.module.scss" {
	const classes: { [key: string]: string };
	export default classes;
}
