import { authServiceDoc } from "./services/authService";
import { mainServiceDoc } from "./services/mainService";

// API 디렉토리의 중앙 집중 관리 파일
export const authService = { ...authServiceDoc };
export const mainService = { ...mainServiceDoc };
