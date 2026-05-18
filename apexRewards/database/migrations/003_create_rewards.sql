CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points BIGINT NOT NULL,
  apex_amount BIGINT NOT NULL,
  stellar_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rewards_campaign ON rewards(campaign_id);
CREATE INDEX idx_rewards_customer ON rewards(customer_id);
