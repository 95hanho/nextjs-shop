import { getNormal } from "../../../api/apiFilter";
import API_URL from "../../../api/endpoints";
import { AxiosResponse } from "axios";

export const mainServiceDoc = {
	getMainSlideProducts: async (): Promise<AxiosResponse<any>> => getNormal(API_URL.MAIN),
	getMenus: async (): Promise<AxiosResponse<any>> => getNormal(API_URL.MAIN_MENU),
};
