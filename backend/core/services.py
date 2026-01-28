from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from django.conf import settings


class PDFLLMService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )
        self.llm = self._load_llm()
    
    def _load_llm(self):
        # Use Google Gemini API - using Gemma model
        return ChatGoogleGenerativeAI(
            model="gemini-3-flash-preview", #gemini-3-flash-preview -  gemma-3-27b-it
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7,
            max_output_tokens=1024,
        )
    
    def process_document(self, text_content):
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(text_content)
        vectorstore = FAISS.from_texts(chunks, self.embeddings)
        return vectorstore  # Save to DB or session in production