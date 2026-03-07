const API_URL = 'http://localhost:5001/api/auth/login';

async function testLogin(email, password, role) {
    console.log(`\nTesting login for ${role} (${email})...`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Login Success for ${role}:`, response.status);
            console.log('User Role:', data.data.user.role);
            return data.data.token;
        } else {
            console.log(`❌ Login Failed for ${role}:`, response.status);
            console.log('Error Data:', data);
            return null;
        }
    } catch (error) {
        console.log(`❌ Network Error for ${role}:`, error.message);
        return null;
    }
}

async function runTests() {
    // 1. Admin Login
    const adminToken = await testLogin('dankfd99@gmail.com', 'Admin@123', 'admin');

    if (adminToken) {
        // 2. Create Agent
        console.log('\nCreating Agent...');
        const agentEmail = `agent_${Date.now()}@fpro.com`;
        const agentPass = 'Agent@123';
        try {
            const createResponse = await fetch('http://localhost:5001/api/admin/users/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    email: agentEmail,
                    password: agentPass,
                    first_name: 'Test',
                    last_name: 'Agent',
                    phone: '12345678',
                    company_id: null // Internal agent
                })
            });

            if (createResponse.ok) {
                console.log('✅ Agent Created');
                // 3. Agent Login
                await testLogin(agentEmail, agentPass, 'New Agent');
            } else {
                const err = await createResponse.json();
                console.log('❌ Agent Creation Failed:', err);
            }
        } catch (e) {
            console.log('❌ Agent Creation Network Error:', e.message);
        }
    }

    // 4. Test Existing Technician (from seed)
    await testLogin('tech1@fpro.com', 'Tech@123', 'technicien (seed)');
}

runTests();
