restart-node-app:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart node-app

restart-react-app:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart react-app
	
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

dev-volume:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build -V

dev-down:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-down-volume:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build