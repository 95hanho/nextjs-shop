"use client";

import { CircleLoader, ClipLoader } from "react-spinners";

export default function LodingWrap() {
	return (
		<div className="loding-wrap">
			{/* <CircleLoader color="#333" size={40} /> */}
			<ClipLoader color="#494949ff" size={100} />
		</div>
	);
}
