import {pipeline} from "@xenova/transformers";
import { GoogleGenAI } from "@google/genai";

let embedder = null;


async function getEmbedder(){
    if(!embedder){
        embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return embedder;
}

export async function embed(text){
    console.log("Embeedding has started.");
    const model = await getEmbedder();
    const output = await model(text, {pooling : "mean", normalize : true});
    console.log("Embedding done.")
    return Array.from(output.data);
}

export async function embed2(text){
    console.log("Embeedding has started.");
    const ai = new GoogleGenAI({apiKey : process.env.GoogleGenAI});
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
    });
    return Array.from(response.embeddings[0].values);   
}

