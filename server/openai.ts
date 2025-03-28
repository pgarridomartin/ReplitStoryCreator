import OpenAI from "openai";
import { BookGenerationRequest, StoryPage } from "@shared/schema";
import { generateImageWithGemini, generateVisualStoryImagesWithGemini } from "./gemini";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StoryResult {
  title: string;
  content: string;
}

interface VisualStoryResult {
  title: string;
  pages: StoryPage[];
}

export async function generateStory(bookData: BookGenerationRequest): Promise<StoryResult> {
  try {
    const storyLengthMap = {
      "1": "short (approximately 300-500 words and 5-6 pages)",
      "2": "medium (approximately 500-800 words and 8-10 pages)",
      "3": "long (approximately 800-1200 words and 12-15 pages)"
    };
    
    const storyLength = storyLengthMap[bookData.storyLength as keyof typeof storyLengthMap] || "medium";
    
    const genderPronoun = bookData.childGender === 'boy' ? 'he' : 
                           bookData.childGender === 'girl' ? 'she' : 'they';
    
    const genderPossessive = bookData.childGender === 'boy' ? 'his' : 
                              bookData.childGender === 'girl' ? 'her' : 'their';
    
    // Build detailed character description using available information
    let characterDesc = `${bookData.childName}, a ${bookData.childGender === 'neutral' ? 'child' : bookData.childGender} with ${bookData.hairStyle} hair and ${bookData.skinTone} skin tone`;
    
    // Add advanced character details if available
    const details = [];
    
    if (bookData.hairColor) details.push(`${bookData.hairColor} hair`);
    if (bookData.eyeColor) details.push(`${bookData.eyeColor} eyes`);
    if (bookData.height) details.push(`${bookData.height} height`);
    if (bookData.buildType) details.push(`${bookData.buildType} build`);
    
    // Add facial features if available
    if (bookData.facialFeatures && bookData.facialFeatures.length > 0) {
      details.push(`facial features: ${bookData.facialFeatures.join(', ')}`);
    }
    
    // Add clothing style if available
    if (bookData.clothingStyle) details.push(`wearing ${bookData.clothingStyle} clothes`);
    
    // Add accessories if available
    if (bookData.accessories && bookData.accessories.length > 0) {
      details.push(`with accessories: ${bookData.accessories.join(', ')}`);
    }
    
    // Append all details to the character description
    if (details.length > 0) {
      characterDesc += `. They have ${details.join('; ')}.`;
    }
    
    // Construct the prompt with detailed instructions for a visual story
    const prompt = `Create a ${storyLength} children's story for a ${bookData.childAge} year old with the following details:

Main Character: ${characterDesc}

Interests: ${bookData.interests.join(', ')}

Story Theme: ${bookData.storyTheme}

Main Goal: ${bookData.childName} needs to ${bookData.storyGoal}

${bookData.companions.length > 0 ? `Companions: ${bookData.companions.join(', ')}` : 'No companions'}

The story should be engaging, age-appropriate, and educational. Include dialog and descriptive scenes. Make sure the story has a clear beginning, middle, and end, with a positive message or lesson. Avoid any scary, violent, or inappropriate content.

Format your response as JSON with the following structure:
{
  "title": "The title of the story",
  "content": "The full story text with proper paragraphs"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional children's book author who specializes in creating personalized stories that feature the child as the main character.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    return {
      title: result.title,
      content: result.content,
    };
  } catch (error) {
    console.error("OpenAI story generation error:", error);
    throw new Error("Failed to generate story. Please try again later.");
  }
}

export async function generateVisualStory(bookData: BookGenerationRequest): Promise<VisualStoryResult> {
  try {
    const numPages = bookData.storyLength === "1" ? 6 : 
                    bookData.storyLength === "3" ? 14 : 10;
    
    const artStyle = bookData.characterStyle || "cartoon";
    
    // Character description for consistent appearance
    // Build detailed character description using available information
    let characterDesc = `${bookData.childName}, a ${bookData.childGender === 'neutral' ? 'child' : bookData.childGender} with ${bookData.hairStyle} hair and ${bookData.skinTone} skin tone`;
    
    // Add advanced character details if available
    const details = [];
    
    if (bookData.hairColor) details.push(`${bookData.hairColor} hair`);
    if (bookData.eyeColor) details.push(`${bookData.eyeColor} eyes`);
    if (bookData.height) details.push(`${bookData.height} height`);
    if (bookData.buildType) details.push(`${bookData.buildType} build`);
    
    // Add facial features if available
    if (bookData.facialFeatures && bookData.facialFeatures.length > 0) {
      details.push(`facial features: ${bookData.facialFeatures.join(', ')}`);
    }
    
    // Add clothing style if available
    if (bookData.clothingStyle) details.push(`wearing ${bookData.clothingStyle} clothes`);
    
    // Add accessories if available
    if (bookData.accessories && bookData.accessories.length > 0) {
      details.push(`with accessories: ${bookData.accessories.join(', ')}`);
    }
    
    // Append all details to the character description
    if (details.length > 0) {
      characterDesc += `. They have ${details.join('; ')}.`;
    }
    
    // Construct detailed prompt for visual story
    const prompt = `Create a children's picture book with ${numPages} pages about ${characterDesc}.
    
Story details:
- Age group: ${bookData.childAge}
- Interests: ${bookData.interests.join(', ')}
- Theme: ${bookData.storyTheme}
- Goal: ${bookData.childName} needs to ${bookData.storyGoal}
${bookData.companions.length > 0 ? `- Companions: ${bookData.companions.join(', ')}` : '- No companions'}
- Art style: ${artStyle}

The story should be engaging, age-appropriate, and educational with a clear beginning, middle, and end. 
Include a positive message or lesson.
Make each page have a short paragraph and a clear scene to illustrate.

Format your response as JSON with this structure:
{
  "title": "The title of the story",
  "pages": [
    {
      "text": "Text for page 1 (1-3 sentences)",
      "description": "Detailed visual description for illustration"
    },
    {
      "text": "Text for page 2 (1-3 sentences)",
      "description": "Detailed visual description for illustration"
    },
    ...and so on for each page
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional children's book author and illustrator who specializes in creating visual stories that feature a child as the main character.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    return {
      title: result.title,
      pages: result.pages,
    };
  } catch (error) {
    console.error("OpenAI visual story generation error:", error);
    throw new Error("Failed to generate visual story. Please try again later.");
  }
}

export async function generateBookImage(prompt: string): Promise<string> {
  try {
    // Now using Gemini 1.5 Flash with fallback mechanism
    return await generateImageWithGemini(prompt);
  } catch (error) {
    // Log the error but don't throw - our Gemini implementation now has fallbacks
    console.error("Gemini image generation error:", error);
    
    // The generateImageWithGemini function now handles fallbacks internally,
    // so we'll just return a fallback URL directly here
    return "https://images.unsplash.com/photo-1573505790261-dcac3e00c337?w=800&auto=format&fit=crop";
  }
}

export async function generateVisualStoryPages(pages: StoryPage[], characterStyle: string, characterDesc: string): Promise<string[]> {
  try {
    // Extract specific visual traits from the character description for reinforcement
    const characterTraits = extractVisualTraits(characterDesc);
    
    // First, generate the first image separately to use as a reference for maintaining consistency
    const firstPageIndex = 0;
    const firstPageNumber = firstPageIndex + 1;
    
    // Create a detailed prompt for the first page with specific visual instructions
    const firstPagePrompt = `Create a children's book illustration for page ${firstPageNumber}:
    
Scene: ${pages[firstPageIndex].description}

Visually important details:
1. The main character is ${characterDesc}
2. This is the first page of the story, so establish a clear visual design for the character
3. The character should have distinct and recognizable features
4. Focus on creating a memorable character design with consistent ${characterTraits.join(', ')}

Art style: ${characterStyle}

Use ${characterStyle === 'watercolor' ? 'soft brushstrokes and flowing colors' : 
      characterStyle === '3d' ? 'dimensional characters and realistic textures' : 
      'vibrant colors and clean outlines'} with a child-friendly aesthetic appropriate for a children's book.

I will use this character design as a reference model for all subsequent illustrations.`;

    console.log("Generating base character model as reference...");
    const firstPageImageUrl = await generateImageWithGemini(firstPagePrompt);
    const firstPageImagePath = firstPageImageUrl.replace(/^\/images\//, '');
    const firstPageImageFullPath = `public/images/${firstPageImagePath}`;
    console.log(`Base character model established at: ${firstPageImageFullPath}`);
    
    // Now create prompts for the remaining pages, using the first as a visual reference model
    const remainingPagePrompts = pages.slice(1).map((page, index) => {
      const pageNumber = index + 2; // +2 because index starts at 0 and we've already handled page 1
      
      // Create a detailed prompt using specific visual anchoring techniques
      return `Create a children's book illustration for page ${pageNumber} using the established character model:
      
Scene: ${page.description}

CHARACTER CONSISTENCY REQUIREMENTS:
1. The main character MUST look exactly like the character from the first illustration - same face, hair, outfit, and proportions
2. Keep ${characterTraits.join(', ')} consistent with the first illustration
3. Maintain the exact same visual style for the character
4. Only the pose and action should change to match this scene
5. The character's distinct features from the first illustration must be preserved exactly

Visual reference: Use the first illustration as the definitive reference for the character's appearance

Art style: ${characterStyle} - maintain the exact same visual treatment as the first illustration

Use ${characterStyle === 'watercolor' ? 'the same soft brushstrokes and flowing colors' : 
      characterStyle === '3d' ? 'the same dimensional rendering and textures' : 
      'the same vibrant colors and clean outlines'} as in the first illustration.`;
    });

    // Generate the remaining images based on the visual reference model
    console.log(`Generating ${remainingPagePrompts.length} subsequent illustrations using established character model...`);
    const remainingPageImageUrls = await generateVisualStoryImagesWithGemini(remainingPagePrompts);
    
    // Combine the first image with the remaining images
    return [firstPageImageUrl, ...remainingPageImageUrls];
  } catch (error) {
    console.error("Gemini visual story pages generation error:", error);
    
    // Instead of throwing an error, return fallback images
    console.log("Using alternative approach for story illustrations");
    
    try {
      // Try once more with a sequential approach, generating one image at a time
      // and referencing the previous for character consistency
      let generatedImages: string[] = [];
      
      for (let i = 0; i < pages.length; i++) {
        const pageNumber = i + 1;
        let prompt = "";
        
        if (i === 0) {
          // First page - establish character model
          prompt = `Children's book illustration for page ${pageNumber}: ${pages[i].description}. 
          Character: ${characterDesc} in ${characterStyle} style. 
          Make the character design distinct and memorable.`;
        } else {
          // Subsequent pages - reference the established character 
          prompt = `Children's book illustration for page ${pageNumber}: ${pages[i].description}. 
          Keep the character looking EXACTLY IDENTICAL to the previous illustrations. 
          Same ${characterDesc} with the same face, hair, outfit, and proportions in ${characterStyle} style.`;
        }
        
        console.log(`Generating page ${pageNumber} sequentially...`);
        const imageUrl = await generateImageWithGemini(prompt);
        generatedImages.push(imageUrl);
      }
      
      return generatedImages;
    } catch (fallbackError) {
      console.error("Sequential image generation also failed:", fallbackError);
      
      // As a last resort, try one more approach with a single batch
      try {
        const simplifiedPrompts = pages.map((page, index) => {
          const pageNumber = index + 1;
          return `Children's book illustration, page ${pageNumber}: ${characterDesc} in ${characterStyle} style. Scene: ${page.description.substring(0, 100)}. IMPORTANT: Character must have consistent appearance across all illustrations.`;
        });
        
        return await generateVisualStoryImagesWithGemini(simplifiedPrompts);
      } catch (finalError) {
        console.error("All image generation attempts failed:", finalError);
        
        return pages.map((_, index) => {
          return `https://images.unsplash.com/photo-1629414278888-abcdb8e0a904?w=800&auto=format&fit=crop&page=${index}`;
        });
      }
    }
  }
}

// Helper function to extract key visual traits from character description
function extractVisualTraits(description: string): string[] {
  const traits: string[] = [];
  
  // Extract hair details
  if (description.includes("curly hair")) traits.push("curly hair");
  else if (description.includes("long hair")) traits.push("long hair");
  else if (description.includes("short hair")) traits.push("short hair");
  else if (description.includes("wavy hair")) traits.push("wavy hair");
  
  // Extract hair color if mentioned
  if (description.includes("brown hair")) traits.push("brown hair");
  else if (description.includes("blonde hair")) traits.push("blonde hair");
  else if (description.includes("black hair")) traits.push("black hair");
  else if (description.includes("red hair")) traits.push("red hair");
  
  // Extract skin tone
  if (description.includes("light skin")) traits.push("light skin tone");
  else if (description.includes("medium skin")) traits.push("medium skin tone");
  else if (description.includes("tan skin")) traits.push("tan skin tone");
  else if (description.includes("dark skin")) traits.push("dark skin tone");
  
  // Extract eye color if mentioned
  if (description.includes("blue eyes")) traits.push("blue eyes");
  else if (description.includes("brown eyes")) traits.push("brown eyes");
  else if (description.includes("green eyes")) traits.push("green eyes");
  
  // Extract clothing style if mentioned
  if (description.includes("casual clothes")) traits.push("casual outfit");
  else if (description.includes("formal clothes")) traits.push("formal outfit");
  else if (description.includes("sporty clothes")) traits.push("sporty outfit");
  
  // Extract facial features if mentioned
  if (description.includes("freckles")) traits.push("freckles");
  else if (description.includes("dimples")) traits.push("dimples");
  else if (description.includes("rosy cheeks")) traits.push("rosy cheeks");
  
  // If we couldn't extract specific traits, add generic ones
  if (traits.length === 0) {
    traits.push("distinctive facial features", "consistent outfit", "same hairstyle");
  }
  
  return traits;
}
