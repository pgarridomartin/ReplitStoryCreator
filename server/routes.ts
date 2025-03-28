import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bookGenerationSchema, checkoutSchema } from "@shared/schema";
import { generateStory, generateBookImage, generateVisualStory, generateVisualStoryPages } from "./openai";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const API_PREFIX = "/api";

  // Error handling middleware
  app.use((req, res, next) => {
    try {
      next();
    } catch (error) {
      console.error("Request error:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate book from user input
  app.post(`${API_PREFIX}/books/generate`, async (req, res) => {
    try {
      // Validate request body
      const validatedData = bookGenerationSchema.parse(req.body);
      
      // Generate visual story using OpenAI (new approach)
      const visualStory = await generateVisualStory(validatedData);
      
      // Character description for consistent appearance in illustrations
      const characterDesc = `${validatedData.childName}, a ${validatedData.childGender === 'neutral' ? 'child' : validatedData.childGender} with ${validatedData.hairStyle} hair and ${validatedData.skinTone} skin tone`;
      
      // Generate cover image 
      const coverImageUrl = await generateBookImage(`Book cover for "${visualStory.title}", a children's book. The main character is ${characterDesc}. Style: ${validatedData.characterStyle}.`);
      
      // Generate illustrations for story pages
      const allPageImages = await generateVisualStoryPages(
        visualStory.pages, 
        validatedData.characterStyle,
        characterDesc
      );
      
      // Select preview images (we'll use the first 2 illustrations after the cover for preview)
      const previewImages = allPageImages.slice(0, Math.min(2, allPageImages.length));
      
      // Combine all page text to form the complete story content
      const storyContent = visualStory.pages.map(page => page.text).join('\n\n');
      
      // Store the generated book
      const book = await storage.createBook({
        title: visualStory.title,
        childName: validatedData.childName,
        childAge: validatedData.childAge,
        childGender: validatedData.childGender,
        // Basic character customization
        characterStyle: validatedData.characterStyle,
        hairStyle: validatedData.hairStyle,
        skinTone: validatedData.skinTone,
        // Advanced character customization
        hairColor: validatedData.hairColor,
        eyeColor: validatedData.eyeColor,
        clothingStyle: validatedData.clothingStyle,
        accessories: validatedData.accessories || [],
        facialFeatures: validatedData.facialFeatures || [],
        height: validatedData.height,
        buildType: validatedData.buildType,
        // Story settings
        storyTheme: validatedData.storyTheme,
        storyGoal: validatedData.storyGoal,
        storyLength: validatedData.storyLength,
        storyContent: storyContent,
        coverImageUrl,
        previewImages,
        format: "pending", // Will be set during checkout
        price: "0", // Will be set during checkout
        interests: validatedData.interests,
        companions: validatedData.companions,
        // Store all page images and text
        allPageImages: allPageImages,
        storyPages: visualStory.pages
      });
      
      // Return the generated book details
      res.status(200).json({
        bookId: book.id,
        title: visualStory.title,
        content: storyContent,
        coverImageUrl,
        previewImages,
        // Include page info for potentially showing the entire book 
        pages: visualStory.pages.map((page, index) => ({
          text: page.text,
          imageUrl: index < allPageImages.length ? allPageImages[index] : null
        }))
      });
    } catch (error) {
      console.error("Error generating book:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate book" 
      });
    }
  });

  // Create order
  app.post(`${API_PREFIX}/orders`, async (req, res) => {
    try {
      // Validate checkout data
      const validatedData = checkoutSchema.parse(req.body);
      
      const { bookId } = validatedData;
      
      if (!bookId) {
        return res.status(400).json({ message: "Book ID is required" });
      }
      
      // Get the book
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Update book format and price
      await storage.updateBook(bookId, {
        format: validatedData.format,
        price: validatedData.total
      });
      
      // Create the order
      const order = await storage.createOrder({
        ...validatedData,
        bookId,
        status: "pending"
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
