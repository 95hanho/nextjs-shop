import { mainService } from "@/api";
import { useQuery } from "@tanstack/react-query";

export default function useMember() {
	const handleMenu = useQuery({
		queryKey: ["menu"],
		queryFn: () => {
			return mainService.getMenus();
		},
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5, // 5분
		// cacheTime: 1000 * 60 * 10 // 10분
	});

	return {
		handleMenu,
	};
}
