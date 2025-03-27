import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bookGenerationSchema, checkoutSchema } from "@shared/schema";
import { generateStory, generateBookImage } from "./openai";
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
      
      // Generate story using OpenAI
      const storyResult = await generateStory(validatedData);
      
      // Generate cover image
      const coverImageUrl = await generateBookImage(`Book cover for "${storyResult.title}", a children's book. The main character is a ${validatedData.childGender} named ${validatedData.childName} with ${validatedData.hairStyle} hair and ${validatedData.skinTone} skin tone.`);
      
      // Generate preview images (typically 2 for the preview)
      const previewImages = await Promise.all([
        generateBookImage(`Illustration for a children's book page showing ${validatedData.childName} in a ${validatedData.storyTheme} setting, ${validatedData.characterStyle} style.`),
        generateBookImage(`Illustration for a children's book showing ${validatedData.childName} trying to ${validatedData.storyGoal} in a ${validatedData.storyTheme} world.`)
      ]);
      
      // Store the generated book
      const book = await storage.createBook({
        title: storyResult.title,
        childName: validatedData.childName,
        childAge: validatedData.childAge,
        childGender: validatedData.childGender,
        characterStyle: validatedData.characterStyle,
        hairStyle: validatedData.hairStyle,
        skinTone: validatedData.skinTone,
        storyTheme: validatedData.storyTheme,
        storyGoal: validatedData.storyGoal,
        storyLength: validatedData.storyLength,
        storyContent: storyResult.content,
        coverImageUrl,
        previewImages,
        format: "pending", // Will be set during checkout
        price: "0", // Will be set during checkout
        interests: validatedData.interests,
        companions: validatedData.companions
      });
      
      // Return the generated book details
      res.status(200).json({
        bookId: book.id,
        title: storyResult.title,
        content: storyResult.content,
        coverImageUrl,
        previewImages
      });
    } catch (error) {
      console.error("Error generating book:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to generate book" });
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
