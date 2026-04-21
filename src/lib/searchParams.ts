/** url에서 특정 쿼리 파라미터를 제거 */
export const removeSearchParams = (pathname: string, searchParams: URLSearchParams, keys: string[]) => {
	const params = new URLSearchParams(searchParams.toString());
	keys.forEach((key) => params.delete(key));
	const nextQuery = params.toString();
	return nextQuery ? `${pathname}?${nextQuery}` : pathname;
};
