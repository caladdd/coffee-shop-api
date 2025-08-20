## Coffee Shop API (Serverless on AWS)

A Serverless Framework template that deploys a REST API (API Gateway) with CRUD Lambdas backed by DynamoDB. CI/CD via GitHub Actions with dev → prod

### Architecture
- API Gateway (REST)
- AWS Lambda (Node.js 20, TypeScript, Jest tests)
- DynamoDB (PAY_PER_REQUEST)
- CI/CD: GitHub Actions → serverless deploy

### Stages
- dev: auto‑deploy on push to branch dev
- prod: auto‑deploy on push to branch main

### Quick Start
```bash
npm i
npm run deploy:dev 
```

### API
- POST /orders
- GET /orders/{id}
- GET /orders
- PUT /orders/{id}
- DELETE /orders/{id}

### Data model (JSON)
- Order
    - id: string (UUID)
    - customerName: string
    - coffeeType: string
    - status: string (PENDING | CANCELLED | COMPLETED )
    - createdAt: ISO string
    - updatedAt: ISO string

### Testing
- Run tests:
    - npm run test

### CI/CD
- Workflow files: .github/workflows/*.yml
- Secrets required:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - AWS_REGION
    - SERVERLESS_ACCESS_KEY
- On push to dev or main, the workflow builds, tests, and deploys the corresponding stage.
