import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend_py.storage.minio_client import minio_service

router = APIRouter(prefix="/storage", tags=["MinIO Document Storage & Security"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Uploads a project document (DPR, clearance letter, site photos) to MinIO object storage.
    """
    try:
        content = await file.read()
        unique_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        uri = minio_service.upload_file(content, unique_name, content_type=file.content_type)
        return {
            "filename": file.filename,
            "stored_uri": uri,
            "size_bytes": len(content),
            "status": "UPLOADED_SUCCESSFULLY"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.get("/status")
def storage_status():
    return {
        "minio_enabled": minio_service.client is not None,
        "bucket": minio_service.bucket_name,
        "status": "CONNECTED" if minio_service.client else "LOCAL_FALLBACK"
    }
