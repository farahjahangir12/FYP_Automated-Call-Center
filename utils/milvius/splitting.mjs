import { Milvus } from "@langchain/community/vectorstores/milvus";
import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

dotenv.config();

// Initialize Cohere embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY, // Your Cohere API key
  model: "embed-english-v3.0", // Specify Cohere model
});

// Function to split content into chunks
const createChunks = (content, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to process PDF and insert text into Milvus using LangChain
const processPDF = async (pdfFilePath, collectionName) => {
  try {
    console.log(`Processing PDF: ${pdfFilePath} for collection: ${collectionName}`);

    // Load the PDF file
    const loader = new PDFLoader(pdfFilePath);
    const documents = await loader.load();

    if (!documents || documents.length === 0) {
      throw new Error(`No content found in the PDF: ${pdfFilePath}`);
    }

    console.log(`Loaded ${documents.length} pages from ${pdfFilePath}`);

    // Combine all page content into a single string
    const content = documents.map((doc) => doc.pageContent).join("\n");

    // Create chunks from the content
    const chunks = createChunks(content);

    if (!chunks || chunks.length === 0) {
      throw new Error(`No chunks were created for the content in ${pdfFilePath}`);
    }

    console.log(`Generated ${chunks.length} chunks for ${pdfFilePath}`);

    // Insert text into Milvus using LangChain’s `Milvus.fromTexts()`
    const vectorStore = await Milvus.fromTexts(
      chunks,
      chunks.map((_, index) => ({ id: index + 1 })), // Generate unique IDs for each chunk
      embeddings,
      {
        collectionName: collectionName, // Specify the collection name
      }
    );

    console.log(`Inserted ${chunks.length} vectors into collection: ${collectionName}`);
  } catch (error) {
    console.error(`Error processing PDF: ${error.message}`);
    console.error("Full Error:", error); // Log the full error object for debugging
  }
};

// Function to process multiple PDFs
const processMultiplePDFs = async () => {
  const pdfFiles = [
    { path: "utils/milvius/Departments_details (1).pdf", topic: "Department_Details" },
    { path: "utils/milvius/General consulting services.pdf", topic: "General_Consulting_Services" },
    { path: "utils/milvius/Hospital Policy for Patient Safety and Quality of Care (1).pdf", topic: "Patient_Care_Guides" },
    { path: "utils/milvius/Information Document for Outpatients at Osaka University Hospital_v2.pdf", topic: "Outpatient_Care_and_Policies" },
    { path: "utils/milvius/Patients to be admitted into the hospitals_v2.pdf", topic: "Admission_Policies_and_Regulations" },
    { path: "utils/milvius/Principles, Fundamental Policies, Protection of Patients' Rights, and Obligations of Patients (1).pdf", topic: "Hospital_Rules_and_Regulations" },
  ];

  for (const { path, topic } of pdfFiles) {
    console.log(`Processing PDF: ${path} for topic: ${topic}`);
    await processPDF(path, topic);
  }
};

// Run the processing of PDFs
processMultiplePDFs();
