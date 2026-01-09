#!/usr/bin/env python3
"""
Remove U.S. territories from district data, keeping only 50 states + DC
"""

import json

# Territory prefixes to remove
TERRITORIES = ['GU-', 'VI-', 'AS-', 'MP-', 'PR-']

def main():
    print("Reading district data...")
    with open('data/district-data-no-geo.json', 'r') as f:
        data = json.load(f)

    original_count = len(data['districts'])

    # Filter out territories
    data['districts'] = [
        d for d in data['districts']
        if not any(d['id'].startswith(t) for t in TERRITORIES)
    ]

    new_count = len(data['districts'])
    removed = original_count - new_count

    print(f"\nRemoved {removed} territories")
    print(f"Districts remaining: {new_count}")
    print(f"  - 435 voting districts (50 states)")
    print(f"  - 1 non-voting district (DC)")

    # Update note
    data['_note'] = "Dataset for all 436 congressional districts (435 voting districts from 50 states + 1 non-voting district from DC). Includes district boundaries, current representatives, and 2025 Cook PVI data."

    # Write updated data
    print("\nWriting updated district data...")
    with open('data/district-data-no-geo.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("✓ Successfully removed territories!")

    # Verify states
    states = set(d['state'] for d in data['districts'])
    print(f"\nStates/districts included: {len(states)}")
    if 'District of Columbia' in states:
        print("  ✓ DC included")

if __name__ == '__main__':
    main()
