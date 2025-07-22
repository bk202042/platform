#!/bin/bash

# Set environment variables from .env file if it exists
if [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Install dependencies
npm install

# Install Playwright browsers if needed
npx playwright install --with-deps chromium

# Run the tests
npx playwright test

# Open the report
npx playwright show-report
