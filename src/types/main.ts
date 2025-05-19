export type ProductData = {
	product_id: number;
	name: string;
	brand: string;
	price: string;
	img_path: string;
	copyright: string;
	copyright_url: string;
	created_at: Date;
	view_count: number;
	wish_count: number;
	sales_count: number;
};

export type SubMenu = {
	menu_sub_id: number;
	menu_name: string;
	menu_top_id: number;
};

export type Menu = {
	menu_top_id: string;
	menu_name: string;
	gender: string;
	subMenus: SubMenu[];
};
