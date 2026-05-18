//! Apex Campaign Contract
//!
//! Manages merchant reward campaigns on Stellar Soroban.
//! Merchants create campaigns with a budget; the backend calls `issue_reward`
//! to mint APEX tokens to customers when they earn points.
//!
//! Functions:
//!   create_campaign  — merchant creates a campaign with budget + reward rate
//!   issue_reward     — issue APEX to a customer (campaign admin only)
//!   pause_campaign   — pause a campaign
//!   resume_campaign  — resume a paused campaign
//!   close_campaign   — permanently close a campaign
//!   get_campaign     — read campaign state
//!   get_issued       — total APEX issued by a campaign

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, IntoVal, String, Val};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub merchant: Address,
    pub name: String,
    pub token: Address,         // APEX token contract
    pub budget: i128,           // total APEX allocated
    pub issued: i128,           // total APEX issued so far
    pub reward_per_point: i128, // APEX per loyalty point
    pub active: bool,
    pub closed: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Campaign(u32),
    CampaignCount,
    CustomerIssued(u32, Address), // (campaign_id, customer)
}

#[contract]
pub struct ApexCampaign;

#[contractimpl]
impl ApexCampaign {
    /// Initialise the campaign registry. Called once by the platform admin.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialised");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::CampaignCount, &0_u32);
    }

    /// Merchant creates a new campaign. Returns the campaign ID.
    pub fn create_campaign(
        env: Env,
        merchant: Address,
        name: String,
        token: Address,
        budget: i128,
        reward_per_point: i128,
    ) -> u32 {
        merchant.require_auth();
        assert!(budget > 0, "budget must be positive");
        assert!(reward_per_point > 0, "reward_per_point must be positive");

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);
        let id = count;

        let campaign = Campaign {
            merchant,
            name,
            token,
            budget,
            issued: 0,
            reward_per_point,
            active: true,
            closed: false,
        };

        env.storage()
            .instance()
            .set(&DataKey::Campaign(id), &campaign);
        env.storage()
            .instance()
            .set(&DataKey::CampaignCount, &(count + 1));
        id
    }

    /// Issue `points` worth of APEX to `customer` from campaign `id`.
    /// Only the campaign's merchant can call this.
    pub fn issue_reward(env: Env, id: u32, customer: Address, points: i128) {
        assert!(points > 0, "points must be positive");
        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::Campaign(id))
            .expect("campaign not found");

        campaign.merchant.require_auth();
        assert!(campaign.active, "campaign is not active");
        assert!(!campaign.closed, "campaign is closed");

        let amount = points * campaign.reward_per_point;
        assert!(
            campaign.issued + amount <= campaign.budget,
            "exceeds campaign budget"
        );

        // Mint via the APEX token contract
        let mut mint_args: soroban_sdk::Vec<Val> = soroban_sdk::Vec::new(&env);
        mint_args.push_back(customer.clone().into_val(&env));
        mint_args.push_back(amount.into_val(&env));
        let _: Val = env.invoke_contract(
            &campaign.token,
            &soroban_sdk::Symbol::new(&env, "mint"),
            mint_args,
        );

        campaign.issued += amount;
        env.storage()
            .instance()
            .set(&DataKey::Campaign(id), &campaign);

        let prev: i128 = env
            .storage()
            .instance()
            .get(&DataKey::CustomerIssued(id, customer.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::CustomerIssued(id, customer), &(prev + amount));
    }

    /// Pause a campaign. Merchant only.
    pub fn pause_campaign(env: Env, id: u32) {
        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::Campaign(id))
            .expect("campaign not found");
        campaign.merchant.require_auth();
        assert!(!campaign.closed, "campaign is closed");
        campaign.active = false;
        env.storage()
            .instance()
            .set(&DataKey::Campaign(id), &campaign);
    }

    /// Resume a paused campaign. Merchant only.
    pub fn resume_campaign(env: Env, id: u32) {
        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::Campaign(id))
            .expect("campaign not found");
        campaign.merchant.require_auth();
        assert!(!campaign.closed, "campaign is closed");
        campaign.active = true;
        env.storage()
            .instance()
            .set(&DataKey::Campaign(id), &campaign);
    }

    /// Permanently close a campaign. Merchant only.
    pub fn close_campaign(env: Env, id: u32) {
        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::Campaign(id))
            .expect("campaign not found");
        campaign.merchant.require_auth();
        campaign.active = false;
        campaign.closed = true;
        env.storage()
            .instance()
            .set(&DataKey::Campaign(id), &campaign);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    pub fn get_campaign(env: Env, id: u32) -> Campaign {
        env.storage()
            .instance()
            .get(&DataKey::Campaign(id))
            .expect("campaign not found")
    }

    pub fn campaign_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }

    pub fn customer_issued(env: Env, id: u32, customer: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::CustomerIssued(id, customer))
            .unwrap_or(0)
    }
}

mod test;
