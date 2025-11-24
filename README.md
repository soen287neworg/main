# Project

This project was built using the following stack:

- Framework: Tanstack Start
- Auth: BetterAuth
- DB: Prisma for ORM, Postgres for DB
- CDN: S3 (of your choice)

# Requirements

- node >= v24
- yarn (preferably)
- Cloudflare R2 account

# Usage (local)

1. (Preferably) use yarn to install dependencies  
   `yarn`

2. Set-up database with Prisma  
   `yarn prisma dev`

3. Configure .env with the conn. string provided by dev prisma db

```
DATABASE_URL="postgresql://[your_connection_string_here]"
BETTER_AUTH_SECRET=[random32stringwithopenssl]
BETTER_AUTH_URL=http://localhost:3000

CF_TOKEN_VALUE=[token_here]
CF_ACCESS_KEY_ID=[key_id_here]
CF_SECRET_ACCESS_KEY=[secret_here]

S3_API_URL=[endpoint_here]
S3_ACCESS_KEY=$CF_ACCESS_KEY_ID
S3_ACCESS_SECRET=$CF_SECRET_ACCESS_KEY
S3_BUCKET=[bucket_here]
```

4. Run prisma migrations  
   `yarn prisma migrate dev`

5. Run the seeder  
   `yarn prisma db seed`

6. Run the project  
   `yarn dev`

7. Register an account

8. Run prisma db studio  
   `yarn prisma studio`

9. Modify roles of your user to have admin privileges
