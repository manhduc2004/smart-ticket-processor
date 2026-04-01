import pytest
from unittest.mock import Mock, patch, MagicMock
import json

from app.service.ollama_service import OllamaService
from app.schemas.ticket import TicketData


class TestOllamaService:
    """Test OllamaService."""

    def test_init(self):
        """Test khởi tạo service."""
        service = OllamaService(model="llama3.2:3b")
        assert service.model == "llama3.2:3b"
        assert service.client is not None

    def test_init_default_model(self):
        """Test default model."""
        service = OllamaService()
        assert service.model == "llama3.2:3b"

    @patch('app.service.ollama_service.ollama.Client')
    def test_parse_tickets_success(self, mock_ollama_client):
        """Test parse tickets thành công."""
        # Mock Ollama response
        mock_response = {
            "message": {
                "content": json.dumps([
                    {
                        "airlines": "VNA",
                        "ticket_number": "7383007215202",
                        "cust_id": "TIKET",
                        "selling": None,
                        "commission_selling": None,
                        "buying": 9590000,
                        "commission_buying": 0,
                        "currency": "VND",
                        "fare": 9684000,
                        "admin_amount": None,
                        "service": None,
                        "note": None
                    }
                ])
            }
        }
        
        mock_client_instance = MagicMock()
        mock_client_instance.chat.return_value = mock_response
        mock_ollama_client.return_value = mock_client_instance
        
        service = OllamaService()
        text = "PNR-TEST COMM AMT- 0 TKT AMT - VND 9590000CA 7383007215202 VN ETR.TIKET"
        
        tickets = service.parse_tickets(text)
        
        assert len(tickets) == 1
        assert isinstance(tickets[0], TicketData)
        assert tickets[0].airlines == "VNA"
        assert tickets[0].ticket_number == "7383007215202"
        assert tickets[0].buying == 9590000

    @patch('app.service.ollama_service.ollama.Client')
    def test_parse_tickets_with_markdown_fence(self, mock_ollama_client):
        """Test parse khi response có markdown ```json"""
        mock_response = {
            "message": {
                "content": """```json
[
  {
    "airlines": "VNA",
    "ticket_number": "7383007215204",
    "cust_id": "GLORY",
    "selling": 7517000,
    "commission_selling": null,
    "buying": 7517000,
    "commission_buying": 0,
    "currency": "VND",
    "fare": null,
    "admin_amount": null,
    "service": null,
    "note": null
  }
]
````"""
            }
        }
        
        mock_client_instance = MagicMock()
        mock_client_instance.chat.return_value = mock_response
        mock_ollama_client.return_value = mock_client_instance
        
        service = OllamaService()
        tickets = service.parse_tickets("test text")
        
        assert len(tickets) == 1
        assert tickets[0].airlines == "VNA"

    @patch('app.service.ollama_service.ollama.Client')
    def test_parse_tickets_empty_result(self, mock_ollama_client):
        """Test parse khi không có vé nào."""
        mock_response = {
            "message": {
                "content": "[]"
            }
        }
        
        mock_client_instance = MagicMock()
        mock_client_instance.chat.return_value = mock_response
        mock_ollama_client.return_value = mock_client_instance
        
        service = OllamaService()
        tickets = service.parse_tickets("no ticket text")
        
        assert len(tickets) == 0

    @patch('app.service.ollama_service.ollama.Client')
    def test_parse_tickets_ollama_error(self, mock_ollama_client):
        """Test handle lỗi từ Ollama."""
        mock_client_instance = MagicMock()
        mock_client_instance.chat.side_effect = Exception("Ollama connection error")
        mock_ollama_client.return_value = mock_client_instance
        
        service = OllamaService()
        
        with pytest.raises(Exception):
            service.parse_tickets("test text")

    def test_extract_json_with_markdown(self):
        """Test _extract_json với markdown fence."""
        service = OllamaService()
        
        text = """```json
{"test": "value"}
```"""
        result = service._extract_json(text)
        assert result == '{"test": "value"}'

    def test_extract_json_without_markdown(self):
        """Test _extract_json không có markdown."""
        service = OllamaService()
        
        text = '{"test": "value"}'
        result = service._extract_json(text)
        assert result == '{"test": "value"}'

    def test_extract_json_array(self):
        """Test _extract_json với array."""
        service = OllamaService()
        
        text = """Some text before
[{"a": 1}, {"b": 2}]
Some text after"""
        result = service._extract_json(text)
        assert result == '[{"a": 1}, {"b": 2}]'