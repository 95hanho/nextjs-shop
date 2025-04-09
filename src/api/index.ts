import { authService_doc } from "./services/authService";
import { mainService_doc } from "./services/mainService";

// API 디렉토리의 중앙 집중 관리 파일
export const authService = { ...authService_doc };
export const mainService = { ...mainService_doc };
