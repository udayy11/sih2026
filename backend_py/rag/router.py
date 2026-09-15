from fastapi import APIRouter
from backend_py.database.schemas import QueryRequest, QueryResponse
from backend_py.rag.retriever import rag_retriever

router = APIRouter(prefix="/ai", tags=["LLM & RAG Project Intelligence"])

@router.post("/assistant", response_model=QueryResponse)
async def query_assistant(payload: QueryRequest):
    """
    RAG-powered conversational assistant for infrastructure project intelligence.
    """
    matches = rag_retriever.retrieve(payload.query, top_k=3)
    docs = [m[0] for m in matches]
    reply, model_name = await rag_retriever.generate_rag_response(payload.query, docs)
    
    contexts = [f"{d.get('name')} ({d.get('project_code') or d.get('projectCode')})" for d in docs]

    return QueryResponse(
        reply=reply,
        retrieved_contexts=contexts,
        source="RAG Vector Retriever",
        model_used=model_name
    )

@router.post("/explain")
async def explain_project(payload: dict):
    """
    Explainable AI diagnostics for project risks and drivers.
    """
    project = payload.get("project", {})
    query = f"Provide executive risk breakdown and delay root cause for {project.get('name')}"
    reply, model_name = await rag_retriever.generate_rag_response(query, [project] if project else [])
    return {
        "explanation": reply,
        "source": model_name,
        "provider": "RAG Diagnostic Engine"
    }
