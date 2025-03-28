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
    
    // Construct the prompt with detailed instructions for a visual story
    const prompt = `Create a ${storyLength} children's story for a ${bookData.childAge} year old with the following details:

Main Character: ${bookData.childName}, a ${bookData.childGender === 'neutral' ? 'child' : bookData.childGender} with ${bookData.hairStyle} hair and ${bookData.skinTone} skin tone.

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
    const characterDesc = `${bookData.childName}, a ${bookData.childGender === 'neutral' ? 'child' : bookData.childGender} with ${bookData.hairStyle} hair and ${bookData.skinTone} skin tone`;
    
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
    // Now using Gemini instead of DALL-E 3
    return await generateImageWithGemini(prompt);
  } catch (error) {
    console.error("Gemini image generation error:", error);
    throw new Error("Failed to generate image with Gemini. Please try again.");
  }
}

export async function generateVisualStoryPages(pages: StoryPage[], characterStyle: string, characterDesc: string): Promise<string[]> {
  try {
    // Create prompts for each page
    const imagePrompts = pages.map((page, index) => {
      const isFirstPage = index === 0;
      const pageNumber = index + 1;
      
      // Create a detailed prompt for this specific page
      return `Create a ${characterStyle} style children's book illustration for page ${pageNumber}:
      
Scene: ${page.description}

The illustration should feature ${characterDesc}.
${isFirstPage ? "This is the first page of the story, so make sure to establish the setting and introduce the character." : ""}

Use vibrant colors and a child-friendly aesthetic appropriate for a children's book.`;
    });

    // Use Gemini to generate all the images
    return await generateVisualStoryImagesWithGemini(imagePrompts);
  } catch (error) {
    console.error("Gemini visual story pages generation error:", error);
    throw new Error("Failed to generate story illustrations with Gemini. Please try again later.");
  }
}
