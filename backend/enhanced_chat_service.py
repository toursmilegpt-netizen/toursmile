# Enhanced Chat Service with Expert Travel Consultant Integration
from emergentintegrations.llm.chat import LlmChat, UserMessage
from expert_travel_consultant import (
    get_personalized_system_prompt, 
    CONVERSATION_TEMPLATES,
    get_destination_insights,
    CONSULTATION_CHAINS
)
import json
import logging
from typing import Dict, List, Optional

class ExpertTravelConsultantChat:
    def __init__(self, api_key: str):
        """
        Initialize Expert Travel Consultant Chat Service
        """
        self.llm_chat = LlmChat(api_key=api_key)
        self.conversation_memory = {}  # Store conversation context
        
    def analyze_user_intent(self, message: str, session_id: str) -> Dict:
        """
        Analyze user message to understand travel intent and preferences
        """
        intent_analysis = {
            "travel_type": None,
            "budget_level": None, 
            "destination_mentioned": None,
            "dates_mentioned": False,
            "booking_ready": False,
            "needs_consultation": True
        }
        
        message_lower = message.lower()
        
        # Detect travel type
        if any(word in message_lower for word in ["honeymoon", "romantic", "couple"]):
            intent_analysis["travel_type"] = "honeymoon"
        elif any(word in message_lower for word in ["family", "kids", "children"]):
            intent_analysis["travel_type"] = "family"
        elif any(word in message_lower for word in ["business", "work", "conference"]):
            intent_analysis["travel_type"] = "business"
        elif any(word in message_lower for word in ["adventure", "trekking", "sports"]):
            intent_analysis["travel_type"] = "adventure"
        elif any(word in message_lower for word in ["luxury", "premium", "5 star"]):
            intent_analysis["travel_type"] = "luxury"
        elif any(word in message_lower for word in ["budget", "cheap", "affordable"]):
            intent_analysis["travel_type"] = "budget"
        
        # Detect budget signals
        if any(word in message_lower for word in ["luxury", "premium", "best", "exclusive"]):
            intent_analysis["budget_level"] = "luxury"
        elif any(word in message_lower for word in ["budget", "cheap", "affordable", "economical"]):
            intent_analysis["budget_level"] = "budget"
        elif any(word in message_lower for word in ["good value", "reasonable", "mid-range"]):
            intent_analysis["budget_level"] = "mid-range"
            
        # Detect destinations
        destinations = ["rajasthan", "kerala", "goa", "dubai", "singapore", "thailand", "bali", "maldives", "kashmir", "himachal"]
        for destination in destinations:
            if destination in message_lower:
                intent_analysis["destination_mentioned"] = destination
                break
                
        # Detect if dates mentioned
        if any(word in message_lower for word in ["january", "february", "march", "april", "may", "june", 
                                                 "july", "august", "september", "october", "november", "december",
                                                 "next month", "next week", "this month"]):
            intent_analysis["dates_mentioned"] = True
            
        return intent_analysis
    
    def get_consultation_response(self, user_message: str, session_id: str, user_context: Optional[Dict] = None) -> Dict:
        """
        Generate expert consultation response based on user intent and context
        """
        try:
            # Analyze user intent
            intent = self.analyze_user_intent(user_message, session_id)
            
            # Get or create conversation memory
            if session_id not in self.conversation_memory:
                self.conversation_memory[session_id] = {
                    "stage": "greeting",
                    "preferences": {},
                    "bookings": {"flights": None, "hotels": None, "activities": []},
                    "consultation_history": []
                }
            
            memory = self.conversation_memory[session_id]
            memory["consultation_history"].append({"user": user_message, "intent": intent})
            
            # Generate personalized system prompt
            system_prompt = get_personalized_system_prompt(user_context)
            
            # Add current consultation context to system prompt
            consultation_context = f"""
            
            CURRENT CONSULTATION CONTEXT:
            - Conversation Stage: {memory['stage']}
            - User Intent Analysis: {intent}
            - Known Preferences: {memory['preferences']}
            - Booking Status: Flights: {'✓' if memory['bookings']['flights'] else '✗'}, Hotels: {'✓' if memory['bookings']['hotels'] else '✗'}, Activities: {len(memory['bookings']['activities'])} planned
            
            CONSULTATION INSTRUCTIONS:
            - Be interactive and ask relevant follow-up questions
            - If budget not discussed, ask about budget preferences
            - If destination mentioned, provide expert insights about timing and logistics
            - Follow the booking sequence: Flights → Hotels → Sightseeing
            - Always explain your recommendations with practical reasoning
            
            Previous conversation context: {memory['consultation_history'][-3:] if len(memory['consultation_history']) > 0 else 'This is the start of consultation'}
            """
            
            full_system_prompt = system_prompt + consultation_context
            
            # Generate response using LLM
            user_msg = UserMessage(content=user_message)
            response = self.llm_chat.chat(
                messages=[user_msg],
                system_prompt=full_system_prompt,
                model="gpt-4"
            )
            
            # Update conversation stage based on response
            self._update_conversation_stage(user_message, intent, memory)
            
            # Add destination insights if relevant
            enhanced_response = response
            if intent["destination_mentioned"]:
                insights = get_destination_insights(intent["destination_mentioned"])
                enhanced_response += f"\n\n📍 **Expert Insight for {intent['destination_mentioned'].title()}:**\n"
                enhanced_response += f"🌤️ **Best Time:** {insights['best_time']}\n"
                enhanced_response += f"⏱️ **Recommended Duration:** {insights['duration']}\n"
                enhanced_response += f"✨ **Must-See:** {', '.join(insights['highlights'][:3])}"
            
            return {
                "success": True,
                "response": enhanced_response,
                "session_id": session_id,
                "consultation_stage": memory["stage"],
                "next_steps": self._get_next_consultation_steps(memory),
                "booking_progress": memory["bookings"]
            }
            
        except Exception as e:
            logging.error(f"Expert consultation error: {str(e)}")
            
            # Fallback response maintaining expert consultant persona
            fallback_response = """I apologize, but I'm experiencing a brief technical issue. As your travel consultant, I'm committed to helping you plan the perfect trip. 

Could you please share your destination preference and travel dates again? I'm here to provide expert guidance on:
- Flight options and timing recommendations
- Hotel selections based on your preferences  
- Curated sightseeing experiences
- Budget optimization strategies

I'll make sure we create an amazing travel experience for you!"""
            
            return {
                "success": False,
                "response": fallback_response,
                "session_id": session_id,
                "error": "temporary_unavailable"
            }
    
    def _update_conversation_stage(self, user_message: str, intent: Dict, memory: Dict):
        """
        Update conversation stage based on user input and intent
        """
        current_stage = memory["stage"]
        message_lower = user_message.lower()
        
        if current_stage == "greeting":
            if intent["destination_mentioned"] or "want to go" in message_lower:
                memory["stage"] = "destination_discussion"
        
        elif current_stage == "destination_discussion":
            if any(word in message_lower for word in ["budget", "cost", "price", "spend"]):
                memory["stage"] = "budget_discussion"
        
        elif current_stage == "budget_discussion":
            if any(word in message_lower for word in ["hotel", "stay", "accommodation"]):
                memory["stage"] = "accommodation_preferences"
        
        elif current_stage == "accommodation_preferences":
            if any(word in message_lower for word in ["flight", "fly", "airline"]):
                memory["stage"] = "flight_planning"
        
        elif current_stage == "flight_planning":
            if "book" in message_lower and "flight" in message_lower:
                memory["stage"] = "flight_booking"
                memory["bookings"]["flights"] = "in_progress"
        
        elif current_stage == "flight_booking":
            if memory["bookings"]["flights"] == "confirmed":
                memory["stage"] = "hotel_selection"
        
        elif current_stage == "hotel_selection":
            if "book" in message_lower and ("hotel" in message_lower or "stay" in message_lower):
                memory["stage"] = "hotel_booking"
                memory["bookings"]["hotels"] = "in_progress"
        
        elif current_stage == "hotel_booking":
            if memory["bookings"]["hotels"] == "confirmed":
                memory["stage"] = "activity_planning"
                
        # Update preferences based on intent
        if intent["travel_type"]:
            memory["preferences"]["travel_type"] = intent["travel_type"]
        if intent["budget_level"]:
            memory["preferences"]["budget_level"] = intent["budget_level"]
        if intent["destination_mentioned"]:
            memory["preferences"]["destination"] = intent["destination_mentioned"]
    
    def _get_next_consultation_steps(self, memory: Dict) -> List[str]:
        """
        Suggest next steps based on current consultation stage
        """
        stage = memory["stage"]
        
        steps_map = {
            "greeting": ["Discuss destination preferences", "Understand travel dates", "Learn about travel type"],
            "destination_discussion": ["Discuss budget range", "Share destination insights", "Recommend ideal duration"],
            "budget_discussion": ["Explore accommodation preferences", "Suggest value optimization", "Discuss travel class preferences"],
            "accommodation_preferences": ["Plan flight options", "Compare airline choices", "Discuss travel insurance"],
            "flight_planning": ["Book flights", "Secure preferred seats", "Add meal preferences"],
            "flight_booking": ["Confirm hotel selection", "Book accommodations", "Arrange transfers"],
            "hotel_selection": ["Finalize hotel booking", "Arrange airport transfers", "Plan daily activities"],
            "activity_planning": ["Book experiences", "Create detailed itinerary", "Provide travel documents checklist"]
        }
        
        return steps_map.get(stage, ["Continue consultation", "Address specific needs"])
    
    def get_booking_summary(self, session_id: str) -> Dict:
        """
        Get current booking summary for the session
        """
        if session_id not in self.conversation_memory:
            return {"error": "No active consultation found"}
        
        memory = self.conversation_memory[session_id]
        
        return {
            "session_id": session_id,
            "consultation_stage": memory["stage"], 
            "preferences": memory["preferences"],
            "bookings": memory["bookings"],
            "progress": {
                "flights": "✓" if memory["bookings"]["flights"] == "confirmed" else "○",
                "hotels": "✓" if memory["bookings"]["hotels"] == "confirmed" else "○", 
                "activities": f"{len(memory['bookings']['activities'])} planned"
            }
        }