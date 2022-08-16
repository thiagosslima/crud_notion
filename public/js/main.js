const dadosEl = document.querySelector('#dados');
const loadingEl = document.querySelector('#loading');

let loading = false;

const getDadosFromBackEnd = async() => {
    loading = true;
    const res = await fetch('http://localhost:5000/dataWithCpf');
    const data = await res.json();
    loading = false;
    return data;
}

const addDadosToDom = async() => {
    const dados = await getDadosFromBackEnd();

    if(!loading){
        loadingEl.innerHTML = '';
    }

    dados.forEach(data => {
        const div  = document.createElement('div');
        div.className = 'Dados';
        div.innerHTML = `
            <h3>${data.cpf}</h3>
            <ul>
                <li><strong>Nome: </strong> ${data.nome}</li>
            </ul>`;
        
        dadosEl.appendChild(div);

    });
}

addDadosToDom();