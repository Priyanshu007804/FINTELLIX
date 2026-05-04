CREATE TABLE IF NOT EXISTS "stock_holdings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL REFERENCES "user"("id"),
  "symbol" text NOT NULL,
  "companyName" text,
  "exchange" text,
  "quantity" numeric(14, 4) NOT NULL,
  "investedAmount" numeric(14, 2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "purchaseDate" timestamp NOT NULL,
  "notes" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
