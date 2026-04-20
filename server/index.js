import dotenv from "dotenv";
import cors from "cors";
import express, { response } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import { embed, embed2 } from "./embedder.js";

import { retrieveTopK } from "./retriever.js";
import { chunkText } from "./chunker.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GoogleGenAI,
});

let vectorStore = [];

async function extractPdfData(pdfBuffer) {
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    console.log(result.text);
    return result.text;
  } catch (err) {
    console.log("PDF parse error : ", err);
  }
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let text = "";
    if (req.file.mimetype === "application/pdf") {
      try {
        text = await extractPdfData(req.file.buffer);
        console.log(text);
      } catch (err) {
        console.error("PDF parsing error : ", err.message);
        return res.status(400).json({
          error: "Failed to parse pdf.",
        });
      }
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    const chunks = chunkText(text);
[]
    vectorStore = await Promise.all(
      chunks.map(async (chunk) => ({
        ...chunk,
        vector: await embed2(chunk.text),
      })),
    );

    res.status(200).json({
      message: "Document Indexed",
      chunks: vectorStore.length,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/chat", async (req, res) => {
  const { query } = req.body;

  if (!vectorStore.length) {
    return res.status(400).json({
      error: "No documnet uploaded yet.",
    });
  }

  const queryVector = await embed2(query);
  const topChunks = retrieveTopK(queryVector, vectorStore, 5);
  const context = topChunks.map((c) => c.text).join("\n\n---\n\n");

  const prompt = `Answer the question using only the context below. If the answer isn't in the context, say so.
    Context: 
    ${context}
    Question: 
    ${query}
    `;
  const result = await genAI.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
  });
  const answer = result.text;
  res.status(200).json({
    answer,
    chunks: topChunks.map((c) => c.text),
  });
});

(async () => {
  console.log("Warming up embedding model...");
  await embed2("hello world");
  console.log("Embedding model ready");
})();

app.listen(3001, () => console.log("server is up on 3001"));
