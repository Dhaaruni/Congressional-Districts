#!/usr/bin/env python3
"""
Integrate Cook PVI data from CSV into district-data-no-geo.json
"""

import json
import csv
import sys

# State name to abbreviation mapping
STATE_ABBREV = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
}

def pvi_to_numeric(pvi_str):
    """Convert PVI string like 'R+15' or 'D+20' to numeric value.

    Positive numbers = Republican lean
    Negative numbers = Democratic lean
    0 = EVEN
    """
    if pvi_str == 'EVEN':
        return 0

    party = pvi_str[0]
    value = int(pvi_str[2:])  # Skip the '+' sign

    if party == 'R':
        return value
    elif party == 'D':
        return -value
    else:
        return None

def main():
    # Read Cook PVI CSV
    pvi_data = {}
    print("Reading Cook PVI CSV...")
    with open('data/cook-pvi-2025.csv', 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            state = row['State']
            number = row['Number']
            pvi = row['2025 Cook PVI'].strip()

            # Create district ID
            state_abbrev = STATE_ABBREV.get(state)
            if not state_abbrev:
                print(f"Warning: Unknown state '{state}'")
                continue

            # Handle at-large districts
            # States with at-large districts: AK, DE, MT, ND, SD, VT, WY
            at_large_states = ['AK', 'DE', 'ND', 'SD', 'VT', 'WY']

            if number.upper() == 'AL' or number == '0':
                # Check if this state uses -AL suffix
                if state_abbrev in at_large_states:
                    district_id = f"{state_abbrev}-AL"
                else:
                    district_id = f"{state_abbrev}-01"
            else:
                district_id = f"{state_abbrev}-{int(number):02d}"

            pvi_data[district_id] = pvi

    print(f"Loaded {len(pvi_data)} PVI values from CSV")

    # Read district data JSON
    print("Reading district data JSON...")
    with open('data/district-data-no-geo.json', 'r') as f:
        data = json.load(f)

    # Update districts with PVI data
    matched = 0
    unmatched = []

    for district in data['districts']:
        district_id = district['id']

        if district_id in pvi_data:
            pvi_str = pvi_data[district_id]
            district['pvi'] = pvi_str
            district['pvi_numeric'] = pvi_to_numeric(pvi_str)
            matched += 1
        else:
            unmatched.append(district_id)

    print(f"\nMatched {matched} districts")
    if unmatched:
        print(f"Unmatched districts ({len(unmatched)}): {', '.join(unmatched[:10])}")
        if len(unmatched) > 10:
            print(f"  ... and {len(unmatched) - 10} more")

    # Write updated JSON
    print("\nWriting updated district data...")
    with open('data/district-data-no-geo.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("✓ Successfully integrated Cook PVI data!")
    print(f"  Total districts updated: {matched}")

    # Show some examples
    print("\nSample PVI values:")
    for district in data['districts'][:5]:
        print(f"  {district['id']}: {district['pvi']} (numeric: {district['pvi_numeric']})")

if __name__ == '__main__':
    main()
