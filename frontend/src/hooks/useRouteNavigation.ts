import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getNameByPath, getPathByName } from "@/config/routes.config";

interface UseNavigationReturn {
	activePage: string;
	navigateToPage: (pageName: string) => void;
}

export const useNavigation = (): UseNavigationReturn => {
	const location = useLocation();
	const navigate = useNavigate();
	const [activePage, setActivePage] = useState("Overview");

	// 監聽路由變化，同步更新 activePage
	useEffect(() => {
		const pageName = getNameByPath(location.pathname);
		setActivePage(pageName);
	}, [location.pathname]);

	// 處理頁面導航
	const navigateToPage = useCallback(
		(pageName: string) => {
			const path = getPathByName(pageName);
			navigate(path);
			// activePage 會通過 useEffect 自動更新
		},
		[navigate]
	);

	return {
		activePage,
		navigateToPage,
	};
};
