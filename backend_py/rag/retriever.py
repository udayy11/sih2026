import os
import json
import logging
import httpx
from typing import List, Dict, Any, Tuple
from backend_py.config import settings

logger = logging.getLogger("nirmaanx.rag")

class ProjectRAGRetriever:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self._load_corpus()

    def _load_corpus(self):
        # Load MoSPI records from JSON corpus
        corpus_paths = [
            os.path.join(os.getcwd(), "src", "data", "extractedMospiRecords.json"),
            os.path.join(os.getcwd(), "src", "data", "mockProjects.ts")
        ]
        loaded = 0
        for p in corpus_paths:
            if os.path.exists(p) and p.endswith(".json"):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            self.documents.extend(data)
                            loaded += len(data)
                except Exception as e:
                    logger.warning("Failed loading corpus from %s: %s", p, e)
        logger.info("Loaded %d infrastructure project documents for RAG", loaded)

    def retrieve(self, query: str, top_k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        if not query or not self.documents:
            return []

        q_terms = set(query.lower().split())
        scored = []

        for doc in self.documents:
            score = 0.0
            name = str(doc.get("name", "")).lower()
            code = str(doc.get("project_code") or doc.get("projectCode") or "").lower()
            sector = str(doc.get("sector", "")).lower()
            ministry = str(doc.get("ministry", "")).lower()
            issues = str(doc.get("detectedIssue") or doc.get("shortIssuesSummary") or "").lower()

            if query.lower() in code:
                score += 50.0
            if query.lower() in name:
                score += 30.0

            for term in q_terms:
                if len(term) < 3:
                    continue
                if term in code:
                    score += 15.0
                if term in name:
                    score += 8.0
                if term in sector:
                    score += 5.0
                if term in ministry:
                    score += 4.0
                if term in issues:
                    score += 6.0

            if score > 0:
                scored.append((doc, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    async def generate_rag_response(self, query: str, context_docs: List[Dict[str, Any]]) -> Tuple[str, str]:
        """
        Synthesizes response using Open-Source LLM (Ollama) if available, or Groq/Gemini, with offline fallback.
        """
        # Format context
        ctx_str = ""
        for i, (doc) in enumerate(context_docs):
            ctx_str += (
                f"\n[Project {i+1}]: {doc.get('name')} (Code: {doc.get('project_code') or doc.get('projectCode')})\n"
                f"- Sector: {doc.get('sector')} | Ministry: {doc.get('ministry')}\n"
                f"- Physical Progress: {doc.get('physicalProgress')}% | Cost Overrun: {doc.get('costOverrunPercent')}%\n"
                f"- Delay: {doc.get('delayMonths')} months | Risk Score: {doc.get('overallRiskScore')}/100\n"
            )

        prompt = (
            f"You are the NirmaanX AI Decision Support Assistant for MoSPI, Government of India.\n"
            f"Relevant Retrived Ground-Truth Context:\n{ctx_str}\n\n"
            f"User Question: {query}\n"
            f"Provide a structured, authoritative response with risk metrics (out of 100) and actionable interventions."
        )

        # 1. Try local Open-Source LLM (Ollama)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", ""), f"Ollama ({settings.OLLAMA_MODEL})"
        except Exception:
            pass

        # 2. Try Groq if configured
        if settings.GROQ_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    res = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                        json={
                            "model": "llama-3.3-70b-versatile",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.2
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        text = data["choices"][0]["message"]["content"]
                        return text, "Open-Source Llama 3.3 70B (via Groq Engine)"
            except Exception:
                pass

        # 3. High-precision rule-based synthesis fallback
        if context_docs:
            top = context_docs[0]
            reply = (
                f"### MoSPI AI Intelligence Briefing: **{top.get('name')}**\n\n"
                f"- **Project Code**: `{top.get('project_code') or top.get('projectCode')}`\n"
                f"- **Sector & Ministry**: {top.get('sector')} ({top.get('ministry')})\n"
                f"- **Overall Risk Score**: **{top.get('overallRiskScore')}/100** ({top.get('riskLevel', 'High')} Risk)\n"
                f"- **Schedule Slippage**: Trailing schedule by **+{top.get('delayMonths')} months**.\n"
                f"- **Cost Overrun**: ₹{top.get('costOverrunAmount', 0)} Cr (+{top.get('costOverrunPercent', 0)}%).\n"
                f"- **Physical Delivery**: {top.get('physicalProgress')}% completed against financial burn of {top.get('financialProgress')}%\n\n"
                f"**Key Statutory Bottlenecks & Recommendations**:\n"
                f"1. Fast-track pending environmental/forest clearances.\n"
                f"2. Resolve Right-of-Way (RoW) acquisition gaps with district administrative task forces.\n"
                f"3. Reallocate contractor mobilization capacity to recover critical path milestones."
            )
            return reply, "NirmaanX Domain Expert Retrieval Engine (Offline RAG)"

        return "No matching infrastructure project was found matching your query criteria in the MoSPI database.", "RAG Retriever"

rag_retriever = ProjectRAGRetriever()
