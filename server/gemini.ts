// server/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import mime from "mime-types";

// Se obtiene la API key desde las variables de entorno
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("La variable de entorno GEMINI_API_KEY no está configurada.");
}

// Instancia de GoogleGenerativeAI con la API key
const genAI = new GoogleGenerativeAI(apiKey);

// Seleccionamos el modelo de generación de imágenes de Gemini
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
});

// Configuración de generación (ajústala si es necesario según la documentación oficial)
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: ["image", "text"],
  responseMimeType: "text/plain",
};

/**
 * Genera una imagen usando la API de Gemini de Google AI Studio.
 *
 * @param prompt - Texto descriptivo que se usará para generar la imagen.
 * @returns Una promesa que se resuelve con el nombre del archivo de la imagen generada.
 * @throws Error si la respuesta no contiene imágenes o falla la generación.
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    // Inicia una sesión de chat con el modelo usando la configuración definida
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Envía el prompt al modelo y espera la respuesta
    const result = await chatSession.sendMessage(prompt);

    // Procesa los candidatos de respuesta para extraer la imagen
    const candidates = result.response.candidates;
    for (
      let candidateIndex = 0;
      candidateIndex < candidates.length;
      candidateIndex++
    ) {
      const candidate = candidates[candidateIndex];
      if (candidate.content && candidate.content.parts) {
        for (
          let partIndex = 0;
          partIndex < candidate.content.parts.length;
          partIndex++
        ) {
          const part = candidate.content.parts[partIndex];
          if (part.inlineData) {
            try {
              // Determina la extensión del archivo a partir del MIME type
              const extension = mime.extension(part.inlineData.mimeType);
              const filename = `output_${candidateIndex}_${partIndex}.${extension}`;
              // Escribe el archivo decodificando el contenido base64
              fs.writeFileSync(
                filename,
                Buffer.from(part.inlineData.data, "base64"),
              );
              console.log(`Output written to: ${filename}`);
              return filename; // Se retorna el primer archivo generado
            } catch (err) {
              console.error("Error escribiendo el archivo:", err);
            }
          }
        }
      }
    }
    throw new Error("La respuesta de Gemini no contiene imágenes.");
  } catch (error) {
    throw new Error(`Error al generar imagen: ${error}`);
  }
}

// Ejemplo de uso directo si se ejecuta este fichero de forma independiente
if (require.main === module) {
  (async () => {
    const prompt = "Una escena de fantasía épica con dragones y castillos";
    try {
      const imageFilename = await generateImage(prompt);
      console.log("Imagen generada:", imageFilename);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}
