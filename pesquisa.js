
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* FIREBASE CONFIG */

const firebaseConfig = {
    apiKey: "AIzaSyDuzHhnGNZDfjdJlfQMlU76FY4Xp8ZnQE",
    authDomain: "enderecos-ea50e.firebaseapp.com",
    projectId: "enderecos-ea50e",
    storageBucket: "enderecos-ea50e.firebasestorage.app",
    messagingSenderId: "530757930448",
    appId: "1:530757930448:web:4a032f48c32291bbdf3dd5",
    measurementId: "G-6DNTTZED64"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ELEMENTOS */

const form = document.getElementById("formPesquisa");
const resultado = document.getElementById("resultadoPesquisa");

/* MAPA */

window.mapa = (lat, lng) => {

    if (!lat || !lng) {
        alert("Localização não disponível.");
        return;
    }

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );
};

/* EXCLUIR */

window.excluir = async (id) => {

    const confirmar = confirm("Deseja excluir este cliente?");

    if (!confirmar) return;

    try {

        await deleteDoc(doc(db, "locais", id));

        alert("Cliente excluído com sucesso!");

        pesquisar();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao excluir cliente.");
    }
};

/* PESQUISA */

async function pesquisar() {

    const termo = document
        .getElementById("pesquisa")
        .value
        .trim()
        .toLowerCase();

    resultado.innerHTML = "<p>Pesquisando...</p>";

    try {

        const snap = await getDocs(collection(db, "locais"));

        resultado.innerHTML = "";

        let achou = false;

        snap.forEach((docItem) => {

            const c = docItem.data();

            const nome = (c.nome || "").toLowerCase();
            const endereco = (c.endereco || "").toLowerCase();

            if (nome.includes(termo) || endereco.includes(termo)) {

                achou = true;

                resultado.innerHTML += `
                    <div class="cliente">

                        <h3>${c.nome}</h3>
                        <p>${c.endereco}</p>

                        <div class="acoes">

                            <button onclick="mapa(${c.latitude}, ${c.longitude})">
                                Mapa
                            </button>

                            <button onclick="excluir('${docItem.id}')"
                                style="background:#ef4444">
                                Excluir
                            </button>

                        </div>

                    </div>
                `;
            }

        });

        if (!achou) {
            resultado.innerHTML = "<p class='vazio'>Nenhum resultado encontrado.</p>";
        }

    } catch (erro) {

        console.error(erro);

        resultado.innerHTML = "<p>Erro ao conectar com o banco de dados.</p>";
    }
}

/* FORM */

form.addEventListener("submit", (e) => {
    e.preventDefault();
    pesquisar();
});

/* CARREGAR INICIAL (opcional) */

pesquisar();