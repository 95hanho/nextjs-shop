import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	console.log(request.url);
	console.log(request.method);
	console.log(request.query);

	return response.status(200).json({ message: data.message });
}
