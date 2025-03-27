import OpenAI from "openai";
import { BookGenerationRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_dev" });

interface StoryResult {
  title: string;
  content: string;
}

export async function generateStory(bookData: BookGenerationRequest): Promise<StoryResult> {
  try {
    const storyLengthMap = {
      "1": "short (approximately 300-500 words)",
      "2": "medium (approximately 500-800 words)",
      "3": "long (approximately 800-1200 words)"
    };
    
    const storyLength = storyLengthMap[bookData.storyLength as keyof typeof storyLengthMap] || "medium";
    
    const genderPronoun = bookData.childGender === 'boy' ? 'he' : 
                           bookData.childGender === 'girl' ? 'she' : 'they';
    
    const genderPossessive = bookData.childGender === 'boy' ? 'his' : 
                              bookData.childGender === 'girl' ? 'her' : 'their';
    
    // Construct the prompt with detailed instructions
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

    const result = JSON.parse(response.choices[0].message.content);
    return {
      title: result.title,
      content: result.content,
    };
  } catch (error) {
    console.error("OpenAI story generation error:", error);
    throw new Error("Failed to generate story. Please try again later.");
  }
}

export async function generateBookImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a children's book illustration: ${prompt}. Use a vibrant, colorful style with a child-friendly aesthetic. Ensure the image is appealing to children, with bright colors and a whimsical, playful style.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url;
  } catch (error) {
    console.error("OpenAI image generation error:", error);
    // Return a placeholder image in case of error
    return "https://images.unsplash.com/photo-1576337649227-f2857a934b49?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80";
  }
}
