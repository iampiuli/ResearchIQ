"""
Pydantic schemas for API request/response bodies.

Kept separate from the routers so services and routers can share the same
typed contracts.
"""

from typing import Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str


class UploadedFileResult(BaseModel):
    paper_id: str
    filename: str
    status: str
    page_count: int
    character_count: int
    chunk_count: int
    embedding_count: int
    embedding_dimension: int
    vector_count: int


class DuplicateFileResult(BaseModel):
    filename: str
    status: str


class FailedFileResult(BaseModel):
    filename: str
    reason: str


class UploadSummary(BaseModel):
    total_files: int
    uploaded: int
    duplicates: int
    failed: int


class MultiUploadResponse(BaseModel):
    uploaded: list[UploadedFileResult]
    duplicates: list[DuplicateFileResult]
    failed: list[FailedFileResult]
    summary: UploadSummary


class PaperSummary(BaseModel):
    id: str
    filename: str
    original_filename: str
    size: int
    uploaded_at: str
    status: str


class ChatRequest(BaseModel):
    question: str
    paper_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list = []


class SearchRequest(BaseModel):
    query: str


class SearchResultItem(BaseModel):
    chunk_text: str
    filename: str
    chunk_id: str
    similarity_score: float
    paper_id: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
