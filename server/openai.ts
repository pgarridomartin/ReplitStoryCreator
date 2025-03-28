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
    // Create prompts for each page
    const imagePrompts = pages.map((page, index) => {
      const isFirstPage = index === 0;
      const pageNumber = index + 1;
      
      // Create a detailed prompt for this specific page
      return `Create a children's book illustration for page ${pageNumber}:
      
Scene: ${page.description}

The illustration should feature ${characterDesc}.
${isFirstPage ? "This is the first page of the story, so make sure to establish the setting and introduce the character." : ""}

Art style: ${characterStyle}

Use ${characterStyle === 'watercolor' ? 'soft brushstrokes and flowing colors' : 
      characterStyle === '3d' ? 'dimensional characters and realistic textures' : 
      'vibrant colors and clean outlines'} with a child-friendly aesthetic appropriate for a children's book.`;
    });

    // Use Gemini to generate all the images
    return await generateVisualStoryImagesWithGemini(imagePrompts);
  } catch (error) {
    console.error("Gemini visual story pages generation error:", error);
    
    // Instead of throwing an error, return fallback images
    // Our updated Gemini implementation handles fallbacks automatically
    console.log("Using fallback images for the story");
    
    try {
      // Try once more with different approach
      const fallbackPrompts = pages.map((page) => {
        // Create a shorter, simplified prompt but still maintain art style reference
        return `Children's book illustration in ${characterStyle} style: ${page.description.substring(0, 100)}. Art style: ${characterStyle}`;
      });
      
      return await generateVisualStoryImagesWithGemini(fallbackPrompts);
    } catch (fallbackError) {
      console.error("Fallback image generation also failed:", fallbackError);
      
      // As a last resort, return one default image per page
      return pages.map((_, index) => {
        return `https://images.unsplash.com/photo-1629414278888-abcdb8e0a904?w=800&auto=format&fit=crop&page=${index}`;
      });
    }
  }
}
