from fastapi import APIRouter
from fastapi.responses import FileResponse, PlainTextResponse
import os

file_router = APIRouter()

@file_router.get("/download/tbo-email")
async def download_email():
    """Download TBO certification email draft"""
    return FileResponse(
        path="/app/TBO_CERTIFICATION_EMAIL_DRAFT.txt",
        media_type="text/plain",
        filename="TBO_Certification_Email.txt"
    )

@file_router.get("/download/tbo-summary")
async def download_summary():
    """Download TBO working routes summary"""
    return FileResponse(
        path="/app/TBO_WORKING_ROUTES_SUMMARY.md",
        media_type="text/markdown",
        filename="TBO_Working_Routes_Summary.md"
    )

@file_router.get("/download/tbo-report")
async def download_report():
    """Download TBO certification report JSON"""
    return FileResponse(
        path="/app/tbo_certification_report_20251127_223717.json",
        media_type="application/json",
        filename="TBO_Certification_Report.json"
    )

@file_router.get("/view/tbo-email")
async def view_email():
    """View TBO email in browser"""
    with open("/app/TBO_CERTIFICATION_EMAIL_DRAFT.txt", "r") as f:
        content = f.read()
    return PlainTextResponse(content)
