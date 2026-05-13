from fastapi import FastAPI, File, UploadFile
import base64
import requests
import json
import os
from db import conn, cursor
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
from io import BytesIO



load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# HOME
# -------------------------------
@app.get("/")
def home():
    return {"message": "Vision AI Invoice System Running 🚀"}


# -------------------------------
# OCR
# -------------------------------
def real_ocr(image_base64):
    try:
        image_data = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_data))
        return pytesseract.image_to_string(image)
    except Exception as e:
        return f"OCR Error: {str(e)}"


# -------------------------------
# AI EXTRACTION
# -------------------------------
def extract_data(text):
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": f"""
Extract:
- invoice_number
- date
- amount

Return ONLY JSON:
{{"invoice_number": "...", "date": "...", "amount": "..."}}

Text:
{text}
"""
                    }
                ]
            }
        )

        data = response.json()
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        return json.dumps({"error": str(e)})


# -------------------------------
# DECISION
# -------------------------------
def decision(amount):
    try:
        amount = float(amount.replace(",", ""))

        if amount > 100000:
            return "High Risk - Manual Approval"
        elif amount > 50000:
            return "Medium Risk - Review"
        else:
            return "Auto Approved"

    except:
        return "Invalid Amount"


# -------------------------------
# FRAUD CHECK
# -------------------------------
def fraud_check(result):
    issues = []

    try:
        amount = float(result["amount"].replace(",", ""))

        if amount > 100000:
            issues.append("⚠️ High amount anomaly")

        if "INV" not in result["invoice_number"].upper():
            issues.append("⚠️ Suspicious invoice number")

        if len(result["date"]) < 6:
            issues.append("⚠️ Invalid date format")

    except:
        issues.append("⚠️ Data parsing error")

    return issues


# -------------------------------
# FULL PIPELINE
# -------------------------------
@app.post("/full-process")
async def full_process(file: UploadFile = File(...)):
    try:
        content = await file.read()
        encoded = base64.b64encode(content).decode("utf-8")

        # OCR
        text = real_ocr(encoded)

        # AI
        ai_output = extract_data(text)

        try:
            result = json.loads(ai_output)
        except:
            return {"success": False, "error": "AI extraction failed"}

        # 🔥 SAFE GET
        invoice_number_raw = result.get("invoice_number", "")
        amount_raw = result.get("amount", "")
        date = result.get("date", "")

        # 🚨 VALIDATION (EMPTY CHECK)
        if not invoice_number_raw or not amount_raw:
            return {
                "success": False,
                "message": "Missing required invoice fields ❌"
            }

        # 🔥 NORMALIZE
        invoice_number = invoice_number_raw.strip().upper()

        # DECISION
        status = decision(amount_raw)

        # 🚨 BLOCK INVALID AMOUNT
        if status == "Invalid Amount":
            return {
                "success": False,
                "message": "Invalid amount detected ❌"
            }

        # 🔥 DUPLICATE CHECK
        cursor.execute(
            "SELECT * FROM invoices WHERE invoice_number = ?",
            (invoice_number,)
        )
        existing = cursor.fetchone()

        if existing:
            return {
                "success": False,
                "message": "Invoice already exists ⚠️"
            }

        # FRAUD CHECK
        fraud_issues = fraud_check(result)

        # INSERT
        cursor.execute(
            "INSERT INTO invoices (invoice_number, date, amount, status) VALUES (?, ?, ?, ?)",
            (
                invoice_number,
                date,
                amount_raw,
                status
            )
        )
        conn.commit()

        return {
            "success": True,
            "structured_data": result,
            "status": status,
            "fraud_flags": fraud_issues
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# -------------------------------
# VIEW
# -------------------------------
@app.get("/view-invoices")
def view_invoices():
    cursor.execute("SELECT * FROM invoices")
    data = cursor.fetchall()

    formatted = []
    for row in data:
        try:
            amount = float(row[3].replace(",", ""))
            fraud_flags = ["⚠️ High amount anomaly"] if amount > 100000 else []
        except:
            fraud_flags = ["⚠️ Invalid data"]

        formatted.append({
            "id": row[0],
            "invoice_number": row[1],
            "date": row[2],
            "amount": row[3],
            "status": row[4],
            "fraud_flags": fraud_flags
        })

    return {"data": formatted}


# -------------------------------
# APPROVE
# -------------------------------
@app.put("/approve/{invoice_id}")
def approve_invoice(invoice_id: int):
    try:
        cursor.execute(
            "UPDATE invoices SET status = ? WHERE id = ?",
            ("Auto Approved", invoice_id)
        )
        conn.commit()

        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    
# -------------------------------
# RESET DATABASE 🧹
# -------------------------------
# -------------------------------
# RESET DATABASE 🧹
# -------------------------------
@app.get("/reset")
def reset_database():
    cursor.execute("DELETE FROM invoices")
    conn.commit()
    return {"message": "All invoices deleted successfully 🧹"}