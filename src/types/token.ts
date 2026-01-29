import { JwtPayload } from "jsonwebtoken";

export type Token = JwtPayload &
	(
		| {
				type: "ACCESS";
				userNo: number;
		  }
		| {
				type: "SELLER";
				sellerNo: number;
		  }
		| {
				type: "ADMIN";
				adminNo: number;
		  }
		| {
				type: "PWDRESET";
				userNo?: number;
		  }
		| {
				type: "REFRESH" | "PHONEAUTH" | "PHONEAUTHCOMPLETE";
		  }
	);
