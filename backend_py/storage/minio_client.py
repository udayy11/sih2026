import os
import io
import logging
from typing import Optional
from backend_py.config import settings

logger = logging.getLogger("nirmaanx.storage")

class MinioStorageService:
    def __init__(self):
        self.client = None
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self.local_dir = os.path.join(os.getcwd(), "uploaded_documents")
        os.makedirs(self.local_dir, exist_ok=True)
        self._init_minio()

    def _init_minio(self):
        try:
            from minio import Minio
            self.client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE
            )
            # Check bucket
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
            logger.info("Connected to MinIO at %s", settings.MINIO_ENDPOINT)
        except Exception as e:
            logger.warning(
                "MinIO is unavailable (%s). Falling back to local filesystem storage at %s",
                str(e),
                self.local_dir
            )
            self.client = None

    def upload_file(self, file_bytes: bytes, filename: str, content_type: str = "application/octet-stream") -> str:
        """
        Uploads document to MinIO or falls back to local storage
        """
        if self.client:
            try:
                stream = io.BytesIO(file_bytes)
                self.client.put_object(
                    self.bucket_name,
                    filename,
                    stream,
                    length=len(file_bytes),
                    content_type=content_type
                )
                return f"minio://{self.bucket_name}/{filename}"
            except Exception as err:
                logger.error("Failed to upload to MinIO: %s, falling back to local disk", err)

        # Fallback to local disk
        filepath = os.path.join(self.local_dir, filename)
        with open(filepath, "wb") as f:
            f.write(file_bytes)
        return f"local://{filepath}"

    def get_file(self, filename: str) -> Optional[bytes]:
        if self.client:
            try:
                response = self.client.get_object(self.bucket_name, filename)
                return response.read()
            except Exception as e:
                logger.error("MinIO read failed: %s", e)

        filepath = os.path.join(self.local_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                return f.read()
        return None

minio_service = MinioStorageService()
