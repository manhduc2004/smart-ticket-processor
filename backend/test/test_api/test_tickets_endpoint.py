import pytest
import json
from unittest.mock import patch, MagicMock

from app.schemas.ticket import TicketData


class TestTicketsParseEndpoint:
    """Test POST /api/v1/tickets/parse"""

    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_parse_success(self, mock_ollama_service, client, auth_headers):
        """Test parse thành công."""
        mock_tickets = [
            TicketData(
                airlines="VNA",
                ticket_number="7383007215202",
                buying=9590000,
                currency="VND"
            )
        ]
        mock_ollama_service.parse_tickets.return_value = mock_tickets
        
        response = client.post(
            "/api/v1/tickets/parse",
            json={"text": "test ticket text"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total"] == 1
        assert len(data["tickets"]) == 1
        assert data["tickets"][0]["airlines"] == "VNA"

    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_parse_multiple_tickets(self, mock_ollama_service, client, auth_headers):
        """Test parse nhiều vé."""
        mock_tickets = [
            TicketData(airlines="VNA", ticket_number="1111111111111"),
            TicketData(airlines="VJA", ticket_number="2222222222222"),
            TicketData(airlines="KAL", ticket_number="3333333333333"),
        ]
        mock_ollama_service.parse_tickets.return_value = mock_tickets
        
        response = client.post(
            "/api/v1/tickets/parse",
            json={"text": "multiple tickets"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["tickets"]) == 3

    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_parse_empty_result(self, mock_ollama_service, client, auth_headers):
        """Test parse không tìm thấy vé."""
        mock_ollama_service.parse_tickets.return_value = []
        
        response = client.post(
            "/api/v1/tickets/parse",
            json={"text": "no tickets here"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["tickets"]) == 0

    def test_parse_unauthorized(self, client):
        """Test parse without auth."""
        response = client.post(
            "/api/v1/tickets/parse",
            json={"text": "test"}
        )
        
        assert response.status_code == 401

    def test_parse_missing_text(self, client, auth_headers):
        """Test parse với missing text field."""
        response = client.post(
            "/api/v1/tickets/parse",
            json={},
            headers=auth_headers
        )
        
        assert response.status_code == 422  # Validation error

    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_parse_ollama_error(self, mock_ollama_service, client, auth_headers):
        """Test handle lỗi từ Ollama."""
        mock_ollama_service.parse_tickets.side_effect = Exception("Ollama error")
        
        response = client.post(
            "/api/v1/tickets/parse",
            json={"text": "test"},
            headers=auth_headers
        )
        
        assert response.status_code == 500
        assert "Parse failed" in response.json()["detail"]


class TestTicketsExportEndpoint:
    """Test POST /api/v1/tickets/export"""

    @patch('app.api.v1.endpoints.tickets.excel_service')
    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_export_success(self, mock_ollama_service, mock_excel_service, client, auth_headers, temp_export_dir):
        """Test export Excel thành công."""
        # Mock parse
        mock_tickets = [
            TicketData(airlines="VNA", ticket_number="7383007215202")
        ]
        mock_ollama_service.parse_tickets.return_value = mock_tickets
        
        # Mock export
        test_filepath = f"{temp_export_dir}/test_export.xlsx"
        with open(test_filepath, "w") as f:
            f.write("dummy excel content")
        
        mock_excel_service.export.return_value = test_filepath
        
        response = client.post(
            "/api/v1/tickets/export",
            json={"text": "test ticket"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_export_no_tickets_found(self, mock_ollama_service, client, auth_headers):
        """Test export khi không tìm thấy vé."""
        mock_ollama_service.parse_tickets.return_value = []
        
        response = client.post(
            "/api/v1/tickets/export",
            json={"text": "no tickets"},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "Không tìm thấy vé" in response.json()["detail"]

    def test_export_unauthorized(self, client):
        """Test export without auth."""
        response = client.post(
            "/api/v1/tickets/export",
            json={"text": "test"}
        )
        
        assert response.status_code == 401

    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_export_ollama_error(self, mock_ollama_service, client, auth_headers):
        """Test handle lỗi parse."""
        mock_ollama_service.parse_tickets.side_effect = Exception("Parse error")
        
        response = client.post(
            "/api/v1/tickets/export",
            json={"text": "test"},
            headers=auth_headers
        )
        
        assert response.status_code == 500

    @patch('app.api.v1.endpoints.tickets.excel_service')
    @patch('app.api.v1.endpoints.tickets.ollama_service')
    def test_export_excel_error(self, mock_ollama_service, mock_excel_service, client, auth_headers):
        """Test handle lỗi export."""
        mock_ollama_service.parse_tickets.return_value = [
            TicketData(airlines="VNA")
        ]
        mock_excel_service.export.side_effect = Exception("Export error")
        
        response = client.post(
            "/api/v1/tickets/export",
            json={"text": "test"},
            headers=auth_headers
        )
        
        assert response.status_code == 500