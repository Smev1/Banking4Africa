// Function to validate username and password
function validateUser(username, password) {
    return db.collection('accounts').doc(username).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            return data.password === password;
        }
        return false;
    });
}

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

    validateUser(username, password).then(isValid => {
        if (isValid) {
            // Get user data from Firestore
            db.collection('accounts').doc(username).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    userDisplay.textContent = username;
                    balanceDisplay.textContent = data.balance;

                    // Display transaction history
                    transactionList.innerHTML = '';
                    data.transactions.forEach(transaction => {
                        const li = document.createElement('li');
                        li.textContent = transaction;
                        transactionList.appendChild(li);
                    });

                    loginContainer.classList.add('hidden');
                    mainContainer.classList.remove('hidden');
                    adminContainer.classList.toggle('hidden', username !== 'user1');
                }
            });
        } else {
            loginError.classList.remove('hidden');
        }
    }).catch(error => {
        console.error("Error validating user: ", error);
        loginError.classList.remove('hidden');
    });
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

    if (predefinedAccounts.hasOwnProperty(adminUsername) && !isNaN(newBalance) && newBalance >= 0 && balanceReason) {
        const transactionRecord = `Updated balance: $${newBalance}. Reason: ${balanceReason}`;

        db.collection('accounts').doc(adminUsername).update({
            balance: newBalance,
            transactions: firebase.firestore.FieldValue.arrayUnion(transactionRecord)
        }).then(() => {
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
        }).catch(error => {
            console.error("Error updating balance: ", error);
            adminError.classList.remove('hidden');
        });
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

    if (predefinedAccounts.hasOwnProperty(fromUsername) && predefinedAccounts.hasOwnProperty(toUsername) && 
        !isNaN(transferAmount) && transferAmount > 0 && transferReason) {
        
        db.collection('accounts').doc(fromUsername).get().then(fromDoc => {
            if (fromDoc.exists && fromDoc.data().balance >= transferAmount) {
                db.collection('accounts').doc(toUsername).get().then(toDoc => {
                    if (toDoc.exists) {
                        const fromTransaction = `Transferred $${transferAmount} to ${toUsername}. Reason: ${transferReason}`;
                        const toTransaction = `Received $${transferAmount} from ${fromUsername}. Reason: ${transferReason}`;

                        db.collection('accounts').doc(fromUsername).update({
                            balance: fromDoc.data().balance - transferAmount,
                            transactions: firebase.firestore.FieldValue.arrayUnion(fromTransaction)
                        }).then(() => {
                            db.collection('accounts').doc(toUsername).update({
                                balance: toDoc.data().balance + transferAmount,
                                transactions: firebase.firestore.FieldValue.arrayUnion(toTransaction)
                            }).then(() => {
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
                            }).catch(error => {
                                console.error("Error updating recipient balance: ", error);
                                transferError.classList.remove('hidden');
                            });
                        }).catch(error => {
                            console.error("Error updating sender balance: ", error);
                            transferError.classList.remove('hidden');
                        });
                    } else {
                        transferError.classList.remove('hidden');
                    }
                });
            } else {
                transferError.classList.remove('hidden');
            }
        });
    } else {
        transferError.classList.remove('hidden');
    }
}