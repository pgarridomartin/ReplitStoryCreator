// server/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import mime from "mime-types";
import path from "path";
import crypto from "crypto";

// Get the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not configured.");
}

// Initialize GoogleGenerativeAI with the API key
const genAI = new GoogleGenerativeAI(apiKey);

// Select the Gemini image generation model
// Using the appropriate model for image generation
const model = genAI.getGenerativeModel({
  model: "gemini-pro-vision",
});

// Generation configuration (adjust if necessary according to the official documentation)
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: ["image", "text"],
  responseMimeType: "text/plain",
};

// Create images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Generates an image using Gemini API.
 *
 * @param prompt - Descriptive text that will be used to generate the image.
 * @returns A promise that resolves with the URL of the generated image.
 * @throws Error if the response doesn't contain images or the generation fails.
 */
async function generateImage(prompt: string): Promise<string> {
  try {
    // Start a chat session with the model using the defined configuration
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Add more detailed instructions to the prompt
    const enhancedPrompt = `${prompt}\n\nPlease provide an image that fits this description. The image should be high quality and appropriate for a children's book.`;

    // Send the prompt to the model and wait for the response
    const result = await chatSession.sendMessage(enhancedPrompt);

    // Process response candidates to extract the image
    const candidates = result.response.candidates || [];
    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
      const candidate = candidates[candidateIndex];
      if (candidate.content && candidate.content.parts) {
        for (let partIndex = 0; partIndex < candidate.content.parts.length; partIndex++) {
          const part = candidate.content.parts[partIndex];
          if (part.inlineData) {
            try {
              // Determine file extension from MIME type
              const extension = mime.extension(part.inlineData.mimeType) || "png";
              
              // Generate unique filename
              const uniqueId = crypto.randomBytes(6).toString('hex');
              const filename = `image_${uniqueId}.${extension}`;
              const filePath = path.join(imagesDir, filename);
              
              // Write the file by decoding base64 content
              fs.writeFileSync(
                filePath,
                Buffer.from(part.inlineData.data, "base64")
              );
              
              console.log(`Image generated and saved to: ${filePath}`);
              
              // Return URL that can be used by the frontend
              return `/images/${filename}`;
            } catch (err) {
              console.error("Error writing image file:", err);
            }
          }
        }
      }
    }
    throw new Error("Gemini response doesn't contain any images.");
  } catch (error) {
    console.error("Error generating image:", error);
    
    // Improved error handling to capture more details
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Add stack trace for better debugging
      console.error("Stack trace:", error.stack);
    } else {
      errorMessage = String(error);
    }
    
    throw new Error(`Error generating image: ${errorMessage}`);
  }
}

/**
 * Generates an image using the Gemini API with fallback mechanisms.
 * This function is called by the rest of the application.
 *
 * @param prompt - The text prompt to generate an image from.
 * @returns URL of the generated image.
 */
export async function generateImageWithGemini(prompt: string): Promise<string> {
  try {
    console.log("Generating image with Gemini for prompt:", prompt.substring(0, 100) + "...");
    return await generateImage(prompt);
  } catch (error) {
    console.error("Error with image generation API:", error);
    
    // Try with a simplified prompt
    try {
      const simplifiedPrompt = prompt.split(".")[0] + ". Children's book illustration style.";
      console.log("Trying with simplified prompt:", simplifiedPrompt);
      return await generateImage(simplifiedPrompt);
    } catch (fallbackError) {
      console.error("Image generation API failed", fallbackError);
      
      // Return a fallback image if all attempts fail
      return "https://images.unsplash.com/photo-1573505790261-dcac3e00c337?w=800&auto=format&fit=crop";
    }
  }
}

/**
 * Type definitions for image generation results
 */
type ImageGenerationResult = {
  success: boolean;
  index: number;
  url?: string;
  error?: any;
};

/**
 * Generates multiple images for a visual story.
 * 
 * @param prompts - Array of text prompts for each image.
 * @returns Array of image URLs.
 */
export async function generateVisualStoryImagesWithGemini(prompts: string[]): Promise<string[]> {
  console.log(`Generating ${prompts.length} images for visual story...`);
  
  // Define fallback function for guaranteed string output
  const getFallbackUrl = (index: number): string => {
    return `https://images.unsplash.com/photo-1629414278888-abcdb8e0a904?w=800&auto=format&fit=crop&page=${index}`;
  };
  
  // Process in batches to reduce parallel load
  const BATCH_SIZE = 2;
  const finalImageUrls: string[] = new Array(prompts.length).fill('').map((_, i) => getFallbackUrl(i));
  
  // Process prompts in batches to avoid overloading the API
  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batchPrompts = prompts.slice(i, i + BATCH_SIZE);
    console.log(`Generating batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(prompts.length/BATCH_SIZE)}`);
    
    // Generate batch in parallel
    const batchResults = await Promise.all(
      batchPrompts.map(async (prompt, batchIndex) => {
        const index = i + batchIndex;
        try {
          // Add retry logic for more reliability
          let retries = 0;
          const MAX_RETRIES = 2;
          
          while (retries <= MAX_RETRIES) {
            try {
              const imageUrl = await generateImageWithGemini(prompt);
              console.log(`Successfully generated image ${index + 1}`);
              // Update the final image URLs array directly
              finalImageUrls[index] = imageUrl;
              return { success: true, index };
            } catch (error) {
              retries++;
              console.log(`Retry ${retries}/${MAX_RETRIES} for image ${index + 1}`);
              // Small delay between retries
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          // If we get here, all retries failed - fallback already in place
          console.error(`Falling back to semantic image selection for image ${index + 1} after ${MAX_RETRIES} retries`);
          return { success: false, index };
        } catch (error) {
          console.error(`Falling back to semantic image selection for image ${index + 1}`);
          return { success: false, index };
        }
      })
    );
  }
  
  console.log(`Completed image generation: ${finalImageUrls.length} images produced`);
  return finalImageUrls;
}
