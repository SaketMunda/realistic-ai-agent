from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from app.config import get_settings

class ChatHandler:
    def __init__(self):
        settings = get_settings()
        self.llm = ChatOpenAI(
            model_name=settings.model_name,
            temperature=settings.temperature,
            api_key=settings.openai_api_key
        )
        self.system_message = SystemMessage(content="You are a helpful AI assistant.")

    async def process_message(self, content: str) -> dict:
        messages = [
            self.system_message,
            HumanMessage(content=content)
        ]
        
        response = await self.llm.agenerate([messages])
        return {
            "type": "message",
            "content": response.generations[0][0].text
        }

chat_handler = ChatHandler() 