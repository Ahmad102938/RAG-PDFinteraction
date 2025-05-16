import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantClient } from "@qdrant/js-client-rest";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

const worker = new Worker(
    "uploaded-files-queue",
    async(job) => {
        try {
            console.log("Processing job:", job.data);
            const data = JSON.parse(job.data);
            const { collectionName } = data; // Simplified parsing since collectionName is a top-level property

            // 1) Load the PDF
            const loader = new PDFLoader(data.path);
            const docs = await loader.load();
            console.log("Loaded documents:", docs.length, "documents");

            // 2) Split into ~1k-token pieces
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const chunkedDocs = await splitter.splitDocuments(docs);
            console.log(`✂️ Split into ${chunkedDocs.length} chunks`);

            // 3) Create embeddings using Hugging Face model
            const embeddings = new HuggingFaceTransformersEmbeddings({
                modelName: "sentence-transformers/all-MiniLM-L6-v2",
            });

            // 4) Set up Qdrant vector store
            const qdrantClient = new QdrantClient({ url: "http://localhost:6333" });
            const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
                client: qdrantClient,
                collectionName: collectionName,
                vectorName: "embedding",
                distance: "Cosine",
            });

            // 5) Add documents to Qdrant
            await vectorStore.addDocuments(chunkedDocs);
            console.log(
                `✅ All ${chunkedDocs.length} chunks added to Qdrant collection "${collectionName}"`
            );

            // 6) (Optional) Verify the collection in Qdrant
            const collectionInfo = await qdrantClient.getCollection(collectionName);
            console.log("Qdrant collection info:", collectionInfo);
        } catch (error) {
            console.error("Error processing job:", error);
            throw error; // Re-throw to mark the job as failed in BullMQ if needed
        }
    }, {
        concurrency: 100,
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);