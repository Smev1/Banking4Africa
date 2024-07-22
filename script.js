// Replace the following config object with your Firebase project's config object
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();

let currentUserDocId = null;

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  db.collection('users').where('username', '==', username).where('password', '==', password).get()
    .then(querySnapshot => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const userData = doc.data();
          currentUserDocId = doc.id; // Store the document ID of the logged-in user
          document.getElementById('loginContainer').classList.add('hidden');
          document.getElementById('mainContainer').classList.remove('hidden');
          document.getElementById('user').innerText = userData.username;
          setupRealtimeListener(currentUserDocId);
        });
      } else {
        document.getElementById('loginError').classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Error getting documents: ', error);
    });
}

function setupRealtimeListener(docId) {
  db.collection('users').doc(docId).onSnapshot((doc) => {
    const userData = doc.data();
    document.getElementById('balance').innerText = userData.balance;
    loadTransactions(userData.transactions);
  });
}

function loadTransactions(transactions) {
  const transactionList = document.getElementById('transactionList');
  transactionList.innerHTML = '';
  transactions.forEach(transaction => {
    const li = document.createElement('li');
    li.innerText = `${transaction.date}: ${transaction.description} - $${transaction.amount}`;
    transactionList.appendChild(li);
  });
}

function logout() {
  document.getElementById('mainContainer').classList.add('hidden');
  document.getElementById('loginContainer').classList.remove('hidden');
}

function updateBalance() {
  const adminUsername = document.getElementById('adminUsername').value;
  const newBalance = parseFloat(document.getElementById('newBalance').value);

  db.collection('users').where('username', '==', adminUsername).get()
    .then(querySnapshot => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          db.collection('users').doc(doc.id).update({ balance: newBalance })
            .then(() => {
              if (currentUserDocId === doc.id) {
                document.getElementById('balance').innerText = newBalance;
              }
            });
        });
      }
    })
    .catch(error => {
      console.error('Error updating balance: ', error);
    });
}
