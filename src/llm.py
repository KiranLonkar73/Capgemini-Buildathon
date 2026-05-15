from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os


# =========================
# LOAD ENV VARIABLES
# =========================

load_dotenv()


class ComplianceLLM:

    def __init__(self):

        self.groq_api_key = os.getenv(
            "GROQ_API_KEY"
        )

        self.llm = ChatGroq(
            groq_api_key=self.groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=1024
        )

        print("\nLLM Initialized Successfully")

    # =========================
    # GENERATE RESPONSE
    # =========================

    def generate_response(
        self,
        query: str,
        retrieved_docs
    ):

        # Create Context
        context = "\n\n".join(
            [
                doc["content"]
                for doc in retrieved_docs
            ]
        )

        # Prompt
        prompt = f"""
You are an AI Compliance Assistant.

Analyze the employee statement using the company policies.

Retrieved Policies:
{context}

Employee Statement:
{query}

Tasks:
1. Detect whether policy violation exists
2. Explain the violation clearly
3. Mention which policy is violated
4. Suggest safer compliant behavior

Return output in this format:

Violation Detected:
Violated Policy:
Explanation:
Compliant Alternative:
"""

        # Generate Response
        response = self.llm.invoke(
            prompt
        )

        return response.content