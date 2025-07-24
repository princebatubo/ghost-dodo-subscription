exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { transactionId, amount, planType } = JSON.parse(event.body);

        const dodoApiKey = "u9B2BkDIZgEtAgir.pcM-Oh3Qj_YwqokRKPgq9Ulc-MuWXX43hAKUPBeJsO0HeyJf";

        const response = await fetch(`https://api.dodopayments.com/v1/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${dodoApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.status === 'completed' && data.amount >= amount) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    verified: true,
                    transactionId: data.id,
                    amount: data.amount,
                    customerEmail: data.customer.email,
                    customerName: data.customer.name
                })
            };
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ verified: false, message: 'Payment not completed or amount mismatch' })
            };
        }

    } catch (error) {
        console.error('Error verifying Dodo payment:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Payment verification failed', details: error.message })
        };
    }
};
