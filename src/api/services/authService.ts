import { JoinForm, LoginData } from "@/types/form";
import API_URL from "../endpoints";
import { AxiosResponse } from "axios";
import { getNormal, postUrlFormData } from "../apiFilter";

export const authServiceDoc = {
	login: async (obj: LoginData): Promise<AxiosResponse<any>> => postUrlFormData(API_URL.USER, obj),
	// --------------------------> Partial JoinForm에서 일부속성만 가능
	idDuplcheck: async (obj: Partial<JoinForm>): Promise<AxiosResponse<any>> => await getNormal(API_URL.USER_ID, obj),
	// --------------------------> Pick JoinForm에서 id 만 선택해서 사용
	// id_duplcheck: async (obj: Pick<JoinForm, "id">): Promise<AxiosResponse<any>> =>
	// 	await get_normal(API_URL.MEMBER_ID, obj),
	joinUser: async (obj: JoinForm): Promise<AxiosResponse<any>> => await postUrlFormData(API_URL.USER_JOIN, obj),
	reToken: async (obj: { refresh_token: string }): Promise<AxiosResponse<any>> => await postUrlFormData(API_URL.USER_TOKEN, obj),
};
