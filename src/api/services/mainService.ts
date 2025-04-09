import { get_normal } from "../apiFilter";
import API_URL from "../endpoints";
import { AxiosResponse } from "axios";

export const mainService_doc = {
	getMain: async (): Promise<AxiosResponse<any>> => get_normal(API_URL.MAIN),
};
