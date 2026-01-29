<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# App that summarizes pdf files (specifically scientific articles). And user should be able to interact with the article to find answers. Use a open access LLM, backend (django), frontend (react), and MCP

To build an app that summarizes PDF scientific articles with interactive Q\&A, use an open access LLM like Mistral or Llama 3 for processing, Django as the backend for handling file uploads and API logic, React for the frontend UI, and MCP (likely Model Context Protocol) to manage LLM context and retrieval for precise answers.[^1][^3]

## Core Architecture

Django serves as the robust backend, managing PDF uploads via libraries like PyMuPDF or pdfplumber to extract text from scientific papers. React builds an intuitive frontend with drag-and-drop upload, summary display, and a chat interface for querying the document. Integrate MCP to maintain conversation context, enabling the LLM to reference the full article for follow-up questions like "What methods were used?" without losing prior details.[^2][^4][^8]

## LLM Selection and Summarization

Choose an open access model like Qwen3 or Gemma 3, hosted via Hugging Face Transformers, excelling at scientific summarization with long-context support up to 256K tokens for dense papers. In Django, preprocess PDFs into chunks, embed with Sentence Transformers, store in a vector DB like FAISS, and generate summaries via few-shot prompting (e.g., "Summarize key findings, methods, and conclusions"). This handles arXiv-style articles effectively.[^3][^7][^1]

## Interactive Q\&A Features

For user interaction, implement RAG (Retrieval-Augmented Generation): query the vector store on user questions, retrieve relevant chunks, and feed to the LLM via MCP for grounded responses. React uses components like Chat UI libraries (e.g., React Chatbot Kit) to send queries to Django API endpoints, displaying answers with source citations from the PDF.[^4][^8]

## Implementation Steps

- **Backend (Django)**: Set up DRF for APIs (/upload, /summarize, /query); integrate LLM with LangChain for chaining summarization and RAG.
- **Frontend (React)**: Use Axios for API calls, pdf.js for previews, and state management (Zustand/Redux) for chat history.
- **MCP Integration**: Use MCP client libs to persist session context across interactions, reducing hallucinations on technical content.
- Deploy on Vercel (frontend) and Railway/Heroku (backend) for scalability.[^6]

| Component | Tech Stack | Key Role |
| :-- | :-- | :-- |
| Backend | Django + PyMuPDF + FAISS | PDF parsing, LLM inference, vector search [^2] |
| Frontend | React + pdf.js | Upload UI, interactive chat [^6] |
| AI Core | Open LLM (e.g., Llama 3) + MCP | Summarization \& contextual Q\&A [^3][^8] |

This stack ensures privacy (local/open models), accuracy for science PDFs, and seamless interaction without vendor lock-in.[^5]
<span style="display:none">[^10][^9]</span>

<div align="center">⁂</div>

[^1]: https://arxiv.org/html/2512.23206v1

[^2]: https://www.nutrient.io/blog/summarize-pdf-document-using-machine-learning-and-natural-language-processing/

[^3]: https://www.siliconflow.com/articles/en/best-open-source-llms-for-summarization

[^4]: https://www.geeksforgeeks.org/nlp/building-a-basic-pdf-summarizer-llm-application-with-langchain/

[^5]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12034948/

[^6]: https://www.youtube.com/watch?v=OIYevBOSMxY

[^7]: https://www.reddit.com/r/MachineLearning/comments/18t4zvl/d_best_model_to_summarize_scientific_papers/

[^8]: https://github.com/palsayantan007/ai-document-summarizer

[^9]: https://aarontay.substack.com/p/classifying-the-ways-llms-summarise

[^10]: https://codeconductor.ai/blog/ai-pdf-summarizers/

