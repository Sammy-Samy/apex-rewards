#![cfg(test)]

use soroban_sdk::{testutils::Address as _, Address, Env, String};

use crate::{ApexCampaign, ApexCampaignClient};

fn setup() -> (Env, Address, ApexCampaignClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let id = env.register(ApexCampaign, ());
    let client = ApexCampaignClient::new(&env, &id);
    client.initialize(&admin);
    (env, admin, client)
}

#[test]
fn test_create_campaign() {
    let (env, _admin, client) = setup();
    let merchant = Address::generate(&env);
    let token = Address::generate(&env);
    let cid = client.create_campaign(
        &merchant,
        &String::from_str(&env, "Summer Sale"),
        &token,
        &100_000,
        &10,
    );
    assert_eq!(cid, 0);
    assert_eq!(client.campaign_count(), 1);

    let c = client.get_campaign(&0);
    assert_eq!(c.name, String::from_str(&env, "Summer Sale"));
    assert_eq!(c.budget, 100_000);
    assert_eq!(c.issued, 0);
    assert!(c.active);
    assert!(!c.closed);
}

#[test]
fn test_pause_and_resume() {
    let (env, _admin, client) = setup();
    let merchant = Address::generate(&env);
    let token = Address::generate(&env);
    client.create_campaign(&merchant, &String::from_str(&env, "C"), &token, &1_000, &1);
    client.pause_campaign(&0);
    assert!(!client.get_campaign(&0).active);
    client.resume_campaign(&0);
    assert!(client.get_campaign(&0).active);
}

#[test]
fn test_close_campaign() {
    let (env, _admin, client) = setup();
    let merchant = Address::generate(&env);
    let token = Address::generate(&env);
    client.create_campaign(&merchant, &String::from_str(&env, "C"), &token, &1_000, &1);
    client.close_campaign(&0);
    let c = client.get_campaign(&0);
    assert!(!c.active);
    assert!(c.closed);
}

#[test]
#[should_panic(expected = "already initialised")]
fn test_double_initialize_panics() {
    let (_env, admin, client) = setup();
    client.initialize(&admin);
}

#[test]
#[should_panic(expected = "campaign is closed")]
fn test_pause_closed_campaign_panics() {
    let (env, _admin, client) = setup();
    let merchant = Address::generate(&env);
    let token = Address::generate(&env);
    client.create_campaign(&merchant, &String::from_str(&env, "C"), &token, &1_000, &1);
    client.close_campaign(&0);
    client.pause_campaign(&0);
}
