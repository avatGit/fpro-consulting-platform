const API_URL = 'http://localhost:5000/api/auth';

const uniqueEmail = `admin_test_${Date.now()}@example.com`;
const uniqueCompany = `TestCompany_${Date.now()}`;

async function testRegister() {
    console.log('Testing Registration...');
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'password123',
                confirmPassword: 'password123',
                first_name: 'Test',
                last_name: 'Admin',
                companyName: uniqueCompany,
                phone: '1234567890'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Registration Successful!');
            console.log(data);
            return data.token;
        } else {
            console.error('❌ Registration Failed!');
            console.error('Status:', response.status);
            console.error('Data:', JSON.stringify(data, null, 2));
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function testLogin(email, password) {
    console.log('\nTesting Login...');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login Successful!');
            console.log(data);
        } else {
            console.error('❌ Login Failed!');
            console.error('Status:', response.status);
            console.error('Data:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

(async () => {
    const token = await testRegister();
    if (token) {
        // Wait a bit to ensure async operations complete
        await new Promise(r => setTimeout(r, 1000));
        await testLogin(uniqueEmail, 'password123');
    }
})();
