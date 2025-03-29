// server/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as fs from "fs";
import mime from "mime-types";
import path from "path";
import crypto from "crypto";

// Obtener la API key desde las variables de entorno
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not configured.");
}

// Inicializar GoogleGenerativeAI y GoogleAIFileManager con la API key
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Sube un archivo a Gemini.
 *
 * Consulta: https://ai.google.dev/gemini-api/docs/prompting_with_media
 *
 * @param filePath - Ruta local del archivo a subir.
 * @param mimeType - Tipo MIME del archivo.
 * @returns La información del archivo subido.
 */
async function uploadToGemini(filePath: string, mimeType: string) {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: filePath,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

// Seleccionar el modelo de generación de imágenes de Gemini
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
});

// Configuración de generación (ajustar según la documentación oficial)
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: ["image", "text"],
  responseMimeType: "text/plain",
};

// Crear directorio para imágenes si no existe
const imagesDir = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Genera una imagen utilizando la API de Gemini.
 *
 * Si se proporciona baseImagePath, se sube el archivo y se incluye en el historial
 * para que el modelo lo use como referencia, reforzando la consistencia visual.
 *
 * @param prompt - Texto descriptivo para generar la imagen.
 * @param baseImagePath - (Opcional) Ruta local del archivo de imagen que se usará como referencia.
 * @returns URL de la imagen generada.
 */
async function generateImage(prompt: string, baseImagePath?: string): Promise<string> {
  try {
    // Se integran las instrucciones de consistencia directamente en el prompt
    const finalPrompt = "Por favor, mantén la consistencia absoluta del personaje y su estilo visual. " +
                        "Utiliza la imagen de referencia (si está disponible) para asegurar que el personaje conserve " +
                        "sus rasgos característicos (pelo rizado, chaqueta roja, sonrisa distintiva) y el estilo visual " +
                        "del escenario base. Evita variaciones en la apariencia y en el estilo. " +
                        prompt;

    // Construir el historial con un único mensaje de rol "user"
    const history: any[] = [{
      role: "user",
      parts: [{ text: finalPrompt }]
    }];
    
    // Si se proporciona una imagen base, súbela y añádela al historial
    if (baseImagePath) {
      const baseFile = await uploadToGemini(baseImagePath, "image/png");
      history.push({
        role: "user",
        parts: [{ fileData: { mimeType: baseFile.mimeType, fileUri: baseFile.uri } }]
      });
    }
    
    // Inicia la sesión de chat con el modelo usando la configuración y el historial definido
    const chatSession = model.startChat({
      generationConfig,
      history,
    });
    
    // Envía un mensaje para generar la imagen
    const result = await chatSession.sendMessage("Genera una imagen basada en el contexto anterior, sin alterar el estilo ni los rasgos del personaje.");
    
    // Procesa las respuestas para extraer la imagen generada
    const candidates = result.response.candidates || [];
    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
      const candidate = candidates[candidateIndex];
      if (candidate.content && candidate.content.parts) {
        for (let partIndex = 0; partIndex < candidate.content.parts.length; partIndex++) {
          const part = candidate.content.parts[partIndex];
          if (part.inlineData) {
            try {
              // Determina la extensión del archivo a partir del MIME type
              const extension = mime.extension(part.inlineData.mimeType) || "png";
              // Genera un nombre de archivo único
              const uniqueId = crypto.randomBytes(6).toString("hex");
              const filename = `image_${uniqueId}.${extension}`;
              const filePath = path.join(imagesDir, filename);
              
              // Escribe el archivo decodificando el contenido en base64
              fs.writeFileSync(filePath, Buffer.from(part.inlineData.data, "base64"));
              console.log(`Image generated and saved to: ${filePath}`);
              
              // Devuelve la URL para usar en el frontend
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
    throw new Error(`Error generating image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Función que genera una imagen utilizando la API de Gemini con mecanismos de fallback.
 *
 * @param prompt - Texto descriptivo para generar la imagen.
 * @param baseImagePath - (Opcional) Ruta local del archivo de imagen de referencia.
 * @returns URL de la imagen generada.
 */
export async function generateImageWithGemini(prompt: string, baseImagePath?: string): Promise<string> {
  try {
    console.log("Generating image with Gemini for prompt:", prompt.substring(0, 100) + "...");
    return await generateImage(prompt, baseImagePath);
  } catch (error) {
    console.error("Error with image generation API:", error);
    
    // Intentar con un prompt simplificado que refuerce la referencia visual y de estilo
    try {
      let simplifiedPrompt = prompt.split(".")[0] + ". ";
      if (baseImagePath) {
        simplifiedPrompt += "Utiliza la imagen de referencia y mantén la consistencia absoluta en los rasgos del personaje y su estilo visual. Ilustración en estilo de libro infantil, sin alterar el escenario base.";
      } else {
        simplifiedPrompt += "Ilustración en estilo de libro infantil, manteniendo la consistencia en el estilo.";
      }
      console.log("Trying with simplified prompt:", simplifiedPrompt);
      return await generateImage(simplifiedPrompt, baseImagePath);
    } catch (fallbackError) {
      console.error("Image generation API failed", fallbackError);
      // Retorna una imagen de fallback si todos los intentos fallan
      return "https://images.unsplash.com/photo-1573505790261-dcac3e00c337?w=800&auto=format&fit=crop";
    }
  }
}

/**
 * Genera múltiples imágenes para una historia visual.
 *
 * @param prompts - Array de textos descriptivos para cada imagen.
 * @param baseImagePath - (Opcional) Ruta local del archivo de imagen de referencia.
 * @returns Array de URLs de las imágenes generadas.
 */
export async function generateVisualStoryImagesWithGemini(prompts: string[], baseImagePath?: string): Promise<string[]> {
  console.log(`Generating ${prompts.length} images for visual story...`);
  
  // Genera todas las imágenes en paralelo, aplicando mecanismos de fallback en cada una
  const results = await Promise.all(
    prompts.map(async (prompt, index) => {
      try {
        const imageUrl = await generateImageWithGemini(prompt, baseImagePath);
        console.log(`Successfully generated image ${index + 1}`);
        return { success: true, index, url: imageUrl };
      } catch (error) {
        console.error(`Error generating image for prompt index ${index}:`, error);
        return { success: false, index, error };
      }
    })
  );
  
  // Extrae las URLs de las imágenes generadas o asigna una URL de fallback
  const imageUrls = prompts.map((_prompt, index) => {
    const result = results.find(r => r.index === index);
    if (result?.success) {
      return result.url;
    }
    return `https://images.unsplash.com/photo-1629414278888-abcdb8e0a904?w=800&auto=format&fit=crop&page=${index}`;
  });
  
  console.log(`Completed image generation: ${imageUrls.length} images produced`);
  return imageUrls;
}
