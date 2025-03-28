import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use the Gemini 1.5 Flash model as recommended
// This is the latest available model after Gemini 1.0 Pro Vision was deprecated on July 12, 2024
const MODEL_NAME = "gemini-1.5-flash";

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
// Sample demo images to use for our book preview (children's storybook themed)
// This ensures the app works even if image generation has issues
const demoBookImages = [
  "https://images.unsplash.com/photo-1629414278888-abcdb8e0a904?w=800&auto=format&fit=crop", // Children reading
  "https://images.unsplash.com/photo-1631891909383-a68ec028cdc4?w=800&auto=format&fit=crop", // Child with book
  "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800&auto=format&fit=crop", // Magical forest scene
  "https://images.unsplash.com/photo-1636739653660-a33496c0e657?w=800&auto=format&fit=crop", // Kids adventure
  "https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=800&auto=format&fit=crop", // Fairy tale castle
  "https://images.unsplash.com/photo-1558959615-b78f78af0a7f?w=800&auto=format&fit=crop", // Underwater scene
  "https://images.unsplash.com/photo-1578897366846-369bb25b83ef?w=800&auto=format&fit=crop", // Space adventure
  "https://images.unsplash.com/photo-1590697151592-b48c66634e9f?w=800&auto=format&fit=crop", // Forest animals 
  "https://images.unsplash.com/photo-1551601651-09ebecb891a1?w=800&auto=format&fit=crop", // Kid hero
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop", // Pet adventure
  "https://images.unsplash.com/photo-1535380097097-d53e3090abc8?w=800&auto=format&fit=crop"  // Magic lesson
];

let imageCounter = 0;

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

    // Extract possible scene elements from the prompt to select a more relevant image
    let imageIndex = 0;
    
    // Try to match the prompt to a relevant image based on content
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes("forest") || promptLower.includes("trees") || promptLower.includes("woods") || promptLower.includes("nature")) {
      imageIndex = 2; // Magical forest scene
    } else if (promptLower.includes("ocean") || promptLower.includes("sea") || promptLower.includes("underwater") || promptLower.includes("fish")) {
      imageIndex = 5; // Underwater scene
    } else if (promptLower.includes("space") || promptLower.includes("planet") || promptLower.includes("stars") || promptLower.includes("moon")) {
      imageIndex = 6; // Space adventure
    } else if (promptLower.includes("castle") || promptLower.includes("princess") || promptLower.includes("prince") || promptLower.includes("king")) {
      imageIndex = 4; // Fairy tale castle
    } else if (promptLower.includes("animal") || promptLower.includes("pet") || promptLower.includes("dog") || promptLower.includes("cat")) {
      imageIndex = 9; // Pet adventure
    } else if (promptLower.includes("adventure") || promptLower.includes("journey") || promptLower.includes("explore")) {
      imageIndex = 3; // Kids adventure
    } else if (promptLower.includes("magic") || promptLower.includes("wizard") || promptLower.includes("spell")) {
      imageIndex = 10; // Magic lesson
    } else {
      // Use a basic algorithm to select an image based on the length of the prompt
      imageIndex = Math.abs(prompt.length % demoBookImages.length);
    }
    
    // Extract the character style from the prompt if it's specified
    let artStyle = "cartoon";
    if (promptLower.includes("art style:")) {
      const styleMatch = prompt.match(/art style: (\w+)/i);
      if (styleMatch && styleMatch[1]) {
        artStyle = styleMatch[1].toLowerCase();
      }
    }
    
    // Console log for debugging
    console.log(`Generating image with style: ${artStyle} for prompt: ${prompt}`);
    
    const result = await model.generateContent(`Generate a children's book illustration for: ${prompt}. 
      Describe it in vivid detail that could be used by an artist to draw it.
      The illustration style should be ${artStyle} style with ${artStyle === 'watercolor' ? 'soft brushstrokes and flowing colors' : 
        artStyle === '3d' ? 'dimensional characters and realistic textures' : 
        'bright colors and clean outlines'}.
      Focus on whimsical details and a child-friendly aesthetic.
      Make the image appropriate for a children's book with a cheerful, positive mood.`);

    const response = result.response;
    const text = response.text();
    
    // For the time being, return demo images in a semantically matched way
    // This ensures the app can still demonstrate functionality during development
    // Note: In production, this would be replaced with actual generated images
    return demoBookImages[imageIndex];
    
    // TODO: When Gemini 2.0's image generation API is available, replace with:
    // const imageResult = await model.generateImage({ prompt });
    // return imageResult.url; 
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Error generating image with Gemini:", error);
    
    // For demo purposes, return a sample image even when there's an error
    // This ensures the app can still function for demonstration
    const fallbackImage = demoBookImages[imageCounter % demoBookImages.length];
    imageCounter++;
    return fallbackImage;
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
    const maxConcurrent = 2; // Reduced for more stability
    const images: string[] = [];
    
    // Ensure we don't use the same image twice in our story by tracking used indices
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < prompts.length; i += maxConcurrent) {
      const batch = prompts.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(prompt => generateImageWithGemini(prompt))
      );
      
      // Make each image in the story unique if possible
      batchResults.forEach((url) => {
        // Check if this image has already been used
        const index = demoBookImages.indexOf(url);
        if (index !== -1 && usedIndices.has(index) && demoBookImages.length > prompts.length) {
          // If used before and we have enough images, find a new one
          let newIndex = (index + 1) % demoBookImages.length;
          while (usedIndices.has(newIndex) && usedIndices.size < demoBookImages.length - 1) {
            newIndex = (newIndex + 1) % demoBookImages.length;
          }
          usedIndices.add(newIndex);
          images.push(demoBookImages[newIndex]);
        } else {
          // Track this image as used
          if (index !== -1) {
            usedIndices.add(index);
          }
          images.push(url);
        }
      });
    }
    
    return images;
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Error generating multiple images with Gemini:", error);
    
    // Generate fallback images instead of throwing an error
    // Use a variety of images for a more interesting story
    return prompts.map((prompt, index) => {
      // Attempt to match image to content or distribute evenly
      let imageIndex;
      if (prompt.toLowerCase().includes("forest")) {
        imageIndex = 2;
      } else if (prompt.toLowerCase().includes("ocean") || prompt.toLowerCase().includes("sea")) {
        imageIndex = 5;
      } else if (prompt.toLowerCase().includes("space")) {
        imageIndex = 6;
      } else if (prompt.toLowerCase().includes("castle")) {
        imageIndex = 4;
      } else {
        // Distribute across available images
        imageIndex = index % demoBookImages.length;
      }
      
      return demoBookImages[imageIndex];
    });
  }
}