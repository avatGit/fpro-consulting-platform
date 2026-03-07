// Script de test pour l'API d'authentification
// Usage: node test-auth-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Données de test
const testCompany = {
    name: 'Test Company ' + Date.now(),
    email: `test${Date.now()}@company.com`,
    phone: '+33612345678',
    address: '123 Test Street',
    city: 'Paris'
};

const testUser = {
    email: `user${Date.now()}@test.com`,
    password: 'Test123456!',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+33612345679'
};

let authToken = '';
let refreshToken = '';

// Test 1: Inscription
async function testRegister() {
    log('cyan', '\n📝 TEST 1: Inscription d\'un nouvel utilisateur');
    log('blue', '━'.repeat(60));

    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            company: testCompany,
            user: testUser
        });

        if (response.status === 201 && response.data.success) {
            log('green', '✅ Inscription réussie');
            console.log('   User ID:', response.data.data.user.id);
            console.log('   Email:', response.data.data.user.email);
            console.log('   Role:', response.data.data.user.role);
            console.log('   Company:', response.data.data.user.company.name);

            authToken = response.data.data.token;
            refreshToken = response.data.data.refreshToken;

            log('green', '   Token reçu: ' + authToken.substring(0, 20) + '...');
            return true;
        } else {
            log('red', '❌ Échec: Réponse inattendue');
            console.log(response.data);
            return false;
        }
    } catch (error) {
        log('red', '❌ Erreur lors de l\'inscription');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message || error.response.data);
        } else {
            console.log('   Erreur:', error.message);
        }
        return false;
    }
}

// Test 2: Connexion
async function testLogin() {
    log('cyan', '\n🔐 TEST 2: Connexion avec les identifiants');
    log('blue', '━'.repeat(60));

    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (response.status === 200 && response.data.success) {
            log('green', '✅ Connexion réussie');
            console.log('   User:', response.data.data.user.first_name, response.data.data.user.last_name);
            console.log('   Email:', response.data.data.user.email);
            console.log('   Role:', response.data.data.user.role);

            authToken = response.data.data.token;
            log('green', '   Nouveau token reçu');
            return true;
        } else {
            log('red', '❌ Échec: Réponse inattendue');
            console.log(response.data);
            return false;
        }
    } catch (error) {
        log('red', '❌ Erreur lors de la connexion');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message || error.response.data);
        } else {
            console.log('   Erreur:', error.message);
        }
        return false;
    }
}

// Test 3: Récupérer le profil
async function testGetProfile() {
    log('cyan', '\n👤 TEST 3: Récupération du profil utilisateur');
    log('blue', '━'.repeat(60));

    try {
        const response = await axios.get(`${BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 200 && response.data.success) {
            log('green', '✅ Profil récupéré avec succès');
            console.log('   Nom complet:', response.data.data.first_name, response.data.data.last_name);
            console.log('   Email:', response.data.data.email);
            console.log('   Téléphone:', response.data.data.phone);
            console.log('   Entreprise:', response.data.data.company?.name);
            return true;
        } else {
            log('red', '❌ Échec: Réponse inattendue');
            console.log(response.data);
            return false;
        }
    } catch (error) {
        log('red', '❌ Erreur lors de la récupération du profil');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message || error.response.data);
        } else {
            console.log('   Erreur:', error.message);
        }
        return false;
    }
}

// Test 4: Mauvais identifiants
async function testWrongCredentials() {
    log('cyan', '\n🚫 TEST 4: Connexion avec mauvais identifiants');
    log('blue', '━'.repeat(60));

    try {
        await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: 'WrongPassword123!'
        });

        log('red', '❌ Échec: La connexion aurait dû échouer');
        return false;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            log('green', '✅ Erreur 401 correctement retournée');
            console.log('   Message:', error.response.data.message);
            return true;
        } else {
            log('red', '❌ Erreur inattendue');
            console.log('   Erreur:', error.message);
            return false;
        }
    }
}

// Test 5: Accès sans token
async function testUnauthorizedAccess() {
    log('cyan', '\n🔒 TEST 5: Accès au profil sans token');
    log('blue', '━'.repeat(60));

    try {
        await axios.get(`${BASE_URL}/profile`);

        log('red', '❌ Échec: L\'accès aurait dû être refusé');
        return false;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            log('green', '✅ Accès refusé correctement (401)');
            console.log('   Message:', error.response.data.message || 'Non autorisé');
            return true;
        } else {
            log('red', '❌ Erreur inattendue');
            console.log('   Erreur:', error.message);
            return false;
        }
    }
}

// Test 6: Refresh token
async function testRefreshToken() {
    log('cyan', '\n🔄 TEST 6: Rafraîchissement du token');
    log('blue', '━'.repeat(60));

    try {
        const response = await axios.post(`${BASE_URL}/refresh-token`, {
            refreshToken: refreshToken
        });

        if (response.status === 200 && response.data.success) {
            log('green', '✅ Token rafraîchi avec succès');
            console.log('   Nouveau token reçu');
            console.log('   Nouveau refresh token reçu');
            return true;
        } else {
            log('red', '❌ Échec: Réponse inattendue');
            console.log(response.data);
            return false;
        }
    } catch (error) {
        log('red', '❌ Erreur lors du rafraîchissement');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message || error.response.data);
        } else {
            console.log('   Erreur:', error.message);
        }
        return false;
    }
}

// Exécuter tous les tests
async function runAllTests() {
    log('yellow', '\n' + '═'.repeat(60));
    log('yellow', '🧪 DÉMARRAGE DES TESTS D\'AUTHENTIFICATION');
    log('yellow', '═'.repeat(60));

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Vérifier que le serveur est accessible
    try {
        await axios.get('http://localhost:5000');
    } catch (error) {
        log('red', '\n❌ ERREUR: Le serveur backend n\'est pas accessible sur http://localhost:5000');
        log('yellow', '   Assurez-vous que le serveur est démarré avec: npm run dev');
        process.exit(1);
    }

    const tests = [
        { name: 'Inscription', fn: testRegister },
        { name: 'Connexion', fn: testLogin },
        { name: 'Profil', fn: testGetProfile },
        { name: 'Mauvais identifiants', fn: testWrongCredentials },
        { name: 'Accès non autorisé', fn: testUnauthorizedAccess },
        { name: 'Refresh token', fn: testRefreshToken }
    ];

    for (const test of tests) {
        results.total++;
        const passed = await test.fn();
        if (passed) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Résumé
    log('yellow', '\n' + '═'.repeat(60));
    log('yellow', '📊 RÉSUMÉ DES TESTS');
    log('yellow', '═'.repeat(60));
    console.log(`   Total: ${results.total}`);
    log('green', `   Réussis: ${results.passed}`);
    if (results.failed > 0) {
        log('red', `   Échoués: ${results.failed}`);
    } else {
        log('green', `   Échoués: ${results.failed}`);
    }

    if (results.failed === 0) {
        log('green', '\n🎉 TOUS LES TESTS SONT PASSÉS !');
    } else {
        log('red', '\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    }
    log('yellow', '═'.repeat(60) + '\n');
}

// Lancer les tests
runAllTests().catch(error => {
    log('red', '\n❌ Erreur fatale:');
    console.error(error);
    process.exit(1);
});
