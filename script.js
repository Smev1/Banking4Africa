// Initialize Supabase
const supabaseUrl = 'https://qrubbbjfdctqmswdkllw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydWJiYmpmZGN0cW1zd2RrbGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE1OTcxMTIsImV4cCI6MjAzNzE3MzExMn0.N50590RDksooTjVgfRhGMShH4DtKJZg0bz80GeWNqbA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Function to handle user login
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

    // Fetch the user data from Supabase
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !data || data.password !== password) {
        loginError.classList.remove('hidden');
        return;
    }

    userDisplay.textContent = username;
    balanceDisplay.textContent = data.balance;
    loginContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    adminContainer.classList.toggle('hidden', username !== 'user1');
    
    // Clear previous transactions and display current ones
    transactionList.innerHTML = '';
    data.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = transaction;
        transactionList.appendChild(li);
    });
}

// Function to handle user logout
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

// Function to update user balance (Admin Panel)
async function updateBalance() {
    const adminUsername = document.getElementById('adminUsername').value;
    const newBalance = parseFloat(document.getElementById('newBalance').value);
    const balanceReason = document.getElementById('balanceReason').value;
    const adminError = document.getElementById('adminError');
    const adminSuccess = document.getElementById('adminSuccess');

    if (!isNaN(newBalance) && newBalance >= 0 && balanceReason) {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('username', adminUsername)
            .single();

        if (error || !data) {
            adminError.classList.remove('hidden');
            return;
        }

        const updatedTransactions = [...data.transactions, `Updated balance: $${newBalance}. Reason: ${balanceReason}`];

        const { error: updateError } = await supabase
            .from('accounts')
            .update({ 
                balance: newBalance,
                transactions: updatedTransactions
            })
            .eq('username', adminUsername);

        if (updateError) {
            adminError.classList.remove('hidden');
            return;
        }

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

// Function to handle money transfer between users
async function transferMoney() {
    const fromUsername = document.getElementById('fromUsername').value;
    const toUsername = document.getElementById('toUsername').value;
    const transferAmount = parseFloat(document.getElementById('transferAmount').value);
    const transferReason = document.getElementById('transferReason').value;
    const transferError = document.getElementById('transferError');
    const transferSuccess = document.getElementById('transferSuccess');

    if (!isNaN(transferAmount) && transferAmount > 0 && transferReason) {
        const { data: fromData, error: fromError } = await supabase
            .from('accounts')
            .select('*')
            .eq('username', fromUsername)
            .single();
        const { data: toData, error: toError } = await supabase
            .from('accounts')
            .select('*')
            .eq('username', toUsername)
            .single();

        if (fromError || toError || !fromData || !toData || fromData.balance < transferAmount) {
            transferError.classList.remove('hidden');
            return;
        }

        const updatedFromTransactions = [...fromData.transactions, `Transferred $${transferAmount} to ${toUsername}. Reason: ${transferReason}`];
        const updatedToTransactions = [...toData.transactions, `Received $${transferAmount} from ${fromUsername}. Reason: ${transferReason}`];

        const { error: updateFromError } = await supabase
            .from('accounts')
            .update({ 
                balance: fromData.balance - transferAmount,
                transactions: updatedFromTransactions
            })
            .eq('username', fromUsername);

        const { error: updateToError } = await supabase
            .from('accounts')
            .update({ 
                balance: toData.balance + transferAmount,
                transactions: updatedToTransactions
            })
            .eq('username', toUsername);

        if (updateFromError || updateToError) {
            transferError.classList.remove('hidden');
            return;
        }

        console.log(`Transferred $${transferAmount} from ${fromUsername} to ${toUsername}. Reason: ${transferReason}`);

        // Update transaction list for current users if logged in
        const currentUser = document.getElementById('user').textContent;
        if (currentUser === fromUsername) {
            const transactionList = document.getElementById('transactionList');
            const li = document.createElement('li');
            li.textContent = `Transferred $${transferAmount} to ${toUsername}. Reason: ${transferReason}`;
            transactionList.appendChild(li);
        } else if (currentUser === toUsername) {
            const transactionList = document.getElementById('transactionList');
            const li = document.createElement('li');
            li.textContent = `Received $${transferAmount} from ${fromUsername}. Reason: ${transferReason}`;
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
