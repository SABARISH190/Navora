import json
import logging
from app.ai.groq_model import GroqModel
from app.ai.prompts import SYSTEM_PROMPT, build_decision_prompt
from app.core.state_manager import state_manager
from app.websocket.manager import manager

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
# Basic config handled by FastAPI usually, but we ensure output here
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

from app.core.config import settings

class AIPipeline:
    def __init__(self):
        self.model = GroqModel()

    async def run(self) -> dict:
        # 1. State Extraction
        state = state_manager.get_state()
        state_str = json.dumps(state, indent=2)
        logger.info(f"Input State extracted: {state_str}")

        # 1b. Intelligence Layer context
        try:
            from app.intelligence.predictor import run_predictions
            from app.intelligence.navigator import get_all_navigation
            predictions = run_predictions()
            navigation = get_all_navigation()
        except Exception:
            predictions = []
            navigation = []

        # 2. Context Formatting
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_decision_prompt(state_str, mode=settings.MODE, predictions=predictions, navigation=navigation)}
        ]

        try:
            # 3. Decision Generation (LLM call)
            response = self.model.generate(messages)
            logger.info(f"Raw AI Response: {response}")

            # 4. Output Validation
            parsed = json.loads(response)
            if self.validate_output(parsed):
                logger.info(f"Final Decision: {parsed}")
                await manager.broadcast({
                    "type": "ai_decision",
                    "data": parsed
                })
                self._log_decision(parsed)
                return parsed
            else:
                logger.error("Validation failed. Missing keys in AI response.")
                fallback = self.fallback_response("Missing required keys in AI response.")
                await manager.broadcast({
                    "type": "ai_decision",
                    "data": fallback
                })
                return fallback
        
        except Exception as e:
            # 5. Fallback Handling
            logger.error(f"AI Generation or Parsing Failed: {str(e)}")
            fallback = self.fallback_response("AI Generation logic failed during processing.")
            await manager.broadcast({
                "type": "ai_decision",
                "data": fallback
            })
            return fallback

    def validate_output(self, output: dict) -> bool:
        required_keys = ["user_action", "organizer_action", "reason", "confidence"]

        if not all(k in output for k in required_keys):
            return False

        if output["confidence"] not in ["high", "medium", "low"]:
            return False

        if not isinstance(output["reason"], str) or len(output["reason"]) < 10:
            return False

        return True

    def fallback_response(self, reason: str) -> dict:
        return {
             "user_action": "Stay in current zone",
             "organizer_action": "Monitor situation",
             "reason": f"AI response invalid, fallback triggered ({reason})",
             "confidence": "low"
        }

    def _log_decision(self, decision: dict):
        try:
            from app.data.database import SessionLocal, DecisionLog
            import time
            db = SessionLocal()
            log = DecisionLog(
                timestamp=time.time(),
                user_action=decision.get("user_action", ""),
                organizer_action=decision.get("organizer_action", ""),
                reason=decision.get("reason", ""),
                confidence=decision.get("confidence", ""),
                mode=settings.MODE,
            )
            db.add(log)
            db.commit()
            db.close()
            logger.info("[DB] AI decision logged")
        except Exception as e:
            logger.error(f"[DB] Decision logging failed: {e}")

ai_pipeline = AIPipeline()
