//! Apex Token Contract
//!
//! A fungible reward token (APEX) on Stellar Soroban.
//! Merchants mint APEX to customers; customers redeem APEX for rewards.
//!
//! Functions:
//!   initialize  — set admin, name, symbol, decimals
//!   mint        — admin mints tokens to a recipient
//!   burn        — holder burns their own tokens (redemption)
//!   transfer    — holder transfers tokens to another address
//!   balance     — query balance of an address
//!   total_supply — query total minted supply
//!   allowance   — query approved spend amount
//!   approve     — approve a spender
//!   transfer_from — spend approved tokens

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    Balance(Address),
    Allowance(Address, Address), // (owner, spender)
    TotalSupply,
}

#[contract]
pub struct ApexToken;

#[contractimpl]
impl ApexToken {
    /// Initialise the token. Can only be called once.
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialised");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
    }

    /// Mint `amount` tokens to `to`. Admin only.
    pub fn mint(env: Env, to: Address, amount: i128) {
        assert!(amount > 0, "amount must be positive");
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised");
        admin.require_auth();

        let bal = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(to), &(bal + amount));

        let supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply + amount));
    }

    /// Burn `amount` tokens from caller's balance (redemption).
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "insufficient balance");
        env.storage()
            .instance()
            .set(&DataKey::Balance(from), &(bal - amount));

        let supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply - amount));
    }

    /// Transfer `amount` tokens from caller to `to`.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let from_bal = Self::balance(env.clone(), from.clone());
        assert!(from_bal >= amount, "insufficient balance");
        let to_bal = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(from), &(from_bal - amount));
        env.storage()
            .instance()
            .set(&DataKey::Balance(to), &(to_bal + amount));
    }

    /// Approve `spender` to spend up to `amount` on behalf of caller.
    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Allowance(owner, spender), &amount);
    }

    /// Transfer `amount` from `from` to `to` using caller's allowance.
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        assert!(amount > 0, "amount must be positive");
        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        assert!(allowance >= amount, "insufficient allowance");
        let from_bal = Self::balance(env.clone(), from.clone());
        assert!(from_bal >= amount, "insufficient balance");
        let to_bal = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &(from_bal - amount));
        env.storage()
            .instance()
            .set(&DataKey::Balance(to), &(to_bal + amount));
        env.storage()
            .instance()
            .set(&DataKey::Allowance(from, spender), &(allowance - amount));
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(addr))
            .unwrap_or(0)
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Allowance(owner, spender))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .expect("not initialised")
    }

    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .expect("not initialised")
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Decimals)
            .unwrap_or(7)
    }

    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised")
    }
}

mod test;
