const SHEET_ID = '1M6ZmUli6SWkraVTi_gLazj7fYsOa6NlsjUqRbMEl3fU'; // Replace with your Google Sheet ID
const API_KEY = 'AIzaSyCTLv7w6jZyjA9W6U4zhi16i7UB2rDyksU'; // Replace with your Google Sheets API key
const SHEET_NAME = 'Sheet1'; // Change this to the name of your sheet

// Replace this with your OAuth 2.0 access token
const ACCESS_TOKEN = 'ya29.a0AXooCguFdl6oR2FTnpo00TcYiZSeWc0B9A4wKN_P1B84K0XPQ533lahC76VJ1A70ndU03Ih1kMFZkoF5ner1HeLAhKKXJVgR3t3oKfzJTUZ8aaGFNY5qIMGAZDkzKp1M3sQXTcOmJ0Z3vFr1jzA2rmfllziss5wIpmMZaCgYKAT0SARESFQHGX2MiHHmI8rWIEvNjQ5xvVZ5drw0171';

// Fetch data from Google Sheets
function getSheetData(range, callback) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!${range}?key=${API_KEY}`;
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch sheet data');
        }
        return response.json();
    })
    .then(data => callback(data))
    .catch(error => console.error('Error fetching sheet data:', error));
}

// Update data in Google Sheets
function updateSheetData(range, values, callback) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!${range}?valueInputOption=RAW&key=${API_KEY}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            range: `${SHEET_NAME}!${range}`,
            majorDimension: 'ROWS',
            values: [values],
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(`Failed to update sheet data: ${err.error.message}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Sheet updated successfully:', data);
        if (callback) callback(data);
    })
    .catch(error => {
        console.error('Error updating sheet data:', error);
    });
}

// Handle login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginContainer = document.getElementById('loginContainer');
    const balanceContainer = document.getElementById('balanceContainer');
    const adminContainer = document.getElementById('adminContainer');
    const loginError = document.getElementById('loginError');
    const userDisplay = document.getElementById('user');
    const balanceDisplay = document.getElementById('balance');

    getSheetData('A2:C11', (data) => {
        const rows = data.values || [];
        const account = rows.find(row => row[0] === username);
        if (account && account[1] === password) {
            userDisplay.textContent = username;
            balanceDisplay.textContent = account[2]; // Assuming balance is in the third column
            loginContainer.classList.add('hidden');
            balanceContainer.classList.remove('hidden');
            if (username === 'user1') {
                adminContainer.classList.remove('hidden');
            }
        } else {
            loginError.classList.remove('hidden');
        }
    });
}

// Handle logout
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

// Handle balance update
function updateBalance() {
    const adminUsername = document.getElementById('adminUsername').value;
    const newBalance = parseFloat(document.getElementById('newBalance').value);
    const balanceReason = document.getElementById('balanceReason').value;
    const adminError = document.getElementById('adminError');
    const adminSuccess = document.getElementById('adminSuccess');

    getSheetData('A2:C11', (data) => {
        const rows = data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === adminUsername);
        if (rowIndex >= 0 && !isNaN(newBalance) && newBalance >= 0 && balanceReason) {
            const range = `C${rowIndex + 2}`;
            updateSheetData(range, [newBalance], () => {
                console.log(`Balance updated for ${adminUsername}: ${newBalance}. Reason: ${balanceReason}`);
                adminError.classList.add('hidden');
                adminSuccess.classList.remove('hidden');
                setTimeout(() => {
                    adminSuccess.classList.add('hidden');
                }, 2000);
            });
        } else {
            adminError.classList.remove('hidden');
        }
    });
}

// Handle money transfer
function transferMoney() {
    const fromUsername = document.getElementById('fromUsername').value;
    const toUsername = document.getElementById('toUsername').value;
    const transferAmount = parseFloat(document.getElementById('transferAmount').value);
    const transferReason = document.getElementById('transferReason').value;
    const transferError = document.getElementById('transferError');
    const transferSuccess = document.getElementById('transferSuccess');

    getSheetData('A2:C11', (data) => {
        const rows = data.values || [];
        const fromAccount = rows.find(row => row[0] === fromUsername);
        const toAccount = rows.find(row => row[0] === toUsername);
        if (fromAccount && toAccount && !isNaN(transferAmount) && transferAmount > 0 && transferReason && parseFloat(fromAccount[2]) >= transferAmount) {
            const fromBalanceRange = `C${rows.indexOf(fromAccount) + 2}`;
            const toBalanceRange = `C${rows.indexOf(toAccount) + 2}`;
            updateSheetData(fromBalanceRange, [parseFloat(fromAccount[2]) - transferAmount], () => {
                updateSheetData(toBalanceRange, [parseFloat(toAccount[2]) + transferAmount], () => {
                    console.log(`Transferred ${transferAmount} from ${fromUsername} to ${toUsername}. Reason: ${transferReason}`);
                    transferError.classList.add('hidden');
                    transferSuccess.classList.remove('hidden');
                    setTimeout(() => {
                        transferSuccess.classList.add('hidden');
                    }, 2000);
                });
            });
        } else {
            transferError.classList.remove('hidden');
        }
    });
}
