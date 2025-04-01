import { JoinForm, LoginData } from "@/types/form";
import { get_normal, post_urlFormData } from "../apiFilter";
import API_URL from "../endpoints";
import { AxiosResponse } from "axios";

export const authService_doc = {
	login: async (obj: LoginData): Promise<AxiosResponse<any>> => await post_urlFormData(API_URL.MEMBER, obj),
	// --------------------------> Partial JoinForm에서 일부속성만 가능
	idDuplcheck: async (obj: Partial<JoinForm>): Promise<AxiosResponse<any>> =>
		await get_normal(API_URL.MEMBER_ID, obj),
	// --------------------------> Pick JoinForm에서 id 만 선택해서 사용
	// id_duplcheck: async (obj: Pick<JoinForm, "id">): Promise<AxiosResponse<any>> =>
	// 	await get_normal(API_URL.MEMBER_ID, obj),
	joinMember: async (obj: JoinForm): Promise<AxiosResponse<any>> =>
		await post_urlFormData(API_URL.MEMBER_JOIN, obj),
	reToken: async (obj: { refresh_token: string }): Promise<AxiosResponse<any>> =>
		await post_urlFormData(API_URL.MEMBER_TOKEN, obj),
};
