class DodoSubscriptionHandler {
    constructor(netlifyUrl) {
        this.netlifyUrl = netlifyUrl;
        this.apiBase = `${netlifyUrl}/.netlify/functions`;
    }

    async handleSubscription(planType, userDetails, transactionId, amount) {
        try {
            this.showLoading();

            const paymentVerified = await this.verifyDodoPayment(transactionId, amount, planType);
            if (!paymentVerified.verified) throw new Error('Dodo payment verification failed');

            const response = await fetch(`${this.apiBase}/create-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: paymentVerified.customerEmail || userDetails.email,
                    name: paymentVerified.customerName || userDetails.name,
                    planType: planType,
                    paymentReference: transactionId
                })
            });

            const result = await response.json();
            if (result.success) {
                this.showSuccess(result.message);
                setTimeout(() => { window.location.href = '/members/'; }, 2000);
            } else throw new Error(result.error);

        } catch (error) {
            console.error('Subscription error:', error);
            this.showError(error.message);
        } finally { this.hideLoading(); }
    }

    async verifyDodoPayment(transactionId, amount, planType) {
        const response = await fetch(`${this.apiBase}/verify-dodo-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId, amount, planType })
        });
        return await response.json();
    }

    showLoading() { const btn = document.querySelector('.subscribe-button'); if (btn) { btn.textContent = 'Processing...'; btn.disabled = true; } }
    hideLoading() { const btn = document.querySelector('.subscribe-button'); if (btn) { btn.textContent = 'Subscribe'; btn.disabled = false; } }
    showSuccess(msg) { alert(`Success: ${msg}`); }
    showError(msg) { alert(`Error: ${msg}`); }
}

const subscriptionHandler = new DodoSubscriptionHandler('https://your-netlify-site.netlify.app');
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.subscription-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const planType = this.dataset.plan;
            const amount = parseFloat(this.dataset.amount);
            const userDetails = { name: prompt('Enter your name:'), email: prompt('Enter your email:') };
            if (userDetails.name && userDetails.email) {
                const transactionId = prompt('Enter Dodo transaction ID:');
                if (transactionId) subscriptionHandler.handleSubscription(planType, userDetails, transactionId, amount);
            }
        });
    });
});
