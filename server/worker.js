import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker(
    "uploaded-files-queue",
    async(job) => {
        console.log("Processing job:", job.data);
        const data = JSON.parse(job.data);

        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        console.log("Loaded documents:", docs);
        // const textSplitter = new CharacterTextSplitter({
        //     chunkSize: 300,
        //     chunkOverlap: 0,
        // });
        // const texts = await textSplitter.splitText(docs);
        // console.log("Splitting text into chunks:", texts);
    }, {
        concurrency: 100,
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);