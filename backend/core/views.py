
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DocumentSerializer
from .models import Document
from .services import PDFLLMService
import fitz  # PyMuPDF

class UploadPDFView(APIView):
    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            doc = serializer.save()
            # Extract text
            pdf_doc = fitz.open(doc.file.path)
            text = ""
            for page in pdf_doc:
                text += page.get_text()
            doc.text_content = text
            doc.save()
            return Response({'id': str(doc.id), 'message': 'PDF uploaded'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.
class SummarizeView(APIView):
    def post(self, request):
        doc_id = request.data['doc_id']
        doc = Document.objects.get(id=doc_id)
        service = PDFLLMService()
        vectorstore = service.process_document(doc.text_content)
        prompt = f"Summarize this scientific article: {doc.text_content[:5000]}..."  # Truncate for demo
        summary = service.llm.invoke(prompt)
        return Response({'summary': summary})
    

class QueryView(APIView):
    def post(self, request):
        doc_id = request.data['doc_id']
        query = request.data['query']
        doc = Document.objects.get(id=doc_id)
        service = PDFLLMService()
        vectorstore = service.process_document(doc.text_content)  # Load or cache
        docs = vectorstore.similarity_search(query, k=3)
        context = "\n".join([d.page_content for d in docs])
        rag_prompt = f"Answer based on this article context: {context}\nQuestion: {query}"
        answer = service.llm.invoke(rag_prompt)
        return Response({'answer': answer, 'sources': [d.metadata for d in docs]})