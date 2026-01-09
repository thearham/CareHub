# Makefile for CareHub Django Project

.PHONY: help install migrate run test clean demo

help:
	@echo "CareHub Django Project Commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make migrate    - Run database migrations"
	@echo "  make superuser  - Create superuser"
	@echo "  make demo       - Create demo data"
	@echo "  make run        - Run development server"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean temporary files"
	@echo "  make celery     - Run Celery worker"

install:
	pip install -r requirements.txt

migrate:
	python manage.py makemigrations
	python manage.py migrate

superuser:
	python manage.py createsuperuser

demo:
	python manage.py create_demo_data

run:
	python manage.py runserver 0.0.0.0:8000

test:
	pytest

test-coverage:
	pytest --cov=. --cov-report=html

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.coverage" -delete
	rm -rf htmlcov/
	rm -rf .pytest_cache/

celery:
	celery -A carehub worker -l info

celery-beat:
	celery -A carehub beat -l info

collectstatic:
	python manage.py collectstatic --noinput

shell:
	python manage.py shell
