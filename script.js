// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAF0a7d1FRmwSm9n8u1N_T4ceDxMOAFy5k",
  authDomain: "shops-dd618.firebaseapp.com",
  databaseURL: "https://shops-dd618-default-rtdb.firebaseio.com",
  projectId: "shops-dd618",
  storageBucket: "shops-dd618.appspot.com",
  messagingSenderId: "552179618233",
  appId: "1:552179618233:web:65d99c4a837f4d201fa668",
  measurementId: "G-33YYS23DFC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Existing accounts data (used only for comparison during login, no passwords stored in Firestore)
const accounts = {
    'user1': { password: 'pass1' },
    'user2': { password: 'pass2' },
    'user3': { password: 'pass3' },
    'user4': { password: 'pass4' },
    'user5': { password: 'pass5' },
    'user6': { password: 'pass6' },
    'user7': { password: 'pass7' },
    'user8': { password: 'pass8' },
    'user9': { password: 'pass9' },
    'user10': { password: 'pass10' }
};

async function login() {
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
        const userDoc = await db.collection('accounts').doc(username).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            userDisplay.textContent = username;
            balanceDisplay.textContent = userData.balance;
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            adminContainer.classList.toggle('hidden', username !== 'user1');
            
            // Clear previous transactions and display current ones
            transactionList.innerHTML = '';
            userData.transactions.forEach(transaction => {
                const li = document.createElement('li');
                li.textContent = transaction;
                transactionList.appendChild(li);
            });
        } else {
            loginError.classList.remove('hidden');
        }
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

async function updateBalance() {
    const adminUsername = document.getElementById('adminUsername').value;
    const newBalance = parseFloat(document.getElementById('newBalance').value);
    const balanceReason = document.getElementById('balanceReason').value;
    const adminError = document.getElementById('adminError');
    const adminSuccess = document.getElementById('adminSuccess');

    if (accounts.hasOwnProperty(adminUsername) && !isNaN(newBalance) && newBalance >= 0 && balanceReason) {
        const userDocRef = db.collection('accounts').doc(adminUsername);
        await userDocRef.update({
            balance: newBalance,
            transactions: firebase.firestore.FieldValue.arrayUnion(`Updated balance: $${newBalance}. Reason: ${balanceReason}`)
        });
        
        console.log(`Updated balance: $${newBalance}. Reason: ${balanceReason}`);

        // Update transaction list for the current user if logged in
        const currentUser = document.getElementById('user').textContent;
        if (currentUser === adminUsername) {
            const transactionList = document.getElementById('transactionList');
            const li = document.createElement('li');
            li.textContent = `Updated balance: $${newBalance}. Reason: ${balanceReason}`;
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

async function transferMoney() {
    const fromUsername = document.getElementById('fromUsername').value;
    const toUsername = document.getElementById('toUsername').value;
    const transferAmount = parseFloat(document.getElementById('transferAmount').value);
    const transferReason = document.getElementById('transferReason').value;
    const transferError = document.getElementById('transferError');
    const transferSuccess = document.getElementById('transferSuccess');

    if (accounts.hasOwnProperty(fromUsername) && accounts.hasOwnProperty(toUsername) && 
        !isNaN(transferAmount) && transferAmount > 0 && transferReason) {

        const fromUserDocRef = db.collection('accounts').doc(fromUsername);
        const toUserDocRef = db.collection('accounts').doc(toUsername);

        await db.runTransaction(async (transaction) => {
            const fromUserDoc = await transaction.get(fromUserDocRef);
            const toUserDoc = await transaction.get(toUserDocRef);

            if (!fromUserDoc.exists || !toUserDoc.exists) {
                throw new Error('User does not exist');
            }

            const fromUserData = fromUserDoc.data();
            const toUserData = toUserDoc.data();

            if (fromUserData.balance < transferAmount) {
                throw new Error('Insufficient funds');
            }

            transaction.update(fromUserDocRef, {
                balance: fromUserData.balance - transferAmount,
                transactions: firebase.firestore.FieldValue.arrayUnion(`Sent $${transferAmount} to ${toUsername}. Reason: ${transferReason}`)
            });

            transaction.update(toUserDocRef, {
                balance: toUserData.balance + transferAmount,
                transactions: firebase.firestore.FieldValue.arrayUnion(`Received $${transferAmount} from ${fromUsername}. Reason: ${transferReason}`)
            });
        });

        // Update transaction list for the current user if logged in
        const currentUser = document.getElementById('user').textContent;
        if (currentUser === fromUsername || currentUser === toUsername) {
            const transactionList = document.getElementById('transactionList');
            const li = document.createElement('li');
            li.textContent = `Sent $${transferAmount} to ${toUsername}. Reason: ${transferReason}`;
            if (currentUser === toUsername) {
                li.textContent = `Received $${transferAmount} from ${fromUsername}. Reason: ${transferReason}`;
            }
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
