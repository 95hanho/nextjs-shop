interface ProductListParams {
	params: {
		menu_sub_id: string;
		menu_top_id: string;
	};
}

export default function ProductList({ params: { menu_sub_id, menu_top_id } }: ProductListParams) {
	console.log(menu_sub_id, menu_top_id);
	return <div>afassfd</div>;
}
