CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  contract_id TEXT,
  budget BIGINT NOT NULL,
  issued BIGINT NOT NULL DEFAULT 0,
  reward_per_point BIGINT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_merchant ON campaigns(merchant_id);
CREATE INDEX idx_campaigns_active ON campaigns(active) WHERE active = TRUE;
