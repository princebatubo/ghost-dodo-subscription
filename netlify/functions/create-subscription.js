const GhostAdminAPI = require('@tryghost/admin-api');

const api = new GhostAdminAPI({
    url: 'https://sassy-tuatara.pikapod.net',
    key: '687e5d1605cdd80001029bfd:cfe9581cfb49ede9cd5c98c3e9539e3909ec83fb84703f98033e0f0432a3d15f',
    version: 'v5.0'
});

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
        const { email, name, planType, paymentReference } = JSON.parse(event.body);

        if (!email || !name || !planType || !paymentReference) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const plans = {
            free: {
                labels: ['free-subscriber'],
                note: 'Free plan access'
            },
            insider: {
                labels: ['insider-subscriber', 'paid'],
                note: 'Insider plan subscription'
            },
            creator: {
                labels: ['creator-circle', 'paid'],
                note: 'Creator Circle subscription'
            }
        };

        const selectedPlan = plans[planType.toLowerCase()];
        if (!selectedPlan) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid plan type' })
            };
        }

        let member;
        try {
            member = await api.members.read({ email: email });
        } catch {
            member = null;
        }

        if (member) {
            const updatedMember = await api.members.edit({
                id: member.id,
                labels: [...new Set([...member.labels.map(l => l.name), ...selectedPlan.labels])],
                note: `${member.note || ''}\n${selectedPlan.note} - Payment: ${paymentReference}`.trim()
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Subscription updated successfully',
                    member: updatedMember
                })
            };
        } else {
            const newMember = await api.members.add({
                email: email,
                name: name,
                labels: selectedPlan.labels,
                note: `${selectedPlan.note} - Payment: ${paymentReference}`
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Subscription created successfully',
                    member: newMember
                })
            };
        }

    } catch (error) {
        console.error('Error creating subscription:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
