import { Milvus } from "@langchain/community/vectorstores/milvus";
import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cohere embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY, // Your Cohere API key
  model: "embed-english-v3.0", // Specify Cohere model
});

// Load existing Milvus collection
const vectorStore = await Milvus.fromExistingCollection(
  embeddings,
  {
    collectionName: "Department_Details", // Specify the collection name
  }
);

// Perform a similarity search in the Milvus collection
const response = await vectorStore.similaritySearch("What departments do you have?", 2);

console.log(response);
