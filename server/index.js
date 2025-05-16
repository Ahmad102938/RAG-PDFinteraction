import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

// Ensure uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const queue = new Queue("uploaded-files-queue", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

// Initialize embeddings and vector store lazily
let vectorStore;
async function initializeVectorStore() {
    if (!vectorStore) {
        const embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: "sentence-transformers/all-MiniLM-L6-v2",
        });
        const qdrantClient = new QdrantClient({ url: "http://localhost:6333" });
        vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            client: qdrantClient,
            collectionName: "documents",
            vectorName: "embedding",
            distance: "Cosine",
        });
    }
    return vectorStore;
}

// Initialize Gemini 1.5 Flash
const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-1.5-flash",
    maxOutputTokens: 128, // Optimize for low usage
});

// Define prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
    Context: {context}
    Question: {query}
    you are a helpful assistant, who answers the users query based on the context provided from the documents.
`);

app.get("/", (req, res) => {
    return res.json({ status: "all Good!!" });
});

app.post("/upload/pdf", upload.single("pdf"), async(req, res) => {
    try {
        await queue.add(
            "file-ready",
            JSON.stringify({
                filename: req.file.originalname,
                source: req.file.destination,
                path: req.file.path,
                collectionName: "documents",
            })
        );
        return res.json({ message: "File uploaded successfully", file: req.file });
    } catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({ error: "Failed to process file" });
    }
});

app.get("/chat", async(req, res) => {
    try {
        const userQuery = req.query.q || "what is demand";
        await initializeVectorStore();
        const retriever = vectorStore.asRetriever({
            k: 1, // what this k stand for from docs?
        });
        const retrievedDocs = await retriever.invoke(userQuery);

        const context = retrievedDocs
            .map(doc => doc.pageContent)
            .join("\n\n")
            .slice(0, 1000);

        const prompt = await promptTemplate.format({
            context: context || "No relevant context found.",
            query: userQuery,
        });

        // Call Gemini
        const response = await llm
            .pipe(new StringOutputParser())
            .invoke(prompt);

        return res.json({
            query: userQuery,
            context: retrievedDocs,
            answer: response,
        });
    } catch (error) {
        console.error("Error processing chat query:", error);
        return res.status(500).json({ error: "Failed to process query" });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});