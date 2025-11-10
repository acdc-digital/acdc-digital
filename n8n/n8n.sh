#!/bin/bash

# Quick reference for common n8n operations

case "$1" in
    start)
        ./start-n8n.sh
        ;;
    stop)
        echo "Press Ctrl+C in the n8n terminal, or:"
        pkill -f n8n
        ;;
    restart)
        pkill -f n8n
        sleep 2
        ./start-n8n.sh
        ;;
    status)
        ./status.sh
        ;;
    logs)
        tail -f ~/.n8n/logs/n8n.log
        ;;
    setup)
        ./setup.sh
        ;;
    db)
        ./setup-database.sh
        ;;
    *)
        echo "ACDC Digital - N8N Management"
        echo ""
        echo "Usage: ./n8n.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start    - Start n8n instance"
        echo "  stop     - Stop n8n instance"
        echo "  restart  - Restart n8n instance"
        echo "  status   - Check instance status"
        echo "  logs     - View logs (live)"
        echo "  setup    - Run initial setup"
        echo "  db       - Configure database"
        echo ""
        echo "Quick access:"
        echo "  URL: http://localhost:5678"
        echo "  Config: .env"
        echo "  Docs: README.md"
        echo ""
        ;;
esac
