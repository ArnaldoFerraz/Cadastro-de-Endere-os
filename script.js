import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* FIREBASE CONFIG */

const firebaseConfig = {
    apiKey: "AIzaSyDuzHhnGNZDfjdJlfQMlqU76FY4Xp8ZnQE",
    authDomain: "enderecos-ea50e.firebaseapp.com",
    projectId: "enderecos-ea50e",
    storageBucket: "enderecos-ea50e.firebasestorage.app",
    messagingSenderId: "530757930448",
    appId: "1:530757930448:web:4a032f48c32291bbdf3dd5",
    measurementId: "G-6DNTTZED64"
};

/* INIT */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ELEMENTOS */

const form = document.getElementById("formCadastro");
const lista = document.getElementById("listaClientes");

let editId = null;

/* LISTAR */

async function carregar() {

    lista.innerHTML = "<p>Carregando...</p>";

    try {

        const snap = await getDocs(collection(db, "locais"));

        lista.innerHTML = "";

        if (snap.empty) {
            lista.innerHTML = `<p class="vazio">Nenhum endereço cadastrado.</p>`;
            return;
        }

        snap.forEach((docItem) => {

            const c = docItem.data();

            const nome = (c.nome || "").replace(/'/g, "\\'");
            const endereco = (c.endereco || "").replace(/'/g, "\\'");

            lista.innerHTML += `
                <div class="cliente">

                    <h3>${c.nome || "Sem nome"}</h3>
                    <p>${c.endereco || "Sem endereço"}</p>

                    <div class="acoes">

                        <button onclick="editar('${docItem.id}', '${nome}', '${endereco}')">
                            Editar
                        </button>

                        <button onclick="excluir('${docItem.id}')">
                            Excluir
                        </button>

                        <button onclick="mapa(${c.latitude ?? 0}, ${c.longitude ?? 0})">
                            Mapa
                        </button>

                    </div>

                </div>
            `;
        });

    } catch (erro) {

        console.error(erro);

        lista.innerHTML = `<p>Erro ao carregar Firebase.</p>`;
    }
}

/* CADASTRAR / EDITAR */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const endereco = document.getElementById("endereco").value.trim();

    if (!nome || !endereco) {
        alert("Preencha todos os campos.");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {

            try {

                const data = {
                    nome,
                    endereco,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };

                if (editId) {

                    await updateDoc(doc(db, "locais", editId), data);
                    editId = null;

                } else {

                    await addDoc(collection(db, "locais"), data);
                }

                form.reset();
                carregar();

            } catch (erro) {
                console.error(erro);
                alert("Erro ao salvar no Firebase.");
            }

        },
        (erro) => {
            console.error(erro);
            alert("Permita acesso à localização.");
        }
    );
});

/* EXCLUIR */

window.excluir = async (id) => {

    if (!confirm("Deseja excluir este endereço?")) return;

    try {

        await deleteDoc(doc(db, "locais", id));
        carregar();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao excluir.");
    }
};

/* EDITAR */

window.editar = (id, nome, endereco) => {

    document.getElementById("nome").value = nome;
    document.getElementById("endereco").value = endereco;

    editId = id;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

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

/* INICIAR */

carregar();