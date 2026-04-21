import clsx from "clsx";

interface TurnToPaginationProps {
	curPage: number;
	totalPage: number;
	turnPage: (page: number) => void;
}

export const TurnToPagination = ({ curPage, totalPage, turnPage }: TurnToPaginationProps) => {
	return (
		<>
			<nav className="flex justify-center gap-2 mt-4">
				<button
					className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
						"cursor-not-allowed opacity-50": curPage === 1,
					})}
					onClick={() => turnPage(curPage - 1)}
					disabled={curPage === 1}
				>
					이전
				</button>
				<span>
					{curPage} / {totalPage}
				</span>
				<button
					className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
						"cursor-not-allowed opacity-50": curPage === totalPage,
					})}
					onClick={() => turnPage(curPage + 1)}
					disabled={curPage === totalPage}
				>
					다음
				</button>
			</nav>
		</>
	);
};
