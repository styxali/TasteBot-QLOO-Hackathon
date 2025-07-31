#!/bin/bash

# Test webhook endpoint manually
echo "Testing webhook endpoint..."

curl -X POST http://localhost:3000/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456789,
    "message": {
      "message_id": 1,
      "from": {
        "id": 123456789,
        "is_bot": false,
        "first_name": "Test",
        "username": "testuser"
      },
      "chat": {
        "id": 123456789,
        "first_name": "Test",
        "username": "testuser",
        "type": "private"
      },
      "date": 1640995200,
      "text": "/start"
    }
  }'

echo -e "\n\nIf you see logs in your server console, the webhook endpoint is working!"