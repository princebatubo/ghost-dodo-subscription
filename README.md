# Ghost Dodo Payments Subscription System

Custom subscription system for Ghost CMS using Dodo Payments to bypass Stripe limitations.

## Features
- Integrates with Ghost Admin API
- Uses Dodo Payments for international payments
- Creates paid members automatically
- Works with Common Ninja pricing components

## Setup
1. Deploy to Netlify
2. Add your Dodo API key to `verify-dodo-payment.js`
3. Update Netlify URL in `subscription-handler.js`
4. Embed pricing component with subscription buttons

## Usage
Add to your Common Ninja pricing:
```html
<button class="subscription-btn" data-plan="basic" data-amount="9.99">Subscribe</button>RequirementsGhost CMS siteDodo Payments accountNetlify account
