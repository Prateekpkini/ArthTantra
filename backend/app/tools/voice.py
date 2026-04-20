"""
ArthTantra — Voice Automation Tools (Retell AI)
Mock-first implementation for demo. Real Retell integration ready.
"""
import asyncio
from datetime import datetime


async def make_voice_call_mock(
    phone_number: str,
    purpose: str,
    script: str,
    merchant: str = "Unknown"
) -> dict:
    """
    Simulates an outbound AI voice call using Retell AI.
    In production, this would use retell-sdk to initiate a real call.
    """
    # Simulate a negotiation call transcript
    transcript = [
        {"speaker": "AI Agent", "text": f"Hello, I'm calling on behalf of the account holder regarding their {merchant} subscription.", "time": "0:02"},
        {"speaker": "IVR", "text": "Thank you for calling. Press 1 for billing, 2 for technical support...", "time": "0:05"},
        {"speaker": "AI Agent", "text": "[Pressed 1] Billing inquiry.", "time": "0:08"},
        {"speaker": "Agent", "text": "Hello, how can I help you today?", "time": "0:35"},
        {"speaker": "AI Agent", "text": f"I'd like to discuss a bill reduction for the account. The current plan is priced at a premium and I believe there are better options available.", "time": "0:38"},
        {"speaker": "Agent", "text": "I understand. Let me check what I can offer. I can see we have a loyalty discount available — 20% off for the next 6 months.", "time": "0:55"},
        {"speaker": "AI Agent", "text": "That sounds reasonable. Please apply the loyalty discount.", "time": "1:02"},
        {"speaker": "Agent", "text": "Done! The discount has been applied to your next billing cycle. Is there anything else?", "time": "1:10"},
        {"speaker": "AI Agent", "text": "No, that's all. Thank you for your help.", "time": "1:15"},
    ]

    await asyncio.sleep(1)  # Simulate call duration

    return {
        "action": "voice_call",
        "phone_number": phone_number,
        "merchant": merchant,
        "purpose": purpose,
        "duration": "1:18",
        "transcript": transcript,
        "outcome": "20% loyalty discount applied for 6 months",
        "status": "completed",
        "call_id": f"CALL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "note": "[DEMO MODE] This was a simulated voice call.",
    }


async def dispute_charge_mock(
    phone_number: str,
    transaction_id: str,
    amount: float,
    reason: str
) -> dict:
    """Simulates an AI voice call to dispute a charge."""
    transcript = [
        {"speaker": "AI Agent", "text": f"I'm calling to dispute a charge of ₹{amount} on transaction {transaction_id}.", "time": "0:02"},
        {"speaker": "IVR", "text": "For disputes, press 3...", "time": "0:05"},
        {"speaker": "AI Agent", "text": "[Pressed 3]", "time": "0:07"},
        {"speaker": "Agent", "text": "I can see the transaction. Can you tell me why you're disputing it?", "time": "0:30"},
        {"speaker": "AI Agent", "text": f"The reason is: {reason}. The account holder did not authorize this transaction.", "time": "0:35"},
        {"speaker": "Agent", "text": "I've initiated the dispute. A provisional credit of ₹{amount} will be applied within 5 business days.", "time": "0:50"},
    ]

    await asyncio.sleep(0.8)

    return {
        "action": "dispute_charge",
        "transaction_id": transaction_id,
        "amount": amount,
        "reason": reason,
        "transcript": transcript,
        "outcome": f"Dispute filed. Provisional credit of ₹{amount} in 5 business days.",
        "status": "dispute_filed",
        "call_id": f"DISP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "note": "[DEMO MODE] This was a simulated dispute call.",
    }
