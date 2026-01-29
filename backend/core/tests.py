from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
import uuid
import io

from .models import Document, ChatSession
from .serializers import DocumentSerializer
from .services import PDFLLMService




class UploadPDFViewTests(APITestCase):
    """Tests for the PDF upload endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.upload_url = '/core/upload/'
    
    @patch('fitz.open')
    def test_upload_pdf_success(self, mock_fitz_open):
        """Test successful PDF upload"""
        # Mock PyMuPDF
        mock_page = MagicMock()
        mock_page.get_text.return_value = "Sample extracted text from PDF"
        mock_pdf = MagicMock()
        mock_pdf.__iter__ = lambda self: iter([mock_page])
        mock_fitz_open.return_value = mock_pdf
        
        pdf_content = b'%PDF-1.4 fake pdf content'
        pdf_file = SimpleUploadedFile("test.pdf", pdf_content, content_type="application/pdf")
        
        response = self.client.post(self.upload_url, {'file': pdf_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['message'], 'PDF uploaded')
        
        # Verify document was created and text was extracted
        doc = Document.objects.get(id=response.data['id'])
        self.assertEqual(doc.text_content, "Sample extracted text from PDF")
        print("\n✓ Test successful PDF upload - Passed successfully")
    
    def test_upload_no_file(self):
        """Test upload without file returns error"""
        response = self.client.post(self.upload_url, {}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        print("\n✓ Test upload without file returns error - Passed successfully")

class DocumentModelTests(TestCase):
    """Tests for the Document model"""
    
    def test_document_creation(self):
        """Test that a document can be created with a file"""
        pdf_content = b'%PDF-1.4 fake pdf content'
        pdf_file = SimpleUploadedFile("test.pdf", pdf_content, content_type="application/pdf")
        
        doc = Document.objects.create(file=pdf_file)
        
        self.assertIsNotNone(doc.id)
        self.assertIsInstance(doc.id, uuid.UUID)
        self.assertTrue(doc.file.name.endswith('.pdf'))
        self.assertEqual(doc.text_content, '')
        print("\n✓ Test document creation - Passed successfully")
    
    def test_document_uuid_is_unique(self):
        """Test that each document gets a unique UUID"""
        pdf_content = b'%PDF-1.4 fake pdf content'
        pdf_file1 = SimpleUploadedFile("test1.pdf", pdf_content, content_type="application/pdf")
        pdf_file2 = SimpleUploadedFile("test2.pdf", pdf_content, content_type="application/pdf")
        
        doc1 = Document.objects.create(file=pdf_file1)
        doc2 = Document.objects.create(file=pdf_file2)
        
        self.assertNotEqual(doc1.id, doc2.id)
        print("\n✓ Test document UUID is unique - Passed successfully")
    
    def test_document_text_content_update(self):
        """Test that text_content can be updated"""
        pdf_content = b'%PDF-1.4 fake pdf content'
        pdf_file = SimpleUploadedFile("test.pdf", pdf_content, content_type="application/pdf")
        
        doc = Document.objects.create(file=pdf_file)
        doc.text_content = "Extracted text from PDF"
        doc.save()
        
        doc.refresh_from_db()
        self.assertEqual(doc.text_content, "Extracted text from PDF")
        print("\n✓ Test document text content update - Passed successfully")

class SummarizeViewTests(APITestCase):
    """Tests for the summarize endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.summarize_url = '/core/summarize/'
        
        # Create a test document
        pdf_content = b'%PDF-1.4 fake pdf content'
        pdf_file = SimpleUploadedFile("test.pdf", pdf_content, content_type="application/pdf")
        self.doc = Document.objects.create(file=pdf_file, text_content="This is sample scientific text for testing.")
    
    @patch('core.views.PDFLLMService')
    def test_summarize_success(self, mock_service_class):
        """Test successful document summarization"""
        # Setup mocks
        mock_service = MagicMock()
        mock_service.llm.invoke.return_value = MagicMock(content="This is a summary of the document.")
        mock_service.process_document.return_value = MagicMock()
        mock_service_class.return_value = mock_service
        
        response = self.client.post(
            self.summarize_url,
            {'doc_id': str(self.doc.id)},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        print("\n✓ Test successful document summarization - Passed successfully")
    
    def test_summarize_invalid_doc_id(self):
        """Test summarize with non-existent document ID"""
        fake_id = str(uuid.uuid4())
        
        with self.assertRaises(Document.DoesNotExist):
            self.client.post(
                self.summarize_url,
                {'doc_id': fake_id},
                format='json'
            )
        print("\n✓ Test summarize with invalid document ID - Passed successfully")
