import { Milvus } from "@langchain/community/vectorstores/milvus";
import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq();

export async function main() {
  // Step 1: Retrieve similar documents using Milvus and Cohere embeddings
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
  });

  const vectorStore = await Milvus.fromExistingCollection(embeddings, {
    collectionName: "Department_Details", // Replace with your collection name
  });

  // Query Milvus to get similar documents
  const response = await vectorStore.similaritySearch("What departments do you have?", 6);

  // Extract the relevant documents
  const relevantDocuments = response.map((item) => item.pageContent);

  // Step 2: Format the retrieved documents into a query for GroQ/Llama
  const prompt = `
    I have the following information about hospital policies:
    ${relevantDocuments.join("\n\n")}
  
    Given this information, answer the following question:
    What departments do you have in the hospital?
  `;

  // Step 3: Send the query to GroQ/Llama
  const stream = await getGroqChatStream(prompt);

  // Step 4: Process and output the response from GroQ/Llama
  for await (const chunk of stream) {
    // Print the completion returned by Llama
    console.log(chunk.choices[0]?.delta?.content || "");
  }
}

// Function to query GroQ with Llama
export async function getGroqChatStream(prompt) {
  return groq.chat.completions.create({
    // Required parameters
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: prompt, // Send the prompt with the retrieved documents
      },
    ],
    model: "llama-3.3-70b-versatile", // Replace with your Llama model
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    stop: null,
    stream: true,
  });
}

// Call the main function
main();
