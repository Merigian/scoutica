import json

with open('src/messages/it.json') as f:
    it = json.load(f)
with open('src/messages/en.json') as f:
    en = json.load(f)

required = ['privacy','terms','cookie','deleteAccount','dataExport','resetPassword','withdraw','onboarding','boostPurchase','report','opportunityFilters']
print("=== i18n top-level keys ===")
for k in required:
    it_ok = k in it
    en_ok = k in en
    status = 'OK' if it_ok and en_ok else 'MISSING'
    print(f'  {k}: {status} (IT:{it_ok} EN:{en_ok})')

print("\n=== Footer links ===")
print(f'  footer.privacy: {"OK" if "privacy" in it.get("footer",{}) else "MISSING"}')
print(f'  footer.terms: {"OK" if "terms" in it.get("footer",{}) else "MISSING"}')

print("\n=== OAuth keys ===")
print(f'  auth.register.completeSetup: {"OK" if "completeSetup" in it.get("auth",{}).get("register",{}) else "MISSING"}')
print(f'  auth.register.roles: {"OK" if "roles" in it.get("auth",{}).get("register",{}) else "MISSING"}')

print("\n=== Scout profile ===")
print(f'  pages.publicScoutProfile: {"OK" if "publicScoutProfile" in it.get("pages",{}) else "MISSING"}')

print("\n=== Edit keys ===")
scout_pages = it.get("pages",{}).get("scout",{})
print(f'  castingsNew.editTitle: {"OK" if "editTitle" in scout_pages.get("castingsNew",{}) else "MISSING"}')
print(f'  lavoriNew.editTitle: {"OK" if "editTitle" in scout_pages.get("lavoriNew",{}) else "MISSING"}')

print("\n=== Report cancel ===")
print(f'  report.cancel: {"OK" if "cancel" in it.get("report",{}) else "MISSING"}')
