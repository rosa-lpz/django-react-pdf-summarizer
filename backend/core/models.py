from django.db import models
import uuid

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='pdfs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    text_content = models.TextField(blank=True)  # Extracted text

class ChatSession(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=255, unique=True)