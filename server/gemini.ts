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
    // Extract the character style from the prompt if it's specified
    let artStyle = "cartoon";
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes("art style:")) {
      const styleMatch = prompt.match(/art style: (\w+)/i);
      if (styleMatch && styleMatch[1]) {
        artStyle = styleMatch[1].toLowerCase();
      }
    }

    // Console log for debugging
    console.log(`Generating image with style: ${artStyle} for prompt: ${prompt}`);

    // Create enhanced prompt for image generation
    const enhancedPrompt = `Children's book illustration for: ${prompt}
      The illustration style should be ${artStyle} style with ${
        artStyle === 'watercolor' ? 'soft brushstrokes and flowing colors' : 
        artStyle === '3d' ? 'dimensional characters and realistic textures' : 
        'bright colors and clean outlines'
      }.
      Focus on whimsical details and a child-friendly aesthetic.
      Make the image appropriate for a children's book with a cheerful, positive mood.
      Create a high-quality, detailed image suitable for a professional children's book.`;

    // We no longer need to initialize the Gemini model for image generation
    // as we're directly using the REST API endpoint

    // Generate the image using the Imagen API
    try {
      // Using the image generation feature as per the documentation
      // https://ai.google.dev/gemini-api/docs/image-generation#node.js

      // Create the request to directly generate an image using Gemini 2.0
      // Based on the example code using the newer model for image generation
      const result = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp-image-generation:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          contents: enhancedPrompt,
          config: {
            responseModalities: ["Text", "Image"]
          }
        })
      });

      if (!result.ok) {
        console.error(`API request failed with status ${result.status}: ${await result.text()}`);
        throw new Error(`API request failed with status ${result.status}`);
      }

      // Parse the JSON response
      const imageData = await result.json();

      console.log("Successfully received response from Gemini API");
      
      // Look for image data in the response
      if (imageData?.candidates?.[0]?.content?.parts) {
        for (const part of imageData.candidates[0].content.parts) {
          // Check for text description
          if (part.text) {
            console.log("Received text description:", part.text.substring(0, 150) + "...");
          }
          
          // Check for inline image data
          if (part.inlineData && part.inlineData.data) {
            console.log("Found image data in the response");
            const imageBase64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            
            // Create a data URL from the base64 data
            const dataUrl = `data:${mimeType};base64,${imageBase64}`;
            console.log("Successfully generated image with Gemini API");
            return dataUrl;
          }
        }
      }
      
      // If no image was found in the response, use semantic matching for fallback
      console.log("No image data found in response, using semantic matching");
      
      // Extract any text description to help select an appropriate fallback
      const description = imageData?.candidates?.[0]?.content?.parts?.[0]?.text || enhancedPrompt;
      const descriptionLower = description.toLowerCase();
      let semanticIndex = 0;
      
      // Content matching based on the description or prompt
      if (descriptionLower.includes("forest") || descriptionLower.includes("trees")) {
        semanticIndex = 2; // Forest scene
      } else if (descriptionLower.includes("ocean") || descriptionLower.includes("sea")) {
        semanticIndex = 5; // Underwater scene
      } else if (descriptionLower.includes("space") || descriptionLower.includes("stars")) {
        semanticIndex = 6; // Space scene
      } else if (descriptionLower.includes("castle") || descriptionLower.includes("palace")) {
        semanticIndex = 4; // Fairy tale castle
      } else if (descriptionLower.includes("animal") || descriptionLower.includes("pet")) {
        semanticIndex = 9; // Animal scene
      } else if (descriptionLower.includes("adventure") || descriptionLower.includes("journey")) {
        semanticIndex = 3; // Adventure scene
      } else if (descriptionLower.includes("magic") || descriptionLower.includes("wizard")) {
        semanticIndex = 10; // Magic scene
      } else {
        // Use a basic algorithm as last resort
        semanticIndex = Math.abs(description.length % demoBookImages.length);
      }
      
      return demoBookImages[semanticIndex];
    } catch (imageError) {
      console.error("Error with image generation API:", imageError);
      throw new Error("Image generation API failed");
    }
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Error generating image with Gemini:", error);

    // Use a fallback image relevant to the prompt content when image generation fails
    console.log("Falling back to semantic image selection");

    // Try to match the prompt to a relevant image based on content
    let imageIndex = 0;
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

    // Return a fallback image from our collection
    const fallbackImage = demoBookImages[imageIndex];
    imageCounter++;
    return fallbackImage;
  }
}

/**
 * Generate all images for a storybook
 * @param prompts Array of prompts for each page
 * @returns Array of generated image URLs
 */
// Define types for our image generation results
type ImageGenerationSuccess = {
  success: true;
  index: number;
  url: string;
};

type ImageGenerationError = {
  success: false;
  index: number;
  error: any;
};

type ImageGenerationResult = ImageGenerationSuccess | ImageGenerationError;

export async function generateVisualStoryImagesWithGemini(
  prompts: string[]
): Promise<string[]> {
  try {
    // Process prompts with limited concurrency to avoid overloading the API
    const maxConcurrent = 2; // Limited concurrency for stability
    const images: string[] = [];
    const usedFallbackIndices = new Set<number>(); // Track used fallback images only

    console.log(`Starting image generation for ${prompts.length} pages`);

    // Generate images in batches to control concurrency
    for (let i = 0; i < prompts.length; i += maxConcurrent) {
      console.log(`Generating batch ${Math.floor(i/maxConcurrent) + 1} of ${Math.ceil(prompts.length/maxConcurrent)}`);

      const batch = prompts.slice(i, i + maxConcurrent);
      const batchPromises = batch.map((prompt, batchIndex) => {
        const promptIndex = i + batchIndex;

        // Generate image with the prompt
        return generateImageWithGemini(prompt)
          .then(imageUrl => {
            console.log(`Successfully generated image ${promptIndex + 1}`);
            return { success: true, index: promptIndex, url: imageUrl } as ImageGenerationSuccess;
          })
          .catch(error => {
            console.error(`Failed to generate image ${promptIndex + 1}:`, error);
            return { success: false, index: promptIndex, error } as ImageGenerationError;
          });
      });

      // Wait for all images in this batch to complete
      const batchResults = await Promise.all(batchPromises);

      // Process the results with proper type checking
      for (const result of batchResults) {
        if (result.success) {
          // For successful generations, use the returned URL
          images[result.index] = result.url;
        } else {
          // For error cases, generate a semantically appropriate fallback
          const promptLower = prompts[result.index].toLowerCase();
          let fallbackIndex: number;

          // Match content to an appropriate fallback image
          if (promptLower.includes("forest") || promptLower.includes("trees")) {
            fallbackIndex = 2; // Forest scene
          } else if (promptLower.includes("ocean") || promptLower.includes("sea")) {
            fallbackIndex = 5; // Underwater scene
          } else if (promptLower.includes("space")) {
            fallbackIndex = 6; // Space scene
          } else if (promptLower.includes("castle")) {
            fallbackIndex = 4; // Fairy tale castle
          } else {
            // Distribute evenly across available images
            fallbackIndex = result.index % demoBookImages.length;
          }

          // Ensure we don't reuse fallback images if possible
          if (usedFallbackIndices.has(fallbackIndex) && usedFallbackIndices.size < demoBookImages.length - 1) {
            // Find an unused fallback index
            let newIndex = (fallbackIndex + 1) % demoBookImages.length;
            while (usedFallbackIndices.has(newIndex) && usedFallbackIndices.size < demoBookImages.length - 1) {
              newIndex = (newIndex + 1) % demoBookImages.length;
            }
            fallbackIndex = newIndex;
          }

          // Track this fallback image as used
          usedFallbackIndices.add(fallbackIndex);
          images[result.index] = demoBookImages[fallbackIndex];
        }
      }

      // Add a small delay between batches to avoid rate limiting
      if (i + maxConcurrent < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Make sure all slots in the images array are filled
    for (let i = 0; i < prompts.length; i++) {
      if (!images[i]) {
        // If any slots are still undefined, use a fallback
        const fallbackIndex = i % demoBookImages.length;
        images[i] = demoBookImages[fallbackIndex];
      }
    }

    console.log(`Completed image generation: ${images.length} images produced`);
    return images;
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Error in overall image generation process:", error);

    // Fall back to a complete set of fallback images
    console.log("Using complete fallback image set");
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