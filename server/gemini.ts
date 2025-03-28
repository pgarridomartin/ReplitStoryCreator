import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// The Gemini Pro Vision model - for now we'll use this model
// Note: Once Gemini 2.0 becomes fully available via the API, update this to use that model instead
const MODEL_NAME = "gemini-pro-vision";

// SafetySettings to ensure appropriate content for children's books
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Generate an image using Google's Gemini AI model
 * @param prompt The text prompt for image generation
 * @returns The generated image as a base64-encoded string or URL
 */
export async function generateImageWithGemini(prompt: string): Promise<string> {
  try {
    // Currently, Gemini doesn't directly support image generation through the SDK
    // Instead, we'll use it to generate a detailed description for now
    // This will later be replaced with direct image generation once Gemini 2.0's API 
    // for image generation is fully available
    
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Generate a children's book illustration for: ${prompt}. 
      Describe it in vivid detail that could be used by an artist to draw it. 
      Focus on bright colors, whimsical details, and a child-friendly style.
      Make the image appropriate for a children's book with a cheerful, positive mood.`}] }],
    });

    const response = result.response;
    const text = response.text();
    
    // For the time being, return a placeholder URL
    // This will be replaced with actual image generation when Gemini 2.0's image generation API is available
    return `https://placehold.co/600x400/4ECDC4/FFFFFF?text=${encodeURIComponent("Gemini Illustration Coming Soon")}`;
    
    // TODO: When Gemini 2.0's image generation API is available, replace with:
    // const imageResult = await model.generateImage({ prompt });
    // return imageResult.url; 
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Error generating image with Gemini:", error);
    throw new Error(`Failed to generate image with Gemini: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate all images for a storybook
 * @param prompts Array of prompts for each page
 * @returns Array of generated image URLs
 */
export async function generateVisualStoryImagesWithGemini(
  prompts: string[]
): Promise<string[]> {
  try {
    // Process prompts in parallel with a maximum concurrency
    const maxConcurrent = 3;
    const images: string[] = [];
    
    for (let i = 0; i < prompts.length; i += maxConcurrent) {
      const batch = prompts.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(prompt => generateImageWithGemini(prompt))
      );
      images.push(...batchResults);
    }
    
    return images;
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Error generating multiple images with Gemini:", error);
    throw new Error(`Failed to generate multiple images with Gemini: ${error.message || 'Unknown error'}`);
  }
}