
from django.urls import path 
from .views import SummarizeView, UploadPDFView, QueryView

urlpatterns = [

    path('summarize/', SummarizeView.as_view()),
    path('upload/', UploadPDFView.as_view()),
    path('query/', QueryView.as_view())
]
