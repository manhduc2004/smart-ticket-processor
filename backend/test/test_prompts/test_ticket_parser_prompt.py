"""Test cho system prompt."""

import pytest
from app.prompts.ticket_parser_prompt import (
    TICKET_PARSER_SYSTEM_PROMPT,
    get_user_prompt
)


class TestTicketParserPrompt:
    """Test system prompt generation."""

    def test_system_prompt_exists(self):
        """System prompt phải tồn tại và không rỗng."""
        assert TICKET_PARSER_SYSTEM_PROMPT
        assert len(TICKET_PARSER_SYSTEM_PROMPT) > 100
        assert isinstance(TICKET_PARSER_SYSTEM_PROMPT, str)

    def test_system_prompt_contains_rules(self):
        """System prompt phải chứa các quy tắc chính."""
        prompt = TICKET_PARSER_SYSTEM_PROMPT
        
        # Check key sections
        assert "Ticket number" in prompt
        assert "Airlines" in prompt
        assert "Buying" in prompt
        assert "Cust ID" in prompt
        assert "Commission" in prompt
        
        # Check mapping table
        assert "738 → VNA" in prompt or "738" in prompt
        assert "157 → VJA" in prompt or "157" in prompt
        
        # Check output format
        assert "JSON" in prompt
        assert "array" in prompt.lower()

    def test_system_prompt_contains_examples(self):
        """System prompt phải có ví dụ."""
        prompt = TICKET_PARSER_SYSTEM_PROMPT
        assert "VD:" in prompt or "Ví dụ" in prompt or "Example" in prompt

    def test_get_user_prompt(self):
        """User prompt generation."""
        ticket_text = "PNR-ABC123 TKT AMT - VND 1000000"
        prompt = get_user_prompt(ticket_text)
        
        assert ticket_text in prompt
        assert "JSON" in prompt
        assert len(prompt) > len(ticket_text)

    def test_user_prompt_with_multiline_text(self):
        """User prompt với text nhiều dòng."""
        ticket_text = """Line 1
Line 2
Line 3"""
        prompt = get_user_prompt(ticket_text)
        assert "Line 1" in prompt
        assert "Line 3" in prompt