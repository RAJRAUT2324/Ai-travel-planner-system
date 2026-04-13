"""
GridFS Service — handles image upload and retrieval using MongoDB GridFS.
"""

from bson import ObjectId
from gridfs import GridFS


class GridFSService:
    """Manages file storage in MongoDB GridFS."""

    def __init__(self, db):
        self.fs = GridFS(db)

    def upload_image(self, file_data, filename: str, content_type: str = "image/jpeg") -> str:
        """
        Upload an image to GridFS.

        Args:
            file_data: File bytes or file-like object
            filename: Original filename
            content_type: MIME type of the file

        Returns:
            String ID of the stored file
        """
        file_id = self.fs.put(
            file_data,
            filename=filename,
            content_type=content_type,
        )
        return str(file_id)

    def get_image(self, file_id: str):
        """
        Retrieve an image from GridFS.

        Args:
            file_id: String ID of the stored file

        Returns:
            Tuple of (file_data, content_type) or (None, None)
        """
        try:
            grid_out = self.fs.get(ObjectId(file_id))
            return grid_out.read(), grid_out.content_type
        except Exception:
            return None, None

    def delete_image(self, file_id: str) -> bool:
        """Delete an image from GridFS."""
        try:
            self.fs.delete(ObjectId(file_id))
            return True
        except Exception:
            return False
