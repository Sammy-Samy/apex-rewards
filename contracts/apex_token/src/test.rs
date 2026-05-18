#![cfg(test)]

use soroban_sdk::{testutils::Address as _, Address, Env, String};

use crate::{ApexToken, ApexTokenClient};

fn setup() -> (Env, Address, ApexTokenClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let id = env.register(ApexToken, ());
    let client = ApexTokenClient::new(&env, &id);
    client.initialize(
        &admin,
        &String::from_str(&env, "Apex Rewards Token"),
        &String::from_str(&env, "APEX"),
        &7_u32,
    );
    (env, admin, client)
}

#[test]
fn test_initialize_and_views() {
    let (env, admin, client) = setup();
    assert_eq!(client.name(), String::from_str(&env, "Apex Rewards Token"));
    assert_eq!(client.symbol(), String::from_str(&env, "APEX"));
    assert_eq!(client.decimals(), 7);
    assert_eq!(client.admin(), admin);
    assert_eq!(client.total_supply(), 0);
}

#[test]
#[should_panic(expected = "already initialised")]
fn test_double_initialize_panics() {
    let (env, admin, client) = setup();
    client.initialize(
        &admin,
        &String::from_str(&env, "X"),
        &String::from_str(&env, "X"),
        &7_u32,
    );
}

#[test]
fn test_mint_and_balance() {
    let (env, _admin, client) = setup();
    let user = Address::generate(&env);
    client.mint(&user, &1_000_000);
    assert_eq!(client.balance(&user), 1_000_000);
    assert_eq!(client.total_supply(), 1_000_000);
}

#[test]
fn test_transfer() {
    let (env, _admin, client) = setup();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    client.mint(&alice, &500);
    client.transfer(&alice, &bob, &200);
    assert_eq!(client.balance(&alice), 300);
    assert_eq!(client.balance(&bob), 200);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient_balance_panics() {
    let (env, _admin, client) = setup();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    client.mint(&alice, &100);
    client.transfer(&alice, &bob, &200);
}

#[test]
fn test_burn() {
    let (env, _admin, client) = setup();
    let user = Address::generate(&env);
    client.mint(&user, &1_000);
    client.burn(&user, &400);
    assert_eq!(client.balance(&user), 600);
    assert_eq!(client.total_supply(), 600);
}

#[test]
fn test_approve_and_transfer_from() {
    let (env, _admin, client) = setup();
    let owner = Address::generate(&env);
    let spender = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.mint(&owner, &1_000);
    client.approve(&owner, &spender, &300);
    assert_eq!(client.allowance(&owner, &spender), 300);
    client.transfer_from(&spender, &owner, &recipient, &200);
    assert_eq!(client.balance(&owner), 800);
    assert_eq!(client.balance(&recipient), 200);
    assert_eq!(client.allowance(&owner, &spender), 100);
}

#[test]
#[should_panic(expected = "insufficient allowance")]
fn test_transfer_from_exceeds_allowance_panics() {
    let (env, _admin, client) = setup();
    let owner = Address::generate(&env);
    let spender = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.mint(&owner, &1_000);
    client.approve(&owner, &spender, &100);
    client.transfer_from(&spender, &owner, &recipient, &200);
}
