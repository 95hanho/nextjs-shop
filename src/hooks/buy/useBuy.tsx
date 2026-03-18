import { buyContext } from "@/context/buyContext";
import { useContext } from "react";

export const useBuy = () => {
	const context = useContext(buyContext);
	if (!context) {
		throw new Error("useBuyContext must be used within BuyProvider");
	}
	return context;
};
