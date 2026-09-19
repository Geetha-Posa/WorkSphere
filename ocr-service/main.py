import os
import tempfile
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Response, status
from docling.document_converter import DocumentConverter

converter = None
models_loaded = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    global converter, models_loaded
    print("Loading OCR models...")
    converter = DocumentConverter()
    models_loaded = True
    print("Models ready")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check(response: Response):
    if models_loaded:
        return {"status": "ready"}
    else:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "loading"}

@app.post("/extract")
async def extract_text(response: Response, file: UploadFile = File(...)):
    if not file:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"success": False, "error": "No file uploaded"}

    temp_file_path = None
    try:
        # Save to temp path
        suffix = os.path.splitext(file.filename)[1] if file.filename else ""
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        # Run extraction
        if not converter:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            return {"success": False, "error": "Models are not loaded yet"}

        result = converter.convert(temp_file_path)
        extracted_text = result.document.export_to_markdown() # docling usually exports to markdown or text

        return {"success": True, "text": extracted_text}

    except Exception as e:
        traceback.print_exc()
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"success": False, "error": str(e)}

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
