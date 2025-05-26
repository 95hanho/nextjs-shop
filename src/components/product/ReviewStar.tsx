import "@/components/product/reviewstar.css";

export default function ReviewStar() {
	return (
		<fieldset className="rate">
			<input type="radio" id="rating10" name="rating" value="10" />
			<label htmlFor="rating10" title="5점"></label>
			<input type="radio" id="rating9" name="rating" value="9" />
			<label className="half" htmlFor="rating9" title="4.5점"></label>
			<input type="radio" id="rating8" name="rating" value="8" />
			<label htmlFor="rating8" title="4점"></label>
			<input type="radio" id="rating7" name="rating" value="7" />
			<label className="half" htmlFor="rating7" title="3.5점"></label>
			<input type="radio" id="rating6" name="rating" value="6" />
			<label htmlFor="rating6" title="3점"></label>
			<input type="radio" id="rating5" name="rating" value="5" />
			<label className="half" htmlFor="rating5" title="2.5점"></label>
			<input type="radio" id="rating4" name="rating" value="4" />
			<label htmlFor="rating4" title="2점"></label>
			<input type="radio" id="rating3" name="rating" value="3" />
			<label className="half" htmlFor="rating3" title="1.5점"></label>
			<input type="radio" id="rating2" name="rating" value="2" />
			<label htmlFor="rating2" title="1점"></label>
			<input type="radio" id="rating1" name="rating" value="1" />
			<label className="half" htmlFor="rating1" title="0.5점"></label>
		</fieldset>
	);
}
