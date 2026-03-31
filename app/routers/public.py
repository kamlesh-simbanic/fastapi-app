from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

import base64
import json
import hashlib
import uuid
import requests
import os
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/public",
    tags=["public"]
)

# PhonePe Credentials from Environment
MERCHANT_ID = os.getenv("PHONEPE_MERCHANT_ID", "PGTESTPAYUAT")
SALT_KEY = os.getenv("PHONEPE_SALT_KEY", "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399")
SALT_INDEX = int(os.getenv("PHONEPE_SALT_INDEX", "1"))
PHONEPE_URL = os.getenv("PHONEPE_URL", "https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay")

@router.get("/student/{gr_no}", response_model=schemas.StudentOut)
def get_student_by_gr_no(gr_no: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.gr_no == gr_no,
        models.Student.status == models.StudentStatus.ACTIVE
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active student found with GR No. {gr_no}"
        )
    
    return student

@router.post("/pay/initiate")
async def initiate_payment(data: dict):
    # Expecting { gr_no: str, amount: int }
    gr_no = data.get("gr_no")
    amount = data.get("amount", 25000) # Rupees 
    
    transaction_id = f"MT{uuid.uuid4().hex[:14].upper()}"
    merchant_user_id = f"MUID{gr_no}"
    
    # Amount in Paisa
    amount_paisa = int(amount * 100)
    
    payload = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": transaction_id,
        "merchantUserId": merchant_user_id,
        "amount": amount_paisa,
        "redirectUrl": f"http://localhost:3000/pay-fees/status?tid={transaction_id}",
        "redirectMode": "POST",
        "callbackUrl": f"http://localhost:8000/api/public/pay/callback",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }
    
    # Base64 Encode Payload
    payload_str = json.dumps(payload)
    base64_payload = base64.b64encode(payload_str.encode("utf-8")).decode("utf-8")
    
    # Checksum Header
    full_string = base64_payload + "/pg/v1/pay" + SALT_KEY
    sha256_hash = hashlib.sha256(full_string.encode("utf-8")).hexdigest()
    x_verify = f"{sha256_hash}###{SALT_INDEX}"
    
    headers = {
        "Content-Type": "application/json",
        "accept": "application/json",
        "X-VERIFY": x_verify
    }
    
    try:
        response = requests.post(
            PHONEPE_URL,
            json={"request": base64_payload},
            headers=headers
        )
        res_data = response.json()
        
        if res_data.get("success"):
            return {
                "success": True,
                "redirectUrl": res_data["data"]["instrumentResponse"]["redirectInfo"]["url"]
            }
        else:
            raise HTTPException(status_code=400, detail=res_data.get("message", "Initiation Failed"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pay/callback")
async def payment_callback(request: Request):
    # PhonePe will call this with base64 encoded status
    payload = await request.form()
    # In a real app, verify the checksum and update DB
    return {"status": "received"}
