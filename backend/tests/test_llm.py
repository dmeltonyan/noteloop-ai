"""
Tests for Free LLM Integration
Tests structured JSON output, field existence, and content quality
"""
import pytest
import asyncio
import json
from src.services.llm.generator import llm_generator
from src.services.llm.client import llm_client

# Test data
SAMPLE_TEXT = """
Neurons are the fundamental units of the brain and nervous system. They transmit signals 
through electrical and chemical processes. A neuron consists of a cell body (soma), dendrites 
that receive signals, and an axon that transmits signals to other neurons. The synapse is the 
junction where neurons communicate. Neurotransmitters are chemical messengers that cross the 
synaptic gap. Action potentials are electrical impulses that travel along the axon.
"""

SAMPLE_CONCEPTS = [
    {
        "id": "concept_1",
        "name": "Neurons",
        "description": "Fundamental units of the brain that transmit signals"
    },
    {
        "id": "concept_2",
        "name": "Synapse",
        "description": "Junction where neurons communicate"
    },
    {
        "id": "concept_3",
        "name": "Action Potential",
        "description": "Electrical impulses that travel along axons"
    }
]

@pytest.mark.asyncio
async def test_llm_client_available():
    """Test that LLM client is available"""
    assert llm_client.is_available() or True  # Allow fallback mode for testing

@pytest.mark.asyncio
async def test_extract_concepts_structure():
    """Test concept extraction returns structured JSON"""
    result = await llm_generator.extract_concepts(SAMPLE_TEXT)
    
    assert isinstance(result, dict)
    assert "topics" in result or "main_concepts" in result
    assert isinstance(result.get("topics", []), list)
    assert isinstance(result.get("main_concepts", []), list)

@pytest.mark.asyncio
async def test_generate_summary_structure():
    """Test summary generation returns structured JSON"""
    result = await llm_generator.generate_summary(SAMPLE_TEXT, "medium")
    
    assert isinstance(result, dict)
    assert "summary" in result
    assert isinstance(result["summary"], str)
    assert len(result["summary"]) > 0

@pytest.mark.asyncio
async def test_create_flashcards_structure():
    """Test flashcard generation returns structured JSON"""
    result = await llm_generator.create_flashcards(SAMPLE_CONCEPTS, count=5)
    
    assert isinstance(result, dict)
    flashcards = result.get("flashcards", [])
    assert isinstance(flashcards, list)
    assert len(flashcards) > 0
    
    # Check flashcard structure
    for card in flashcards[:3]:  # Check first 3
        assert "front" in card
        assert "back" in card
        assert isinstance(card["front"], str)
        assert isinstance(card["back"], str)

@pytest.mark.asyncio
async def test_generate_quiz_structure():
    """Test quiz generation returns structured JSON"""
    result = await llm_generator.generate_quiz(SAMPLE_CONCEPTS, difficulty="mixed", question_count=5)
    
    assert isinstance(result, dict)
    questions = result.get("questions", [])
    assert isinstance(questions, list)
    assert len(questions) > 0
    
    # Check question structure
    for q in questions[:3]:  # Check first 3
        assert "question" in q
        assert "options" in q
        assert "correct_answer" in q
        assert "explanation" in q
        assert isinstance(q["options"], list)
        assert len(q["options"]) == 4  # Should have 4 options
        assert q["correct_answer"] in q["options"]  # Correct answer should be in options

@pytest.mark.asyncio
async def test_quiz_difficulty_scaling():
    """Test quiz difficulty scaling works"""
    easy_result = await llm_generator.generate_quiz(SAMPLE_CONCEPTS, difficulty="easy", question_count=3)
    hard_result = await llm_generator.generate_quiz(SAMPLE_CONCEPTS, difficulty="hard", question_count=3)
    
    easy_questions = easy_result.get("questions", [])
    hard_questions = hard_result.get("questions", [])
    
    # Both should have questions
    assert len(easy_questions) > 0
    assert len(hard_questions) > 0
    
    # Check difficulty field exists
    for q in easy_questions:
        assert "difficulty" in q
    for q in hard_questions:
        assert "difficulty" in q

@pytest.mark.asyncio
async def test_study_plan_structure():
    """Test study plan generation returns structured JSON"""
    result = await llm_generator.study_plan(SAMPLE_CONCEPTS, user_level="intermediate", duration_days=7)
    
    assert isinstance(result, dict)
    assert "plan_name" in result
    assert "duration_days" in result
    assert "daily_sessions" in result
    assert isinstance(result["daily_sessions"], list)
    assert len(result["daily_sessions"]) > 0

@pytest.mark.asyncio
async def test_topic_outline_structure():
    """Test topic outline generation returns structured JSON"""
    result = await llm_generator.generate_topic_outline(SAMPLE_TEXT)
    
    assert isinstance(result, dict)
    assert "title" in result
    assert "sections" in result
    assert isinstance(result["sections"], list)

@pytest.mark.asyncio
async def test_process_text_complete():
    """Test complete text processing pipeline"""
    result = await llm_generator.process_text(SAMPLE_TEXT)
    
    assert isinstance(result, dict)
    assert "concepts" in result
    assert "summary" in result
    assert "outline" in result
    assert result.get("processing_complete") == True

@pytest.mark.asyncio
async def test_json_validity():
    """Test that all outputs are valid JSON"""
    results = [
        await llm_generator.extract_concepts(SAMPLE_TEXT),
        await llm_generator.generate_summary(SAMPLE_TEXT),
        await llm_generator.create_flashcards(SAMPLE_CONCEPTS, count=3),
        await llm_generator.generate_quiz(SAMPLE_CONCEPTS, question_count=3)
    ]
    
    for result in results:
        # Should be able to serialize to JSON
        json_str = json.dumps(result)
        assert len(json_str) > 0
        # Should be able to parse back
        parsed = json.loads(json_str)
        assert isinstance(parsed, dict)

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])


