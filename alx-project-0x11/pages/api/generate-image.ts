import { HEIGHT, WIDTH } from "@/constants";
import { RequestProps } from "@/interfaces";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  const gptApiKey = process.env.GPT_API_KEY; // Use non-public key
  const gptUrl = "https://chatgpt-42.p.rapidapi.com/texttoimage";

  if (!gptApiKey || !gptUrl) {
    return response.status(500).json({ error: "Missing API key or URL in environment variables" });
  }

  try {
    const { prompt }: RequestProps = request.body;

    if (!prompt || typeof prompt !== "string") {
      return response.status(400).json({ error: "Invalid prompt provided" });
    }

    const res = await fetch(gptUrl, {
      method: "POST",
      headers: {
        "x-rapidapi-key": gptApiKey.trim(),
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: prompt,
        width: WIDTH,
        height: HEIGHT
      })
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok) {
      const errorMessage = contentType?.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();

      console.error("Failed fetch response:", errorMessage);
      throw new Error(`DALL·E API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const imageUrl = data?.generated_image || "https://via.placeholder.com/600x400?text=Image+Unavailable";

    return response.status(200).json({ message: imageUrl });
  } catch (error: any) {
    console.error("Error in API route:", error.message || error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

export default handler;