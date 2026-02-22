import { User } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { AdminCoupon, Coupon } from "@/types/mypage";
import { SellerInfo } from "@/types/seller";

// 로그인폼 데이터
export type AdminLoginForm = {
	adminId: string;
	password: string;
};

export type AdminInfo = {
	adminName: string;
	lastLoginAt: string;
};
/* ------------------------------------------------------------- */

/* 관리자정보 조회 */
export interface GetAdminInfoResponse extends BaseResponse {
	admin: AdminInfo;
}
/* 로그인 */
export interface AdminLoginResponse extends BaseResponse {
	adminNo: number;
}
/* 판매자 조회 */
type AdminSellerInfo = SellerInfo & {
	sellerNo: number;
	//
	updatedAt: string; // 업데이트 시
	requestedAt: string; // 판매자 가입 신청 시각
	appovalStatus: string; // 승인 상태 'PENDING','APPROVED','REJECTED','SUSPENDED'
	approvedAt: string; // 요청/승인 날짜
	approvedBy: number; // 처리자 관리자no
	rejectedAt: string; // 반려 시각
	rejectReason: string; // 반려 사유
	suspendedAt: string; // 정지 날짜
};
export interface GetSellerResponse extends BaseResponse {
	sellerList: AdminSellerInfo;
}
/* 판매자 추가 */
export interface AddSellerRequest extends SellerInfo {
	password: string;
}
/* 판매자 승인여부 변경 */
export interface SetSellerApprovalRequest {
	sellerNoList: number[];
	approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
	rejectReason?: string;
}
/* 회원 조회 */
export interface GetUserListResponse extends BaseResponse {
	userList: {
		userNo: number;
		userId: string;
		name: string;
		phone: string;
		email: string;
		createdAt: string;
		mileage: number;
		withdrawalStatus: "ACTIVE" | "REQUESTED" | "WITHDRAWN";
	};
}
/* 회원 정보 보기(마스킹해제) */
export interface GetUserInfoUnmaskedResponse extends BaseResponse {
	userInfo: {
		userNo: number;
		userId: string;
	} & User & {
			createdAt: string;
			mileage: number;
			withdrawalStatus: string; // 'ACTIVE','REQUESTED','WITHDRAWN'
			withdrawalRequestedAt: string;
			withdrawalCompletedAt: string;
		};
}
/* 회원 탈퇴 확정하기 */
export interface UserWithdrawalStatusRequest {
	userNoList: number[];
	withdrawalStatus: "ACTIVE" | "REQUESTED" | "WITHDRAWN";
}
/* 공용 쿠폰 조회 */
export interface GetCommonCouponListResponse extends BaseResponse {
	commonCouponList: Coupon &
		AdminCoupon & {
			adminNo: number;
			isDeleted: boolean;
		};
}
/* 공용 쿠폰 등록 */
export interface AddCommonCouponRequest {
	description: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount?: number;
	minimumOrderBeforeAmount: number;
	amount: number;
	startDate: string;
	endDate: string;
}
/* 공용 쿠폰 수정 */
export interface UpdateCommonCouponRequest {
	couponId: number;
	description: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount?: number;
	minimumOrderBeforeAmount: number;
	status: "ACTIVE" | "SUSPENDED" | "DELETED";
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
}
