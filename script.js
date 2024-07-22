// Predefined accounts with passwords and balances
const accounts = {
    'user1': {password: 'pass1', balance: 1000},
    'user2': {password: 'pass2', balance: 2000},
    'user3': {password: 'pass3', balance: 3000},
    'user4': {password: 'pass4', balance: 4000},
    'user5': {password: 'pass5', balance: 5000},
    'user6': {password: 'pass6', balance: 6000},
    'user7': {password: 'pass7', balance: 7000},
    'user8': {password: 'pass8', balance: 8000},
    'user9': {password: 'pass9', balance: 9000},
    'user10': {password: 'pass10', balance: 10000}
};

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginContainer = document.getElementById('loginContainer');
    const balanceContainer = document.getElementById('balanceContainer');
    const adminContainer = document.getElementById('adminContainer');
    const loginError = document.getElementById('loginError');
    const userDisplay = document.getElementById('user');
    const balanceDisplay = document.getElementById('balance');

    if (accounts.hasOwnProperty(username) && accounts[username].password === password) {
        userDisplay.textContent = username;
        balanceDisplay.textContent = accounts[username].balance;
        loginContainer.classList.add('hidden');
        balanceContainer.classList.remove('hidden');
        if (username === 'user1') {
            adminContainer.classList.remove('hidden');
        }
    } else {
        loginError.classList.remove('hidden');
    }
}

function logout() {
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('balanceContainer').classList.add('hidden');
    document.getElementById('adminContainer').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('adminError').classList.add('hidden');
    document.getElementById('adminSuccess').classList.add('hidden');
    document.getElementById('transferError').classList.add('hidden');
    document.getElementById('transferSuccess').classList.add('hidden');
}

function updateBalance() {
    const adminUsername = document.getElementById('adminUsername').value;
    const newBalance = parseFloat(document.getElementById('newBalance').value);
    const balanceReason = document.getElementById('balanceReason').value;
    const adminError = document.getElementById('adminError');
    const adminSuccess = document.getElementById('adminSuccess');

    if (accounts.hasOwnProperty(adminUsername) && !isNaN(newBalance) && newBalance >= 0 && balanceReason) {
        accounts[adminUsername].balance = newBalance;
        console.log(`Balance updated for ${adminUsername}: ${newBalance}. Reason: ${balanceReason}`);
        adminError.classList.add('hidden');
        adminSuccess.classList.remove('hidden');
        setTimeout(() => {
            adminSuccess.classList.add('hidden');
        }, 2000);
    } else {
        adminError.classList.remove('hidden');
    }
}

function transferMoney() {
    const fromUsername = document.getElementById('fromUsername').value;
    const toUsername = document.getElementById('toUsername').value;
    const transferAmount = parseFloat(document.getElementById('transferAmount').value);
    const transferReason = document.getElementById('transferReason').value;
    const transferError = document.getElementById('transferError');
    const transferSuccess = document.getElementById('transferSuccess');

    if (accounts.hasOwnProperty(fromUsername) && accounts.hasOwnProperty(toUsername) && 
        !isNaN(transferAmount) && transferAmount > 0 && transferReason && accounts[fromUsername].balance >= transferAmount) {
        accounts[fromUsername].balance -= transferAmount;
        accounts[toUsername].balance += transferAmount;
        console.log(`Transferred ${transferAmount} from ${fromUsername} to ${toUsername}. Reason: ${transferReason}`);
        transferError.classList.add('hidden');
        transferSuccess.classList.remove('hidden');
        setTimeout(() => {
            transferSuccess.classList.add('hidden');
        }, 2000);
    } else {
        transferError.classList.remove('hidden');
    }
}
