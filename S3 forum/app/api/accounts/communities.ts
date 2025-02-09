// pages/api/communities.ts

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, description } = req.body;

    // Here you would typically save the community to your database
    // For demonstration, we'll just return a success response

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    // Simulate saving to a database
    // const newCommunity = await saveCommunityToDatabase({ name, description });

    return res.status(201).json({ message: "Community added successfully!" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}