// ------- Firebase laden (v9 modular via CDN) -------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ------- Deine Firebase Konfiguration -------
const firebaseConfig = {
  apiKey: "AIzaSyDr9Rpwmyb6CabzD602uq43rf84sJO3Xu8",
  authDomain: "budgetai-77842.firebaseapp.com",
  projectId: "budgetai-77842",
  storageBucket: "budgetai-77842.firebasestorage.app",
  messagingSenderId: "702742240654",
  appId: "1:702742240654:web:93be69888bfbdf24e498df",
  measurementId: "G-PTMSZGRYW4"
};

// ------- Init -------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ------- DOM helpers -------
const $ = (sel) => document.querySelector(sel);
const formatCHF = v => Number(v||0).toLocaleString("de-CH", {style:"currency", currency:"CHF"});

// Sections
const authSection = $("#authSection");
const appSection  = $("#appSection");
const userBadge   = $("#userBadge");
const userEmailEl = $("#userEmail");
const authMsg     = $("#authMsg");

// Auth buttons
$("#signInBtn")?.addEventListener("click", async () => {
  authMsg.textContent = "";
  const email = $("#email").value.trim();
  const pass  = $("#password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    authMsg.textContent = "Login fehlgeschlagen: " + (e?.message || e);
  }
});

$("#signUpBtn")?.addEventListener("click", async () => {
  authMsg.textContent = "";
  const email = $("#email").value.trim();
  const pass  = $("#password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    // Erstinitialisierung der Daten für neue Accounts
    await initProfileDocs(auth.currentUser.uid);
  } catch (e) {
    authMsg.textContent = "Registrierung fehlgeschlagen: " + (e?.message || e);
  }
});

$("#signOutBtn")?.addEventListener("click", () => signOut(auth));

// ------- Firestore Doku-Pfade -------
// Wir speichern pro Nutzer unter users/{uid}/profiles/{wallace|patricia|shared}
const profileRef = (uid, who) => doc(db, "users", uid, "profiles", who);

// Wenn neuer Account: Grundwerte anlegen
async function initProfileDocs(uid){
  const defaults = [
    ["wallace",  {income: 5550, expense: 2360}],
    ["patricia", {income: 5200, expense: 2220}],
    ["shared",   {income: 10750, expense: 4580}]
  ];
  await Promise.all(defaults.map(([id,data]) =>
    setDoc(profileRef(uid,id), data, {merge:true})
  ));
}

// ------- Live-Bindings (Overview) -------
let unsubscribers = [];
function bindOverview(uid){
  // Cleanup vorherige Listener
  unsubscribers.forEach(u => u && u());
  unsubscribers = [];

  const bind = (who, ids) => {
    const unsub = onSnapshot(profileRef(uid, who), snap => {
      const data = snap.data() || {income:0, expense:0};
      $(ids.income).textContent = formatCHF(data.income);
      $(ids.expense).textContent = formatCHF(data.expense);
      const bal = (Number(data.income||0) - Number(data.expense||0));
      const el = $(ids.balance);
      el.textContent = formatCHF(bal);
      el.classList.toggle("pos", bal >= 0);
      el.classList.toggle("neg", bal < 0);

      // Editfelder vorbelegen
      $(ids.inpIncome).value  = data.income ?? 0;
      $(ids.inpExpense).value = data.expense ?? 0;
    });
    unsubscribers.push(unsub);

    // Save Buttons
    $(ids.saveBtn).onclick = async () => {
      const income  = Number($(ids.inpIncome).value || 0);
      const expense = Number($(ids.inpExpense).value || 0);
      await setDoc(profileRef(uid, who), {income, expense}, {merge:true});
    };
  };

  bind("wallace",  { income:"#w-income", expense:"#w-expense", balance:"#w-balance",
                     inpIncome:"#wIncomeInput", inpExpense:"#wExpenseInput", saveBtn:"#wSaveBtn" });

  bind("patricia", { income:"#p-income", expense:"#p-expense", balance:"#p-balance",
                     inpIncome:"#pIncomeInput", inpExpense:"#pExpenseInput", saveBtn:"#pSaveBtn" });

  bind("shared",   { income:"#s-income", expense:"#s-expense", balance:"#s-balance",
                     inpIncome:"#sIncomeInput", inpExpense:"#sExpenseInput", saveBtn:"#sSaveBtn" });
}

// ------- Auth State Handling -------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // UI umschalten
    userEmailEl.textContent = user.email || "";
    userBadge.classList.remove("hidden");
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    // Daten initialisieren falls leer
    await initProfileDocs(user.uid);
    // Live-Übersicht binden
    bindOverview(user.uid);
  } else {
    unsubscribers.forEach(u => u && u());
    userBadge.classList.add("hidden");
    appSection.classList.add("hidden");
    authSection.classList.remove("hidden");
  }
});