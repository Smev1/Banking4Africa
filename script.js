// Predefined accounts with passwords, balances, and transactions
const accounts = {
    'user1': {password: 'pass1', balance: 1000, transactions: []},
    'user2': {password: 'pass2', balance: 2000, transactions: []},
    'user3': {password: 'pass3', balance: 3000, transactions: []},
    'user4': {password: 'pass4', balance: 4000, transactions: []},
    'user5': {password: 'pass5', balance: 5000, transactions: []},
    'user6': {password: 'pass6', balance: 6000, transactions: []},
    'user7': {password: 'pass7', balance: 7000, transactions: []},
    'user8': {password: 'pass8', balance: 8000, transactions: []},
    'user9': {password: 'pass9', balance: 9000, transactions: []},
    'user10': {password: 'pass10', balance: 10000, transactions: []}
};

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    const adminContainer = document.getElementById('adminContainer');
    const loginError = document.getElementById('loginError');
    const userDisplay = document.getElementById('user');
    const balanceDisplay = document.getElementById('balance');
    const transactionList = document.getElementById('transactionList');

    if (accounts.hasOwnProperty(username) && accounts[username].password === password) {
        userDisplay.textContent = username;
        balanceDisplay.textContent = accounts[username].balance;
        loginContainer.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        adminContainer.classList.toggle('hidden', username !== 'user1');
        
        // Clear previous transactions and display current ones
        transactionList.innerHTML = '';
        accounts[username].transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.textContent = transaction;
            transactionList.appendChild(li);
        });
    } else {
        loginError.classList.remove('hidden');
    }
}

function logout() {
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('mainContainer').classList.add('hidden');
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
        const transactionRecord = `Updated balance: $${newBalance}. Reason: ${balanceReason}`;
        accounts[adminUsername].transactions.push(transactionRecord);
        console.log(transactionRecord);
        
        // Update transaction list for the current user if logged in
        const currentUser = document.getElementById('user').textContent;
        if (currentUser === adminUsername) {
            const transactionList = document.getElementById('transactionList');
            const li = document.createElement('li');
            li.textContent = transactionRecord;
            transactionList.appendChild(li);
        }

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
        
        const fromTransaction = `Transferred $${transferAmount} to ${toUsername}. Reason: ${transferReason}`;
        const toTransaction = `Received $${transferAmount} from ${fromUsername}. Reason: ${transferReason}`;
        
        accounts[fromUsername].transactions.push(fromTransaction);
        accounts[toUsername].transactions.push(toTransaction);
        
        console.log(fromTransaction);
        console.log(toTransaction);

        // Update transaction list for current users if logged in
        const currentUser = document.getElementById('user').textContent;
        if (currentUser === fromUsername || currentUser === toUsername) {
            const transactionList = document.getElementById('transactionList');
            const li = document.createElement('li');
            li.textContent = fromTransaction;
            transactionList.appendChild(li);
        }

        transferError.classList.add('hidden');
        transferSuccess.classList.remove('hidden');
        setTimeout(() => {
            transferSuccess.classList.add('hidden');
        }, 2000);
    } else {
        transferError.classList.remove('hidden');
    }
}
