/* MODEL --------------------------------------------- */

export type User = {
	name: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	birthday: string;
	phone: string;
	email: string;
};
// 회원정보 추가사항
export type UserAdd = {
	createdAt: Date;
	mileage: number;
	tall: number;
	weight: number;
};
