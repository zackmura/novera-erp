const VERSAO_ATUAL_SISTEMA = "8.9.0";
const API_NOVERA = "https://bdfernando.alwaysdata.net/api";

let TOKEN_ONIONSYS = localStorage.getItem('novera_onionsys_key') || "";
let KEY_IMGBB = localStorage.getItem('novera_imgbb_key') || "";

// 🌙 MODO ESCURO — o padrão de TODO MUNDO é o claro (identidade Novera).
// O escuro só liga pra quem escolher no botão 🌙 do topo, e a escolha fica salva no aparelho.
function temaEscuroAtivo() {
    return localStorage.getItem('novera_tema') === 'dark';
}

function aplicarTemaSalvo() {
    const escuro = temaEscuroAtivo();
    document.documentElement.classList.toggle('tema-escuro', escuro);
    const btn = document.getElementById('btn-modo-escuro');
    if (btn) btn.innerText = escuro ? '☀️' : '🌙';
}
aplicarTemaSalvo();

function alternarModoEscuro() {
    localStorage.setItem('novera_tema', temaEscuroAtivo() ? 'light' : 'dark');
    aplicarTemaSalvo();
}

document.addEventListener('DOMContentLoaded', aplicarTemaSalvo);

// ==========================================
// 🎨 IDENTIDADE VISUAL (Degrau 1 do white-label)
// Nome, logo e paleta configuráveis pela Diretoria em Parâmetros Globais.
// Tudo vive na tabela de configurações — nenhuma tabela nova.
// ==========================================
const IDENTIDADE_PADRAO = {
    marca_nome: 'Novera Scent',
    marca_logo_url: '',
    cor_primaria: '#b87c96',
    cor_primaria_escura: '#966178',
    cor_fundo_claro: '#fdfbfb',
    cor_fundo_escuro: '#1d1522',
    cor_painel_escuro: '#3b3050',
    cor_superficie_escura: '#453a5c'
};

// Mistura a cor com branco (fator 0 a 1) — usada pra derivar tons combinando, sem pedir mais cores
function clarearCor(hex, fator) {
    const h = String(hex || '').replace('#', '');
    if (h.length !== 6) return hex;
    const mix = (i) => Math.round(parseInt(h.substr(i, 2), 16) * (1 - fator) + 255 * fator).toString(16).padStart(2, '0');
    return '#' + mix(0) + mix(2) + mix(4);
}
function corComAlpha(hex, alpha) {
    const h = String(hex || '').replace('#', '');
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.substr(0, 2), 16)}, ${parseInt(h.substr(2, 2), 16)}, ${parseInt(h.substr(4, 2), 16)}, ${alpha})`;
}

function aplicarIdentidadeVisual(valores) {
    const v = { ...IDENTIDADE_PADRAO };
    Object.keys(IDENTIDADE_PADRAO).forEach(k => { if (valores && valores[k]) v[k] = valores[k]; });

    let estilo = document.getElementById('estilo-identidade');
    if (!estilo) { estilo = document.createElement('style'); estilo.id = 'estilo-identidade'; document.head.appendChild(estilo); }
    estilo.textContent = `
        :root { --primary: ${v.cor_primaria}; --primary-dark: ${v.cor_primaria_escura}; --logo-text: ${clarearCor(v.cor_primaria_escura, 0.15)}; --bg-color: ${v.cor_fundo_claro}; }
        html.tema-escuro { --primary-dark: ${clarearCor(v.cor_primaria_escura, 0.45)}; --shell-bg: ${v.cor_fundo_escuro}; --bg-color: ${clarearCor(v.cor_fundo_escuro, 0.06)}; --card-bg: ${v.cor_painel_escuro}; --shell-sidebar-bg: ${v.cor_painel_escuro}; --shell-more-bg: ${clarearCor(v.cor_painel_escuro, 0.06)}; --shell-nav-bg: ${corComAlpha(v.cor_painel_escuro, 0.97)}; --shell-desktop-bg: ${v.cor_fundo_escuro}; }
        html.tema-escuro .rotulo-card, html.tema-escuro .dash-card, html.tema-escuro input, html.tema-escuro select, html.tema-escuro textarea, html.tema-escuro .sub-nav-container { background: ${v.cor_superficie_escura}; }
        html.tema-escuro input:focus, html.tema-escuro select:focus, html.tema-escuro textarea:focus { background: ${clarearCor(v.cor_superficie_escura, 0.06)}; }
        html.tema-escuro [style*="background:#fff"], html.tema-escuro [style*="background: #fff"],
        html.tema-escuro [style*="background:#ffffff"], html.tema-escuro [style*="background: #ffffff"],
        html.tema-escuro [style*="background-color: #ffffff"], html.tema-escuro [style*="background-color:#fff"] { background: ${v.cor_superficie_escura} !important; }
        html.tema-escuro [style*="background:#fdf5f7"], html.tema-escuro [style*="background: #fdf5f7"],
        html.tema-escuro [style*="background:#fff9e6"], html.tema-escuro [style*="background: #fff9e6"],
        html.tema-escuro [style*="background:#f0f9ff"], html.tema-escuro [style*="background: #f0f9ff"],
        html.tema-escuro [style*="background:#fafafa"], html.tema-escuro [style*="background: #fafafa"],
        html.tema-escuro [style*="background:#f8fafc"], html.tema-escuro [style*="background: #f8fafc"] { background: ${clarearCor(v.cor_superficie_escura, 0.04)} !important; }`;

    // Nome e logo da marca em todo o app
    document.querySelectorAll('.header h1').forEach(h => { h.innerText = v.marca_nome; });
    document.title = `${v.marca_nome} | ERP`;
    document.querySelectorAll('img.logo').forEach(img => { img.src = v.marca_logo_url || 'logo.png'; });

    try { localStorage.setItem('novera_identidade', JSON.stringify(v)); } catch (e) { }
}

// Na abertura, aplica a última identidade conhecida na hora (sem esperar o servidor responder)
try { aplicarIdentidadeVisual(JSON.parse(localStorage.getItem('novera_identidade') || 'null') || {}); } catch (e) { }

function lerIdentidadeDosInputs() {
    const pega = (id, padrao) => { const el = document.getElementById(id); return el && el.value ? el.value : padrao; };
    return {
        marca_nome: String(pega('cfg-marca-nome', IDENTIDADE_PADRAO.marca_nome)).trim() || IDENTIDADE_PADRAO.marca_nome,
        marca_logo_url: String(pega('cfg-marca-logo', '')).trim(),
        cor_primaria: pega('cfg-cor-primaria', IDENTIDADE_PADRAO.cor_primaria),
        cor_primaria_escura: pega('cfg-cor-primaria-escura', IDENTIDADE_PADRAO.cor_primaria_escura),
        cor_fundo_claro: pega('cfg-cor-fundo-claro', IDENTIDADE_PADRAO.cor_fundo_claro),
        cor_fundo_escuro: pega('cfg-cor-fundo-escuro', IDENTIDADE_PADRAO.cor_fundo_escuro),
        cor_painel_escuro: pega('cfg-cor-painel-escuro', IDENTIDADE_PADRAO.cor_painel_escuro),
        cor_superficie_escura: pega('cfg-cor-superficie-escura', IDENTIDADE_PADRAO.cor_superficie_escura)
    };
}

function previewIdentidadeVisual() { aplicarIdentidadeVisual(lerIdentidadeDosInputs()); }

function restaurarIdentidadePadrao() {
    const setar = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setar('cfg-marca-nome', IDENTIDADE_PADRAO.marca_nome);
    setar('cfg-marca-logo', '');
    setar('cfg-cor-primaria', IDENTIDADE_PADRAO.cor_primaria);
    setar('cfg-cor-primaria-escura', IDENTIDADE_PADRAO.cor_primaria_escura);
    setar('cfg-cor-fundo-claro', IDENTIDADE_PADRAO.cor_fundo_claro);
    setar('cfg-cor-fundo-escuro', IDENTIDADE_PADRAO.cor_fundo_escuro);
    setar('cfg-cor-painel-escuro', IDENTIDADE_PADRAO.cor_painel_escuro);
    setar('cfg-cor-superficie-escura', IDENTIDADE_PADRAO.cor_superficie_escura);
    aplicarIdentidadeVisual(IDENTIDADE_PADRAO);
}

// 📸 REGRA DE OURO DAS IMAGENS: recibo, cobrança, etiqueta, QR e catálogo saem SEMPRE no visual
// claro Novera (identidade da marca), não importa o tema do app. A "foto" é tirada de um clone
// da página — aqui tiramos o tema escuro do clone antes do clique.
function removerTemaEscuroDoClone(docClone) {
    try { docClone.documentElement.classList.remove('tema-escuro'); } catch (e) { }
}
if (window.html2canvas) {
    const html2canvasOriginal = window.html2canvas;
    window.html2canvas = (el, opts = {}) => {
        const oncloneOriginal = opts.onclone;
        opts.onclone = (docClone, elClone) => {
            removerTemaEscuroDoClone(docClone);
            if (oncloneOriginal) oncloneOriginal(docClone, elClone);
        };
        return html2canvasOriginal(el, opts);
    };
}

// ==========================================
// 🔄 PWA: ATUALIZAÇÃO AUTOMÁTICA (sem precisar fechar e abrir de novo)
// ==========================================
// Antes disso o service worker nem era registrado — então um app instalado (celular/tablet/PC)
// que ficasse aberto o dia todo nunca puxava o código novo sozinho, só ao fechar e reabrir.
// Agora: registra o worker, verifica por atualização periodicamente e sempre que a pessoa volta
// pro app, e recarrega sozinho assim que uma versão nova estiver pronta — mas só quando ela NÃO
// estiver no meio de algo (reaproveita a mesma checagem do "pausa a sincronização ao editar").
if ('serviceWorker' in navigator) {
    let atualizacaoPendente = false;

    const tentarAplicarAtualizacao = () => {
        if (!atualizacaoPendente) return;
        if (typeof usuarioEstaOcupado === 'function' && usuarioEstaOcupado()) {
            setTimeout(tentarAplicarAtualizacao, 15000); // tenta de novo em breve, sem incomodar
            return;
        }
        window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        atualizacaoPendente = true;
        tentarAplicarAtualizacao();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registro => {
            // Verifica por versão nova ao abrir, ao voltar pro app, e a cada 20 minutos enquanto aberto
            const verificarAgora = () => registro.update().catch(() => {});
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verificarAgora(); });
            setInterval(verificarAgora, 20 * 60 * 1000);
        }).catch(err => console.error('Falha ao registrar o service worker:', err));
    });
}

let rotulosGlobal = [], estoqueGlobal = [], gastosGlobal = [], vendasGlobal = [];
let encomendasGlobal = [], comprasGlobal = [], producaoGlobal = [];
let logsGlobal = [];
let logsRenderizadosAtuais = []; // lista de logs exibida agora na tela, pro clique no card abrir o modal certo
let usuariosGlobal = []; // <--- ADICIONE ESTA AQUI
let bonusComissaoGlobal = []; // bônus de comissão ativos por produto (Estoque Parado)
let descontosProdutoGlobal = []; // 💸 descontos ativos por produto (catálogo + PDF + aviso à equipe)
let sugestoesProducaoGlobal = []; // sugestões de fabricação enviadas pelos vendedores
let clientesGlobal = []; // cadastro de clientes (nome, telefone, aniversário)
let conquistasGlobal = []; // 🏆 sala de troféus permanente (vendedor recebe só as dele)
let visitasCatalogoGlobal = []; // 🔗 acessos ao catálogo online (vendedor: só os dele; admin: equipe toda)
let catalogoLinksGlobal = []; // 🗂️ links de catálogo criados (vendedor: os seus; admin: todos, com liga/desliga)
let diasVendasRecolhidos = new Set(); // quais dias estão recolhidos na lista de Vendas — sobrevive a re-renderizações (sync, filtro, etc.)
let usuarioLogado = ""; 
let usuarioCargo = ""; 
let dadosCarregados = false; 

let chartRGBase = null, chartStatusBase = null;
let estoqueAgrupado = {};
let configuracoesGlobais = {};

// ==========================================
// FUNÇÃO DO CRACHÁ (Segurança JWT)
// ==========================================
const cabecalhoAuth = () => {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (localStorage.getItem('novera_token') || '')
    };
};

function aplicarVersao() {
    document.querySelectorAll('.app-version').forEach(el => el.innerText = "v" + VERSAO_ATUAL_SISTEMA);
    const txtModal = document.getElementById('texto-versao-modal');
    if (txtModal) txtModal.innerText = "Atualização - Versão " + VERSAO_ATUAL_SISTEMA;
}

document.addEventListener('input', function (e) {
    if (e.target.classList.contains('mask-money')) {
        let value = e.target.value.replace(/\D/g, '');
        if (value === "") { e.target.value = ""; return; }
        value = (parseInt(value) / 100).toFixed(2) + '';
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        e.target.value = "R$ " + value;

        if (e.target.id === 'g-valor') calcularTotalGasto();
        if (e.target.id === 'edit-g-valor') calcularEditGasto();
        if (e.target.id === 'mc-valor-unit') calcularTotalCompraModal();
    }
});

function padronizarTexto(texto) { return texto ? String(texto).trim().replace(/\s+/g, ' ').toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase()) : ""; }
const fmt = val => "R$ " + (Number(val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPlanilha = val => "R$ " + (Number(val) || 0).toFixed(2).replace('.', ',');

function parseDinheiro(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    let str = String(val).trim().replace(/R\$\s?/gi, '');
    if (str.includes(',') && str.includes('.')) str = str.replace(/\./g, '').replace(',', '.');
    else if (str.includes(',')) str = str.replace(',', '.');
    return parseFloat(str) || 0;
}

function safeFmt(val) { return fmt(parseDinheiro(val)); }

// Copia texto com plano B: se o navegador bloquear a área de transferência (ex: app aberto como arquivo local), usa o método clássico
function copiarTextoFallback(texto) {
    return new Promise((resolve, reject) => {
        try {
            const ta = document.createElement('textarea');
            ta.value = texto;
            ta.style.position = 'fixed'; ta.style.left = '-9999px'; ta.style.top = '0';
            document.body.appendChild(ta);
            ta.focus(); ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) resolve(); else reject(new Error('execCommand copy falhou'));
        } catch (e) { reject(e); }
    });
}
function copiarTextoSeguro(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(texto).catch(() => copiarTextoFallback(texto));
    }
    return copiarTextoFallback(texto);
}
function dataBR(isoStr) { if (!isoStr) return ""; const p = isoStr.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; }

// Quantos dias faz desde a última entrada de estoque nessa data (null se não houver data registrada)
function diasParadoDesde(dataIso) {
    if (!dataIso) return null;
    const dias = Math.floor((new Date() - new Date(dataIso.split('T')[0] + 'T00:00:00')) / 86400000);
    return (isNaN(dias) || dias < 0) ? null : dias;
}

// Limite (em dias) configurado pela Diretoria em Parâmetros Globais pra considerar um produto "parado"
function limiteDiasParadoConfigurado() { return parseInt(configuracoesGlobais.dias_estoque_parado) || 30; }

// Mostra há quanto tempo aquele local não recebe estoque novo desse produto, colorindo conforme o tempo parado
function badgeIdadeEstoque(dataIso) {
    const dias = diasParadoDesde(dataIso);
    if (dias === null) return '';
    const limite = limiteDiasParadoConfigurado();
    let texto = dias === 0 ? 'hoje' : dias === 1 ? 'há 1d' : dias < 30 ? `há ${dias}d` : `há ${Math.floor(dias / 30)}m`;
    let cor = '#6b7280';
    if (dias >= limite * 2) { cor = '#991b1b'; texto = '🐌 ' + texto; }
    else if (dias >= limite) { cor = '#92400e'; texto = '⏳ ' + texto; }
    return ` <span style="color:${cor}; font-weight:800;">· ${texto}</span>`;
}

function formatarNomeProdutoHtml(nome, tipo) {
    const prod = estoqueGlobal.find(e => e.nome === nome);
    if (prod && prod.codigo) {
        if (tipo === 'cobranca') return `<span style="background:#fff9e6; border:1px solid #fde047; color:#b45309; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:900; margin-right:5px; display:inline-block; transform:translateY(-1px);">${prod.codigo}</span>${nome}`;
        else return `<span style="background:#fdf5f7; border:1px solid #f3d8e2; color:#966178; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:900; margin-right:5px; display:inline-block; transform:translateY(-1px);">${prod.codigo}</span>${nome}`;
    }
    return nome;
}

function formatarNomeProdutoTexto(nome) {
    const prod = estoqueGlobal.find(e => e.nome === nome);
    if (prod && prod.codigo) return `[${prod.codigo}] ${nome}`;
    return nome;
}

function mostrarLoading(m) {
    const syncEl = document.getElementById("sync-status");
    if (syncEl) { syncEl.innerText = "🔄"; syncEl.classList.add('spin-anim'); }
    if (!dadosCarregados) { const l = document.getElementById("global-loader"); if (l) { l.querySelector("p").innerText = m; l.style.display = "flex"; } }
}

function ocultarLoading() {
    const syncEl = document.getElementById("sync-status");
    if (syncEl) { syncEl.classList.remove('spin-anim'); syncEl.innerText = "✔️"; setTimeout(() => { if (syncEl.innerText === "✔️") syncEl.innerText = "☁️"; }, 3000); }
    const l = document.getElementById("global-loader"); if (l) l.style.display = "none";
}

function mostrarAlerta(titulo, texto, tipo) {
    const modal = document.getElementById("custom-modal"); const icone = document.getElementById("modal-icone-alert"); const btnEl = document.getElementById("btn-modal-ok"); const tituloEl = document.getElementById("modal-titulo-alert");
    tituloEl.innerText = titulo; document.getElementById("modal-texto-alert").innerText = texto;
    if (tipo === "success") { icone.innerText = "✨"; tituloEl.style.color = "var(--primary-dark)"; btnEl.style.background = "var(--primary-dark)"; btnEl.style.boxShadow = "0 4px 0 #7a4a5e"; }
    else if (tipo === "warning") { icone.innerText = "⚠️"; tituloEl.style.color = "#D4A373"; btnEl.style.background = "#D4A373"; btnEl.style.boxShadow = "0 4px 0 #bc8f5f"; }
    else { icone.innerText = "❌"; tituloEl.style.color = "#A05252"; btnEl.style.background = "#A05252"; btnEl.style.boxShadow = "0 4px 0 #803f3f"; }
    modal.style.display = "flex"; if ("vibrate" in navigator) navigator.vibrate(50);
}

function abrirConfirmacao(titulo, texto, icone, corHex, sombraHex, textoBtn, callback) {
    document.getElementById('modal-conf-title').innerText = titulo; document.getElementById('modal-conf-title').style.color = corHex; document.getElementById('modal-conf-icon').innerText = icone; document.getElementById('texto-confirmar').innerText = texto;
    const btn = document.getElementById('btn-confirmar-acao'); btn.innerText = textoBtn; btn.style.background = corHex; btn.style.boxShadow = `0 4px 0 ${sombraHex}`;
    btn.onclick = function () { if (callback) callback(); document.getElementById('modal-confirmar').style.display = 'none'; };
    document.getElementById('modal-confirmar').style.display = 'flex';
}

function toggleMaisMenu() {
    const painel = document.getElementById('nav-more-panel');
    const overlay = document.getElementById('nav-more-overlay');
    if (!painel || !overlay) return;
    const abrindo = painel.style.display !== 'flex';
    painel.style.display = abrindo ? 'flex' : 'none';
    overlay.style.display = abrindo ? 'block' : 'none';
}

function fecharMaisMenu() {
    const painel = document.getElementById('nav-more-panel');
    const overlay = document.getElementById('nav-more-overlay');
    if (painel) painel.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

function switchTab(tabId) {
    fecharMaisMenu();
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item, .nav-item-more').forEach(btn => btn.classList.remove('active'));

    // Cão de Guarda: Bloqueia apenas o que é sigiloso. (PAINEL LIBERADO AGORA!)
    if (usuarioCargo !== 'Admin') {
        const abasProibidas = ['rotulos', 'precificar', 'gastos', 'logs', 'usuarios', 'estoqueparado', 'alexa'];
        if (abasProibidas.includes(tabId)) {
            tabId = 'vendas';
        }
    }

    const navBtnTarget = document.getElementById('tab-' + tabId);
    if (navBtnTarget) navBtnTarget.classList.add('active');

    // 👇 AQUI ESTAVA O ERRO! Removi a trava que proibia o Painel de acender a cor
    const navBtn = document.getElementById('nav-' + tabId);
    if (navBtn) navBtn.classList.add('active');

    const navMais = document.getElementById('nav-mais');
    if (navMais) navMais.classList.toggle('active', !!(navBtn && navBtn.classList.contains('nav-item-more')));

    if (tabId === 'dashboard') { setTimeout(() => { renderizarDashboard(); }, 50); }
    if (tabId === 'logs') { renderizarLogs(); }
    if (tabId === 'estoqueparado') { renderizarEstoqueParado(); }
    if (tabId === 'maceracaovendedor') { renderizarMaceracaoVendedor(); }
    if (tabId === 'sugestaoproducao') { popularDatalistProdutosSugestao(); renderizarMinhasSugestoes(); }
    if (tabId === 'encomendas') { renderizarEncomendas(); }
    if (tabId === 'clientes') { renderizarClientes(); }
    if (tabId === 'gastos' && !document.getElementById('g-data').value) { document.getElementById('g-data').valueAsDate = new Date(); document.getElementById('c-data').valueAsDate = new Date(); }
    if (tabId === 'vendas' && !document.getElementById('v-data').value) { document.getElementById('v-data').valueAsDate = new Date(); document.getElementById('e-data').valueAsDate = new Date(); }
}

function toggleVendasTab(tab) {
    const vReg = document.getElementById('vendas-registro-view'), vLot = document.getElementById('vendas-lotes-view');
    const btnReg = document.getElementById('btn-sub-registro'), btnLot = document.getElementById('btn-sub-lotes');
    document.querySelectorAll('.sub-nav-btn', document.getElementById('tab-vendas')).forEach(b => { b.classList.remove('active'); });
    vReg.style.display = 'none'; vLot.style.display = 'none';
    if (tab === 'lotes') { vLot.style.display = 'block'; btnLot.classList.add('active'); } else { vReg.style.display = 'block'; btnReg.classList.add('active'); }
}

function toggleGastosTab(tab) {
    const gDes = document.getElementById('gastos-despesas-view'), gComp = document.getElementById('gastos-compras-view');
    const btnDes = document.getElementById('btn-sub-despesas'), btnComp = document.getElementById('btn-sub-compras');
    document.querySelectorAll('.sub-nav-btn', document.getElementById('tab-gastos')).forEach(b => { b.classList.remove('active'); });
    gDes.style.display = 'none'; gComp.style.display = 'none';
    if (tab === 'despesas') { gDes.style.display = 'block'; btnDes.classList.add('active'); } else { gComp.style.display = 'block'; btnComp.classList.add('active'); }
}

function atualizarDatalistsDinamicos() {
    let sociosSet = new Set(); vendasGlobal.forEach(v => { if (v.socio) sociosSet.add(String(v.socio).trim()) }); gastosGlobal.forEach(g => { if (g.socio) sociosSet.add(String(g.socio).trim()) });
    let sociosHtml = [...sociosSet].sort((a, b) => a.localeCompare(b)).map(s => `<option value="${s}">`).join(''); document.getElementById('lista-socios').innerHTML = sociosHtml; document.getElementById('lista-socios-dinamica').innerHTML = sociosHtml;
    let filtroSocioV = document.getElementById('f-v-socio'); let sVAtual = filtroSocioV.value; filtroSocioV.innerHTML = '<option value="">Todos</option>' + [...sociosSet].sort((a, b) => a.localeCompare(b)).map(s => `<option value="${s}">${s}</option>`).join(''); filtroSocioV.value = sVAtual;
    let filtroSocioG = document.getElementById('f-socio'); let sGAtual = filtroSocioG.value; filtroSocioG.innerHTML = '<option value="">Todos</option>' + [...sociosSet].sort((a, b) => a.localeCompare(b)).map(s => `<option value="${s}">${s}</option>`).join(''); filtroSocioG.value = sGAtual;

    let locaisGastosSet = new Set(); gastosGlobal.forEach(g => { if (g.local) locaisGastosSet.add(String(g.local).trim()) }); let locaisHtml = [...locaisGastosSet].sort((a, b) => a.localeCompare(b)).map(l => `<option value="${l}">`).join(''); document.getElementById('lista-locais').innerHTML = locaisHtml;

    let locaisEstoqueSet = new Set(); estoqueGlobal.forEach(e => { if (e.local) locaisEstoqueSet.add(String(e.local).trim()) }); let locEstHtml = [...locaisEstoqueSet].sort((a, b) => a.localeCompare(b)).map(l => `<option value="${l}">`).join('');
    const dLocal = document.getElementById('lista-locais-estoque'); if (dLocal) dLocal.innerHTML = locEstHtml;

    const filtroLocal = document.getElementById('f-e-local');
    if (filtroLocal) {
        let fAtual = filtroLocal.value;
        filtroLocal.innerHTML = '<option value="">📍 Todos os Locais</option>' + [...locaisEstoqueSet].sort((a, b) => a.localeCompare(b)).map(l => `<option value="${l}">Apenas: ${l}</option>`).join('');
        filtroLocal.value = fAtual;
    }
}

function renderizarNavPorPerfil() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    const isAdmin = (usuarioCargo === 'Admin');

    const itensPrincipais = isAdmin ? [
        ['rotulos', '🏷️', 'Essênc.'],
        ['precificar', '🧪', 'Fábrica'],
        ['gastos', '💸', 'Gastos'],
        ['estoque', '📦', 'Estoque'],
        ['vendas', '🛒', 'Vendas'],
        ['dashboard', '📊', 'Painel'],
    ] : [
        ['vendas', '🛒', 'Vendas'],
        ['estoque', '📦', 'Estoque'],
        ['maceracaovendedor', '⏳', 'Maceração'],
        ['dashboard', '📊', 'Painel'],
    ];
    const itensMais = isAdmin ? [
        ['estoqueparado', '🐌', 'Parado'],
        ['encomendas', '🎁', 'Encomendas'],
        ['clientes', '👥', 'Clientes'],
        ['alexa', '🗣️', 'Alexa'],
    ] : [
        ['encomendas', '🎁', 'Encomendas'],
        ['clientes', '👥', 'Clientes'],
        ['sugestaoproducao', '💡', 'Sugerir'],
    ];

    let html = itensPrincipais.map(([id, ic, lb]) =>
        `<a class="nav-item" id="nav-${id}" onclick="switchTab('${id}')"><span class="icon">${ic}</span><span>${lb}</span></a>`
    ).join('');
    html += `<a class="nav-item" id="nav-mais" onclick="toggleMaisMenu()"><span class="icon">⋯</span><span>Mais</span></a>`;
    html += `<div class="nav-more-panel" id="nav-more-panel">` + itensMais.map(([id, ic, lb]) =>
        `<a class="nav-item-more" id="nav-${id}" onclick="switchTab('${id}'); fecharMaisMenu()"><span class="icon">${ic}</span><span>${lb}</span></a>`
    ).join('') + `</div>`;
    nav.innerHTML = html;

    // Reacende o destaque da aba que já estava aberta
    const abaAtiva = document.querySelector('.tab-content.active');
    const tabAtual = abaAtiva ? abaAtiva.id.replace('tab-', '') : 'vendas';
    const navBtn = document.getElementById('nav-' + tabAtual);
    if (navBtn) navBtn.classList.add('active');
    const navMais = document.getElementById('nav-mais');
    if (navMais && navBtn && navBtn.classList.contains('nav-item-more')) navMais.classList.add('active');
}

function aplicarPermissoes() {
    const isAdmin = (usuarioCargo === 'Admin');

    // Monta a barra de navegação certa para o cargo (ordem e itens diferentes por perfil)
    renderizarNavPorPerfil();

    const btnAdmin = document.querySelector('button[onclick="switchTab(\'logs\')"]');
    const btnChaves = document.querySelector('.btn-ai[onclick="salvarConfiguracoesChaves()"]');
    const btnRelatorioPainel = document.querySelector('#tab-dashboard button[onclick="abrirModalRelatorios()"]');
    
    // --- BOTÕES E SELECTS ESPECÍFICOS DE VENDAS ---
    const selectStatusVenda = document.getElementById('v-status');
    const btnSubSeparacao = document.getElementById('btn-sub-separacao'); // 🛡️ AGORA ESTÁ NO LUGAR CERTO!
    const filtroComissaoWrap = document.getElementById('filtro-comissao-wrap'); // Filtro de acerto de comissão: só faz sentido pra quem administra

    if (!isAdmin) {
        switchTab('vendas'); // Vendedor sempre cai na tela de vendas ao abrir
        
        const inputSocio = document.getElementById('v-socio');
        if (inputSocio) { inputSocio.value = usuarioLogado; inputSocio.readOnly = true; inputSocio.style.background = "#E8DDE1"; inputSocio.style.color = "#7a4a5e"; }
        const inputValorVenda = document.getElementById('v-valor');
        if (inputValorVenda) { inputValorVenda.readOnly = true; inputValorVenda.style.background = "#E8DDE1"; inputValorVenda.style.color = "#7a4a5e"; }
        
        const btnEquipe = document.getElementById('btn-menu-equipe');
        if (btnEquipe) btnEquipe.style.display = 'none';

        if (btnAdmin) { btnAdmin.style.display = 'none'; if (btnAdmin.previousElementSibling) btnAdmin.previousElementSibling.style.display = 'none'; }
        if (btnChaves) {
            btnChaves.style.display = 'none';
            document.getElementById('cfg-ai-key').parentElement.parentElement.style.display = 'none';
            document.getElementById('cfg-imgbb-key').parentElement.parentElement.style.display = 'none';
            document.getElementById('cfg-onionsys-key').parentElement.parentElement.style.display = 'none';
            if (btnChaves.previousElementSibling) { btnChaves.previousElementSibling.style.display = 'none'; if (btnChaves.previousElementSibling.previousElementSibling) btnChaves.previousElementSibling.previousElementSibling.style.display = 'none'; }
        }

        // ESCONDE O RELATÓRIO DO PAINEL
        if (btnRelatorioPainel) {
            btnRelatorioPainel.style.display = 'none'; 
            if (btnRelatorioPainel.previousElementSibling && btnRelatorioPainel.previousElementSibling.innerText.includes('Administração')) {
                btnRelatorioPainel.previousElementSibling.style.display = 'none'; 
            }
        }
        
        // ESCONDE AS ABAS EXCLUSIVAS DA DIRETORIA (Encomendas agora é liberada pra equipe toda)
        if (btnSubSeparacao) btnSubSeparacao.style.display = 'none';
        if (filtroComissaoWrap) filtroComissaoWrap.style.display = 'none';
        const cardAcertoV = document.getElementById('card-acerto-comissao');
        if (cardAcertoV) cardAcertoV.style.display = 'none';
        const btnQrV = document.getElementById('btn-qr-codes');
        if (btnQrV) btnQrV.style.display = 'none';
        const btnConfV = document.getElementById('btn-conferencia-estoque');
        if (btnConfV) btnConfV.style.display = 'none';
        
        // LIMITA AS OPÇÕES DE PAGAMENTO (Só Pendente e Pago)
        if (selectStatusVenda) {
            selectStatusVenda.innerHTML = `
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
            `;
        }

    } else {
        switchTab('dashboard'); // 👑 O Chefe sempre cai no Painel ao abrir o app!

        if (filtroComissaoWrap) filtroComissaoWrap.style.display = '';
        const cardAcertoA = document.getElementById('card-acerto-comissao');
        if (cardAcertoA) cardAcertoA.style.display = 'block';
        const btnQrA = document.getElementById('btn-qr-codes');
        if (btnQrA) btnQrA.style.display = 'block';
        const btnConfA = document.getElementById('btn-conferencia-estoque');
        if (btnConfA) btnConfA.style.display = 'block';

        const inputSocio = document.getElementById('v-socio');
        if (inputSocio) { inputSocio.readOnly = false; inputSocio.style.background = "#fafafa"; inputSocio.style.color = "var(--brand-dark)"; }
        const inputValorVenda = document.getElementById('v-valor');
        if (inputValorVenda) { inputValorVenda.readOnly = false; inputValorVenda.style.background = "#fafafa"; inputValorVenda.style.color = "var(--brand-dark)"; }

        const btnEquipe = document.getElementById('btn-menu-equipe');
        if (btnEquipe) btnEquipe.style.display = 'block';

        if (btnAdmin) { btnAdmin.style.display = 'block'; if (btnAdmin.previousElementSibling) btnAdmin.previousElementSibling.style.display = 'block'; }
        if (btnChaves) {
            btnChaves.style.display = 'block';
            document.getElementById('cfg-ai-key').parentElement.parentElement.style.display = 'block';
            document.getElementById('cfg-imgbb-key').parentElement.parentElement.style.display = 'block';
            document.getElementById('cfg-onionsys-key').parentElement.parentElement.style.display = 'block';
            if (btnChaves.previousElementSibling) { btnChaves.previousElementSibling.style.display = 'block'; if (btnChaves.previousElementSibling.previousElementSibling) btnChaves.previousElementSibling.previousElementSibling.style.display = 'block'; }
        }

        if (btnRelatorioPainel) {
            btnRelatorioPainel.style.display = 'block'; 
            if (btnRelatorioPainel.previousElementSibling && btnRelatorioPainel.previousElementSibling.innerText.includes('Administração')) {
                btnRelatorioPainel.previousElementSibling.style.display = 'block'; 
            }
        }
        
        // LIBERA AS ABAS EXCLUSIVAS PARA OS CHEFES
        if (btnSubSeparacao) btnSubSeparacao.style.display = 'block';
        
        // LIBERA TODAS AS OPÇÕES DE STATUS DE VENDA
        if (selectStatusVenda) {
            selectStatusVenda.innerHTML = `
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Parcelado">⏳ Parcelado</option>
                <option value="Presente">🎁 Presente / Bonificação</option>
            `;
        }
    }
}

async function sincronizarDadosUnico() {
    mostrarLoading("Sincronizando...");
    try {
        const token = localStorage.getItem('novera_token');
        const res = await fetch(API_NOVERA + "?acao=listar_tudo&_t=" + new Date().getTime(), {
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.status === 401 || res.status === 403) {
            return fazerLogout("Sessão Expirada. Faça login novamente.");
        }
        
        if (!res.ok) throw new Error("Status API: " + res.status);
        const dados = await res.json();
        
        if (dados.sucesso) {
            rotulosGlobal = dados.rotulos || []; estoqueGlobal = dados.estoque || []; 
            gastosGlobal = dados.gastos || []; vendasGlobal = dados.vendas || []; 
            encomendasGlobal = dados.encomendas || []; comprasGlobal = dados.compras || [];
            producaoGlobal = dados.producao || []; // ADICIONE AQUI
            logsGlobal = dados.logs || [];
            usuariosGlobal = dados.usuarios || [];
            bonusComissaoGlobal = dados.bonusComissao || [];
            descontosProdutoGlobal = dados.descontosProduto || [];
            sugestoesProducaoGlobal = dados.sugestoesProducao || [];
            clientesGlobal = dados.clientes || [];
            conquistasGlobal = dados.conquistas || [];
            visitasCatalogoGlobal = dados.visitasCatalogo || [];
            catalogoLinksGlobal = dados.catalogoLinks || [];
            configuracoesGlobais = dados.configuracoes || {};
            aplicarConfiguracoesDinamicas();

            if (typeof renderizarUsuarios === 'function') renderizarUsuarios();
            if (typeof renderizarClientes === 'function') renderizarClientes();
            if (typeof verificarNovasConquistasUI === 'function') verificarNovasConquistasUI();

            estoqueAgrupado = {};
            estoqueGlobal.forEach(e => {
                let n = padronizarTexto(e.nome);
                let rotuloBase = rotulosGlobal.find(r => r.codigo === e.codigo);
                let generoEncontrado = rotuloBase && rotuloBase.genero ? String(rotuloBase.genero).trim() : 'Unissex';
                if (generoEncontrado === '') generoEncontrado = 'Unissex';

                if (!estoqueAgrupado[n]) {
                    estoqueAgrupado[n] = { nome: e.nome, tipo: e.tipo, codigo: e.codigo, preco: e.preco, custo: e.custo, foto: e.foto, totalQtd: 0, locais: {}, locaisDatas: {}, genero: generoEncontrado };
                }
                let lExib = e.local ? e.local.trim() : 'Sede';
                let q = parseFloat(e.qtd) || 0;

                if (!estoqueAgrupado[n].locais[lExib]) estoqueAgrupado[n].locais[lExib] = 0;
                estoqueAgrupado[n].locais[lExib] += q;
                estoqueAgrupado[n].totalQtd += q;
                estoqueAgrupado[n].locaisDatas[lExib] = e.dataEntrada || null; // data da última entrada de estoque nesse local específico
            });

            atualizarDatalistsDinamicos(); renderizarRotulos(); renderizarOpcoesPrecificacao(); renderizarEstoque(); renderizarGastos(); renderizarVendas(); renderizarDashboard(); renderizarEncomendas(); renderizarCompras(); renderizarProducao();calcularRadarProducao(); if (typeof renderizarEstoqueParado === 'function') renderizarEstoqueParado(); if (typeof renderizarMaceracaoVendedor === 'function') renderizarMaceracaoVendedor(); if (typeof popularDatalistProdutosSugestao === 'function') popularDatalistProdutosSugestao(); if (typeof renderizarMinhasSugestoes === 'function') renderizarMinhasSugestoes(); if (typeof renderizarSugestoesProducaoAdmin === 'function') renderizarSugestoesProducaoAdmin();
            if (document.getElementById('tab-logs').classList.contains('active')) renderizarLogs();
            
            if (!dadosCarregados) {
                dadosCarregados = true;
                verificarNovidades();
                verificarComandosURL(); // <--- ADICIONE ESTA LINHA AQUI!
            }
        } else { mostrarAlerta("Erro de Sincronização", dados.erro, "error"); }
    } catch (e) { mostrarAlerta("Falha de Conexão", "Erro ao carregar dados.", "error"); } finally { ocultarLoading(); }   
}

function toggleSenha(inputId, btnElement) { const input = document.getElementById(inputId); if (input.type === "password") { input.type = "text"; btnElement.innerText = "👁️"; } else { input.type = "password"; btnElement.innerText = "🙈"; } }

function iniciarSessaoLocal(usuario, cargo, token) {
    localStorage.setItem('novera_last_user', usuario);
    localStorage.setItem('novera_user_cargo', cargo || 'Vendedor');
    if (token) localStorage.setItem('novera_token', token); // Salva o crachá

    usuarioLogado = usuario;
    usuarioCargo = cargo || 'Vendedor';
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('cfg-user').value = usuario;

    const bannerView = document.getElementById('banner-visualizacao-como');
    if (bannerView) {
        const emVisualizacao = !!localStorage.getItem('novera_admin_token_original');
        bannerView.style.display = emVisualizacao ? 'flex' : 'none';
        if (emVisualizacao) document.getElementById('banner-visualizacao-nome').innerText = usuario;
    }

    aplicarPermissoes();
    verificarNovidades();
    
    // A MÁGICA ACONTECE AQUI: Chama o verificador de primeira viagem!
    verificarTutorialUsuario(); 
    
    if (!dadosCarregados) sincronizarDadosUnico();
}

function verificarLogin() {
    const token = localStorage.getItem('novera_token');
    const lastUser = localStorage.getItem('novera_last_user') || '';
    const lastCargo = localStorage.getItem('novera_user_cargo') || 'Vendedor';
    
    if (token) {
        iniciarSessaoLocal(lastUser, lastCargo, token);
    } else {
        document.getElementById('login-screen').style.display = 'block'; document.getElementById('main-app').style.display = 'none'; document.getElementById('login-user').value = lastUser; document.getElementById('login-pass').value = '';
    }
}

async function fazerLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!user || !pass) return mostrarAlerta("Atenção", "Preencha usuário e senha.", "warning");

    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerText = "⏳ ENTRANDO...";

    try {
        const res = await fetch(API_NOVERA + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: user, senha: pass })
        });

        const json = await res.json();

        if (json.sucesso) {
            iniciarSessaoLocal(json.usuario, json.cargo, json.token);
        } else {
            mostrarAlerta("Acesso Negado", json.erro, "error");
        }
    } catch (e) {
        mostrarAlerta("Erro", "Falha na conexão com o servidor Node.", "error");
    } finally {
        btn.disabled = false;
        btn.innerText = "Entrar";
    }
}

// Aplica os filtros da tela de Logs (busca, usuário, ação, data) — usado tanto pra exibir quanto pra exportar
function obterLogsFiltrados() {
    const selUser = document.getElementById('f-log-usuario');
    const selAcao = document.getElementById('f-log-acao');
    const inputBusca = document.getElementById('busca-logs');
    const inputData = document.getElementById('f-log-data');

    const tBusca = inputBusca ? inputBusca.value.toLowerCase().trim() : "";
    const fUser = selUser ? selUser.value : "";
    const fAcao = selAcao ? selAcao.value : "";
    const fData = inputData ? inputData.value : "";

    let fDataBR = "";
    if (fData) {
        const p = fData.split('-');
        fDataBR = `${p[2]}/${p[1]}/${p[0]}`;
    }

    return logsGlobal.filter(log => {
        let passBusca = !tBusca || (log.detalhe + " " + log.acao + " " + log.usuario).toLowerCase().includes(tBusca);
        let passUser = !fUser || log.usuario === fUser;
        let passAcao = !fAcao || log.acao === fAcao;
        let passData = !fDataBR || (log.dataHora && log.dataHora.startsWith(fDataBR));

        return passBusca && passUser && passAcao && passData;
    });
}

function renderizarLogs() {
    const container = document.getElementById('lista-logs');
    if (!container) return;
    if (logsGlobal.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Nenhum registro encontrado.</p>";
        return;
    }

    const selUser = document.getElementById('f-log-usuario');
    const selAcao = document.getElementById('f-log-acao');

    if (selUser && selUser.options.length <= 1) {
        const usuariosUnicos = [...new Set(logsGlobal.map(l => l.usuario))].filter(Boolean).sort();
        usuariosUnicos.forEach(u => selUser.innerHTML += `<option value="${u}">${u}</option>`);
    }

    if (selAcao && selAcao.options.length <= 1) {
        const acoesUnicas = [...new Set(logsGlobal.map(l => l.acao))].filter(Boolean).sort();
        acoesUnicas.forEach(a => selAcao.innerHTML += `<option value="${a}">${a}</option>`);
    }

    let filtrados = obterLogsFiltrados();

    if (filtrados.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Nenhum log corresponde aos filtros aplicados.</p>";
        return;
    }

    logsRenderizadosAtuais = filtrados; // guarda a lista exibida agora, pro clique no card abrir o modal certo pelo índice

    let html = "";
    filtrados.forEach((log, index) => {
        let corBadge = "#966178";
        if (log.acao.includes('EXCLUIR') || log.acao.includes('EXCLUIU')) corBadge = "#A05252";
        if (log.acao.includes('CRIAR') || log.acao.includes('NOVA') || log.acao.includes('SALVAR') || log.acao.includes('FABRICOU') || log.acao.includes('COMPRA')) corBadge = "#2e7d32";
        if (log.acao.includes('EDITAR') || log.acao.includes('ATUALIZAR') || log.acao.includes('AJUSTOU')) corBadge = "#0369a1";
        if (log.acao.includes('ENTROU')) corBadge = "#166534";
        if (log.acao.includes('FALHOU')) corBadge = "#c2410c"; // Login falho: destaque de alerta pra chamar atenção

        const linhasDetalhe = String(log.detalhe || '').split('\n').filter(Boolean);
        const resumo = linhasDetalhe[0] || '';
        const temMais = linhasDetalhe.length > 1;

        html += `<div class="rotulo-card" style="align-items:center; margin-bottom:8px; cursor:pointer;" onclick="abrirDetalheLog(${index})" title="Clique para ver todos os detalhes">
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:800; font-size:0.75rem; color:var(--brand-dark);">👤 ${log.usuario}</span>
                    <span style="font-size:0.65rem; color:#888;">🕒 ${log.dataHora}</span>
                </div>
                <div style="margin-bottom:4px;"><span style="background:${corBadge}; color:white; padding:2px 6px; border-radius:4px; font-size:0.6rem; font-weight:800; letter-spacing:0.5px;">${log.acao}</span></div>
                <p style="font-size:0.75rem; color:#666; margin:0; line-height:1.4;">${resumo}${temMais ? ' <span style="color:var(--primary-dark); font-weight:800;">— 👁️ ver detalhes</span>' : ''}</p>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function exportarLogsCsv() {
    const filtrados = obterLogsFiltrados();
    if (filtrados.length === 0) return mostrarAlerta("Aviso", "Nenhum log para exportar com os filtros atuais.", "warning");

    let csvContent = "data:text/csv;charset=utf-8,Data e Hora,Usuario,Acao,Detalhe\n";
    filtrados.forEach(log => {
        const detalheLimpo = log.detalhe ? String(log.detalhe).replace(/\n/g, ' ').replace(/"/g, '""') : '';
        const row = [`"${log.dataHora || ''}"`, `"${log.usuario || ''}"`, `"${log.acao || ''}"`, `"${detalheLimpo}"`];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Logs_Novera_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function abrirDetalheLog(index) {
    const log = logsRenderizadosAtuais[index];
    if (!log) return;
    document.getElementById('modal-log-usuario').innerText = log.usuario || '-';
    document.getElementById('modal-log-data').innerText = log.dataHora || '-';
    document.getElementById('modal-log-acao').innerText = log.acao || '-';
    document.getElementById('modal-log-detalhe').innerText = log.detalhe || 'Sem detalhes registrados.';
    document.getElementById('modal-detalhe-log').style.display = 'flex';
}

function renderizarRotulos() {
    const isAdmin = (usuarioCargo === 'Admin'); // Porteiro de segurança da função
    const lista = document.getElementById("lista-rotulos-cadastrados"); 
    const resumo = document.getElementById("resumo-essencias"); 
    
    if (rotulosGlobal.length === 0) { 
        lista.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Dicionário Vazio.</p>"; 
        if (resumo) resumo.innerHTML = ""; 
        return; 
    } 
    
    let htmlLista = ""; 
    let countMasc = 0, countFem = 0, countInf = 0, countUni = 0; 
    
    // 1. Criar as "Gavetas" (Agrupamento por Gênero)
    let gruposRotulos = {
        "Feminino": { itens: [], count: 0, corFundo: "#be185d" },
        "Masculino": { itens: [], count: 0, corFundo: "#0369a1" },
        "Unissex": { itens: [], count: 0, corFundo: "#4b5563" },
        "Infantil": { itens: [], count: 0, corFundo: "#166534" }
    };

    // Ordenar pelo Código Novera (Crescente: N001, N002, N003...) usando inteligência alfanumérica
    rotulosGlobal.sort((a, b) => String(a.codigo || "").localeCompare(String(b.codigo || ""), undefined, { numeric: true })).forEach(r => { 
        let genLow = String(r.genero || "").toLowerCase().trim(); 
        let genKey = "Unissex";
        
        let corFundoGen = "#f3f4f6", corTextoGen = "#4b5563"; 
        
        if (genLow === "masculino") { 
            corFundoGen = "#e0f2fe"; corTextoGen = "#0369a1"; countMasc++; genKey = "Masculino";
        } else if (genLow === "feminino") { 
            corFundoGen = "#fce7f3"; corTextoGen = "#be185d"; countFem++; genKey = "Feminino";
        } else if (genLow === "infantil") { 
            corFundoGen = "#dcfce7"; corTextoGen = "#166534"; countInf++; genKey = "Infantil";
        } else { 
            countUni++; genKey = "Unissex";
        } 
        
        gruposRotulos[genKey].count++;

        let badgeGenero = `<span style="background:${corFundoGen}; color:${corTextoGen}; padding:2px 6px; border-radius:4px; font-size:0.6rem; margin-left:5px; text-transform:uppercase; font-weight:800; vertical-align: middle;">${genKey}</span>`; 
        
        // CADEADOS DE SEGURANÇA ========================================
        let txtForn = isAdmin ? `
            <div class="e-forn-block">
                <p style="margin:0; font-size:0.75rem; color:#666;">Cód Fornecedor: <b style="color: var(--brand-dark); font-size: 0.85rem;">${r.codigo_forn || '-'}</b></p>
            </div>` : '';
            
        const temFicha = !!(r.ficha && String(r.ficha).trim());
        const fichaEss = lerFichaDoRotulo(r) || {};
        const badgeFamilia = fichaEss.familia ? `<span style="background:#f6ebef; color:#a86f88; padding:2px 6px; border-radius:4px; font-size:0.6rem; margin-left:5px; text-transform:uppercase; font-weight:800; vertical-align: middle;">🌳 ${fichaEss.familia}</span>` : '';
        let divBotoesRotulo = isAdmin ? `
            <div style="display:flex; align-items:center; gap:6px;">
                <button class="btn-acao" style="width:36px; height:36px; ${temFicha ? 'background:#fef3c7; color:#b45309; border-color:#fde68a;' : ''}" onclick="abrirFichaOlfativa(${r.linha})" title="${temFicha ? 'Ficha olfativa pronta — toque para editar' : 'Criar ficha olfativa (IA)'}">✨</button>
                <button class="btn-acao" style="width:36px; height:36px;" onclick="abrirModalEditarRotulo(${r.linha})" title="Editar">✏️</button>
                <button class="btn-acao" style="width:36px; height:36px;" onclick="prepararExclusaoRegistro('Tabela Rotulo Novera', ${r.linha}, 'Rótulo: ${r.codigo}')" title="Excluir">🗑️</button>
            </div>` : '';
        // ===============================================================

        // 2. Montar a Linha (Cartão de Essência)
        gruposRotulos[genKey].itens.push(`
        <div class="rotulo-card card-essencia-list" style="border-left: 5px solid ${corTextoGen};">
            <div class="prod-info-main">
                <div class="e-nome-block">
                    <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; color: var(--brand-dark);">${r.essencia} ${badgeGenero}${badgeFamilia}</h4>
                    <p style="margin:0; font-size:0.75rem; color:#888; font-weight:600;">Marca: <span style="color:var(--primary);">${r.marca || 'N/A'}</span></p>
                </div>
            </div>
            
            ${txtForn}

            <div class="prod-actions">
                <div class="rotulo-badge" style="font-size: 1.1rem; padding: 6px 12px; margin-right: 10px;">${r.codigo}</div>
                ${divBotoesRotulo}
            </div>
        </div>`); 
    }); 
    
    // 3. Desenhar o HTML agrupado na tela
    Object.keys(gruposRotulos).forEach(chave => {
        if(gruposRotulos[chave].count > 0) {
            htmlLista += `<div class="separador-data" style="background: ${gruposRotulos[chave].corFundo}; margin: 25px 0 10px 0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                <span>✨ GÊNERO: ${chave.toUpperCase()}</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.3);">${gruposRotulos[chave].count} Cadastradas</span>
            </div>`;
            htmlLista += `<div class="grid-essencia-grupo">`;
            htmlLista += gruposRotulos[chave].itens.join('');
            htmlLista += `</div>`;
        }
    });

    lista.innerHTML = htmlLista; 
    
    // Totalizadores Superiores
    if (resumo) { 
        resumo.innerHTML = `
        <div class="dash-card highlight" style="grid-column: span 2; padding: 15px; margin-bottom: 0; text-align:center;">
            <h3 style="color:#e8dde1; font-size:0.75rem;">Total no Dicionário</h3>
            <p class="valor" style="font-size: 2rem;">${rotulosGlobal.length}</p>
        </div>
        <div class="dash-card" style="padding: 12px; background:#fff0f6; border: 1px solid #fce7f3; transform:none; cursor:default;">
            <h3 style="color:#be185d; font-size:0.65rem;">Femininas</h3>
            <p class="valor" style="font-size: 1.4rem; color:#be185d;">${countFem}</p>
        </div>
        <div class="dash-card" style="padding: 12px; background:#f0f9ff; border: 1px solid #e0f2fe; transform:none; cursor:default;">
            <h3 style="color:#0369a1; font-size:0.65rem;">Masculinas</h3>
            <p class="valor" style="font-size: 1.4rem; color:#0369a1;">${countMasc}</p>
        </div>
        <div class="dash-card" style="padding: 12px; background:#f9fafb; border: 1px solid #e5e7eb; transform:none; cursor:default;">
            <h3 style="color:#4b5563; font-size:0.65rem;">Unissex</h3>
            <p class="valor" style="font-size: 1.4rem; color:#4b5563;">${countUni}</p>
        </div>
        <div class="dash-card" style="padding: 12px; background:#f0fdf4; border: 1px solid #dcfce7; transform:none; cursor:default;">
            <h3 style="color:#166534; font-size:0.65rem;">Infantis</h3>
            <p class="valor" style="font-size: 1.4rem; color:#166534;">${countInf}</p>
        </div>`; 
    } 
}

function renderizarOpcoesPrecificacao() { 
    // 1. PREENCHE A CALCULADORA DE NOVOS PRODUTOS (Mantém todos)
    const select = document.getElementById("n-produto"); 
    let htmlSelect = '<option value="">Selecione a Essência Base...</option>'; 
    rotulosGlobal.sort((a, b) => String(a.codigo || "").localeCompare(String(b.codigo || ""))).forEach(r => { 
        let genTxt = r.genero ? ` (${r.genero})` : ''; 
        htmlSelect += `<option value="${r.codigo}|${r.essencia}">${r.codigo} - ${r.essencia}${genTxt}</option>`; 
    }); 
    select.innerHTML = htmlSelect; 

    // 2. PREENCHE O DROPDOWN DE PRODUÇÃO RÁPIDA (Filtra apenas Perfumes)
    const selectPR = document.getElementById("pr-produto");
    if (selectPR) {
        let htmlPR = '<option value="">Selecione um Perfume do Estoque...</option>';
        
        // Aplica o filtro para ignorar Cremes, Home Sprays, etc.
        let produtosFiltrados = Object.values(estoqueAgrupado).filter(e => {
            let tipoProduto = String(e.tipo).toLowerCase().trim();
            let nomeProduto = String(e.nome).toLowerCase().trim();
            // Retorna verdadeiro apenas se a palavra 'perfume' estiver no tipo ou no nome
            return tipoProduto === 'perfume' || nomeProduto.includes('perfume');
        });

        // Ordena a lista usando o Código (N001, N002...) e depois o Nome
        produtosFiltrados.sort((a, b) => {
            let codA = String(a.codigo || "");
            let codB = String(b.codigo || "");
            if(codA === codB) return String(a.nome).localeCompare(String(b.nome));
            return codA.localeCompare(codB);
        }).forEach(e => {
            let exibeCodigo = e.codigo ? e.codigo + ' - ' : '';
            htmlPR += `<option value="${e.nome}">${exibeCodigo}${e.nome}</option>`;
        });
        
        selectPR.innerHTML = htmlPR;
    }
}

function salvarRotulo() { const essencia = padronizarTexto(document.getElementById('r-essencia').value); const codForn = padronizarTexto(document.getElementById('r-codigo-forn').value); const marca = padronizarTexto(document.getElementById('r-marca').value); const genero = document.getElementById('r-genero') ? document.getElementById('r-genero').value : ""; if (!essencia) return mostrarAlerta("Atenção", "Preencha a Essência.", "warning"); mostrarLoading("Salvando..."); const msgLog = `✨ Criou a essência: ${essencia} (Gênero: ${genero || 'Indefinido'})`; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_rotulo", essencia: essencia, codigo_forn: codForn, marca: marca, genero: genero, log_detalhe: msgLog }) }).then(r => { if(r.status === 401 || r.status === 403) { fazerLogout("Sessão Expirada"); throw new Error("Auth"); } return r.json(); }).then(resultado => { if (resultado.sucesso) { mostrarAlerta("Criado!", `Identidade gerada.`, "success"); document.getElementById('r-essencia').value = ""; if (document.getElementById('r-codigo-forn')) document.getElementById('r-codigo-forn').value = ""; if (document.getElementById('r-marca')) document.getElementById('r-marca').value = ""; if (document.getElementById('r-genero')) document.getElementById('r-genero').value = ""; sincronizarDadosUnico(); } else { mostrarAlerta("Erro", resultado.erro === "DUPLICADO_ROTULO" ? "Essência já cadastrada." : resultado.erro, "error"); } }).catch(e => { if(e.message !== "Auth") mostrarAlerta("Erro", "Falha.", "error"); }).finally(() => ocultarLoading()); }
function abrirModalEditarRotulo(linha) { const r = rotulosGlobal.find(x => x.linha === linha); if (!r) return; document.getElementById('edit-r-linha').value = r.linha; document.getElementById('edit-r-essencia').value = r.essencia; document.getElementById('edit-r-codigo-forn').value = r.codigo_forn; document.getElementById('edit-r-marca').value = r.marca; if (document.getElementById('edit-r-genero')) document.getElementById('edit-r-genero').value = r.genero || ""; document.getElementById('modal-editar-rotulo').style.display = 'flex'; }
function salvarEdicaoRotulo() { mostrarLoading("Atualizando..."); const ess = padronizarTexto(document.getElementById('edit-r-essencia').value); const gen = document.getElementById('edit-r-genero') ? document.getElementById('edit-r-genero').value : ""; const msgLog = `✏️ Editou a essência: ${ess}. Gênero atual: ${gen || 'Indefinido'}`; const py = { usuario: usuarioLogado, acao: "atualizar_rotulo", linha: document.getElementById('edit-r-linha').value, essencia: ess, codigo_forn: padronizarTexto(document.getElementById('edit-r-codigo-forn').value), marca: padronizarTexto(document.getElementById('edit-r-marca').value), genero: gen, log_detalhe: msgLog }; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(py) }).then(r => r.json()).then(json => { if (json.sucesso) { document.getElementById('modal-editar-rotulo').style.display = 'none'; mostrarAlerta("Atualizado!", "Edição salva.", "success"); sincronizarDadosUnico(); } }).catch(e => mostrarAlerta("Erro", "Falha de conexão.", "error")).finally(() => ocultarLoading()); }

let custoTotalGlobal = 0;
function calcularNovera() { const cFrag = parseFloat(document.getElementById('n-custo-frag').value) || 0; const qFrag = parseFloat(document.getElementById('n-qtd-frag').value) || 0; const cBase1L = parseFloat(document.getElementById('n-custo-base').value) || 0; const qBase = parseFloat(document.getElementById('n-qtd-base').value) || 0; const mlVenda = parseFloat(document.getElementById('n-ml-venda').value) || 1; const cInsumos = parseFloat(document.getElementById('n-insumos').value) || 0; const valorMlBase = cBase1L / 1000; const qtdMlProducao = qBase + qFrag; const qtdFrascos = qtdMlProducao / mlVenda; const custoLiquidoUni = qtdFrascos > 0 ? (cFrag + (valorMlBase * qBase)) / qtdFrascos : 0; const custoTotalUni = custoLiquidoUni + cInsumos; custoTotalGlobal = custoTotalUni; document.getElementById('r-frascos').innerText = Math.floor(qtdFrascos) + " un"; document.getElementById('r-custo-total').innerText = fmt(custoTotalUni); document.getElementById('p-rendimento').value = Math.floor(qtdFrascos); autoSugerirPrecoFabrica(); }
function autoSugerirPrecoFabrica() { if (!document.getElementById('p-preco-venda').value) { document.getElementById('p-preco-venda').value = fmt(custoTotalGlobal * 3); } }
async function salvarProducaoEstoque() { const essBaseVal = document.getElementById('n-produto').value; const tipoFinal = padronizarTexto(document.getElementById('n-tipo-final').value); const volume = document.getElementById('n-ml-venda').value; const qtdRendimento = document.getElementById('p-rendimento').value; const precoVendaStr = document.getElementById('p-preco-venda').value; const pLocal = document.getElementById('p-local') ? padronizarTexto(document.getElementById('p-local').value) : "Sede"; if (!essBaseVal || !tipoFinal || !qtdRendimento || !precoVendaStr) return mostrarAlerta("Atenção", "Preencha a Essência Base, Tipo, Rendimento e Preço.", "warning"); const partes = essBaseVal.split('|'); const codNovera = partes[0]; const essBase = partes[1]; const nomeProdutoFinal = `${tipoFinal} ${essBase} ${volume}ml`; const precoVenda = parseDinheiro(precoVendaStr); mostrarLoading("Enviando..."); const msgLog = `🏭 Fabricou ${qtdRendimento}x [${nomeProdutoFinal}]. Enviado para: ${pLocal}.`; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_producao_estoque", nome_produto: nomeProdutoFinal, tipo: tipoFinal, qtd: qtdRendimento, custo: fmtPlanilha(custoTotalGlobal), preco: fmtPlanilha(precoVenda), codigo: codNovera, local: pLocal, log_detalhe: msgLog }) }).then(() => { mostrarAlerta("Produzido!", `Lote enviado para ${pLocal}.`, "success"); document.getElementById('p-rendimento').value = "1"; document.getElementById('p-preco-venda').value = ""; sincronizarDadosUnico(); }); }


function salvarFilaProducao() {
    const essBaseVal = document.getElementById('n-produto').value; 
    const tipoFinal = padronizarTexto(document.getElementById('n-tipo-final').value); 
    const volume = document.getElementById('n-ml-venda').value; 
    const qtdRendimento = document.getElementById('p-rendimento').value; 
    const precoVendaStr = document.getElementById('p-preco-venda').value; 
    
    const diasMaceracao = parseInt(document.getElementById('p-dias-maceracao').value) || 0;
    
    if (!essBaseVal || !tipoFinal || !qtdRendimento || !precoVendaStr) {
        return mostrarAlerta("Atenção", "Preencha todos os campos do controle de produção.", "warning"); 
    }
    
    // CORREÇÃO: Data local travada!
    const dAtual = new Date();
    const anoI = dAtual.getFullYear();
    const mesI = String(dAtual.getMonth() + 1).padStart(2, '0');
    const diaI = String(dAtual.getDate()).padStart(2, '0');
    const dataInicio = `${anoI}-${mesI}-${diaI}`;

    // Cálculo da previsão exata
    dAtual.setDate(dAtual.getDate() + diasMaceracao);
    const anoP = dAtual.getFullYear();
    const mesP = String(dAtual.getMonth() + 1).padStart(2, '0');
    const diaP = String(dAtual.getDate()).padStart(2, '0');
    const dataPrev = `${anoP}-${mesP}-${diaP}`;
    
    const partes = essBaseVal.split('|'); const codNovera = partes[0]; const essBase = partes[1]; 
    const nomeProdutoFinal = `${tipoFinal} ${essBase} ${volume}ml`; 
    const precoVenda = parseDinheiro(precoVendaStr); 

    mostrarLoading("Colocando na Fila..."); 
    const msgLog = `⏳ Maceração: ${qtdRendimento}x [${nomeProdutoFinal}]. Previsão para: ${dataBR(dataPrev)} (${diasMaceracao} dias).`; 
    
    fetch(API_NOVERA, { 
        method: "POST", headers: cabecalhoAuth(), 
        body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_producao_fila", data_inicio: dataInicio, data_previsao: dataPrev, nome_produto: nomeProdutoFinal, tipo: tipoFinal, qtd_prevista: qtdRendimento, custo: fmtPlanilha(custoTotalGlobal), preco: fmtPlanilha(precoVenda), codigo: codNovera, log_detalhe: msgLog }) 
    }).then(() => { 
        mostrarAlerta("Na Fila!", `Maceração iniciada para ${diasMaceracao} dia(s).`, "success"); 
        document.getElementById('p-rendimento').value = "1"; 
        document.getElementById('p-preco-venda').value = ""; 
        document.getElementById('p-dias-maceracao').value = "15"; 
        sincronizarDadosUnico(); 
    });
}

// ==========================================
// FUNÇÃO QUE DESENHA A FÁBRICA / MACERAÇÃO
// ==========================================
function renderizarProducao() {
    const isAdmin = (usuarioCargo === 'Admin');
    const fila = document.getElementById('lista-producao-cards');
    const resumo = document.getElementById('resumo-producao');

    // Essa tela é só do Admin (usa data_inicio/custo, que o servidor nem envia mais pro vendedor). Vendedor tem a tela própria dele.
    if (!isAdmin) { if (fila) fila.innerHTML = ''; if (resumo) resumo.innerHTML = ''; return; }

    const tBusca = document.getElementById('busca-producao') ? document.getElementById('busca-producao').value.toLowerCase().trim() : '';

    let pends = producaoGlobal.filter(p => p.status === 'Em Andamento');

    // 🔍 BUSCA INTELIGENTE: Procura por Nome, Código Inteiro (N007) ou Código Curto (007)
    if (tBusca) {
        pends = pends.filter(p => {
            let matchNome = p.nome_produto.toLowerCase().includes(tBusca);
            let matchCodigo = p.codigo && String(p.codigo).toLowerCase().includes(tBusca);
            // Mágica: Tira a letra "N" do código para o sistema achar se você digitar só os números
            let matchCodigoLimpo = p.codigo && String(p.codigo).toLowerCase().replace('n', '').includes(tBusca);
            
            return matchNome || matchCodigo || matchCodigoLimpo;
        });
    }

    if (pends.length === 0) {
        fila.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Nenhuma maceração encontrada.</p>";
        if(resumo && !tBusca) resumo.innerHTML = "";
        return;
    }

    let totalEncomendadoPorProduto = {};
    encomendasGlobal.forEach(enc => {
        if (enc.status === 'Pendente' || enc.status === 'Produzido') {
            let nomeP = padronizarTexto(enc.item);
            totalEncomendadoPorProduto[nomeP] = (totalEncomendadoPorProduto[nomeP] || 0) + (parseInt(enc.qtd) || 0);
        }
    });

    const hojeObj = new Date();
    hojeObj.setHours(0, 0, 0, 0);

    let totalUnidades = 0, countFem = 0, countMasc = 0;
    let grupos = {}; 

    pends.forEach(p => {
        const q = parseFloat(p.qtd_prevista) || 0;
        totalUnidades += q;

        const rotuloRef = rotulosGlobal.find(r => r.codigo === p.codigo);
        const gen = rotuloRef && rotuloRef.genero ? String(rotuloRef.genero).toLowerCase().trim() : 'unissex';

        if (gen === 'feminino') countFem += q;
        else if (gen === 'masculino') countMasc += q;

        p.genero_calc = gen; 
        p.genero_txt = rotuloRef && rotuloRef.genero ? rotuloRef.genero : 'Unissex';

        const [a, m, d] = p.data_previsao.split('-');
        const prevObj = new Date(a, m - 1, d);
        const diffTimeFalta = prevObj.getTime() - hojeObj.getTime();
        p.diffDaysFalta = Math.ceil(diffTimeFalta / (1000 * 60 * 60 * 24));

        const [iA, iM, iD] = p.data_inicio.split('-');
        const inicioObj = new Date(iA, iM - 1, iD);
        const diffTimeInicio = hojeObj.getTime() - inicioObj.getTime();
        p.diasMacerando = Math.floor(diffTimeInicio / (1000 * 60 * 60 * 24));

        let dataKey = p.data_previsao;
        if (!grupos[dataKey]) {
            // CRIAMOS A VARIÁVEL "totalGrupo" para somar os frascos dessa data!
            grupos[dataKey] = { dataBR: dataBR(p.data_previsao), diffDays: p.diffDaysFalta, itens: [], totalGrupo: 0 };
        }
        grupos[dataKey].itens.push(p);
        grupos[dataKey].totalGrupo += q; // Soma as unidades neste grupo
    });

    let datasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(a) - new Date(b));

    let html = "";

    datasOrdenadas.forEach(dataKey => {
        let grupo = grupos[dataKey];

        let classDivisor = "div-futuro";
        let textoDivisor = `⏳ Pronto em: ${grupo.dataBR} (Faltam ${grupo.diffDays} dias)`;
        if (grupo.diffDays < 0) {
            classDivisor = "div-atrasado"; textoDivisor = `🚨 Atrasado! Era para: ${grupo.dataBR}`;
        } else if (grupo.diffDays === 0) {
            classDivisor = "div-hoje"; textoDivisor = `✨ Ficam prontos HOJE! (${grupo.dataBR})`;
        }

        // 📦 O CABEÇALHO AGORA EXIBE A SOMA DO LOTE (Lado a lado com a data)
        html += `<div class="separador-data ${classDivisor}" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                    <span>${textoDivisor}</span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.3);">📦 Meta do Lote: <b>${grupo.totalGrupo} un</b></span>
                 </div>`;
        html += `<div class="grid-producao-grupo">`;

        grupo.itens.sort((a, b) => {
            if (a.genero_calc !== b.genero_calc) return a.genero_calc.localeCompare(b.genero_calc);
            return a.nome_produto.localeCompare(b.nome_produto);
        });

        grupo.itens.forEach(p => {
            let textoMacerando = p.diasMacerando === 0 ? "Iniciado hoje" : `Macerando há ${p.diasMacerando} dia(s)`;

            let corFundoGen = "#f3f4f6", corTextoGen = "#4b5563";
            if(p.genero_calc === "masculino") { corFundoGen = "#e0f2fe"; corTextoGen = "#0369a1"; }
            else if(p.genero_calc === "feminino") { corFundoGen = "#fce7f3"; corTextoGen = "#be185d"; }
            let badgeGenero = `<span style="background:${corFundoGen}; color:${corTextoGen}; padding:2px 6px; border-radius:4px; font-size:0.6rem; font-weight:800; text-transform:uppercase; margin-left:5px; vertical-align: middle;">${p.genero_txt}</span>`;

            // AVISA A FÁBRICA QUE O LOTE JÁ ESTÁ VENDIDO
            let qtdEncomendada = totalEncomendadoPorProduto[padronizarTexto(p.nome_produto)] || 0;
            let badgeAlertaFabrica = qtdEncomendada > 0 ? `<div style="margin-top: 5px; background: #fff9e6; color: #b45309; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: bold; border: 1px solid #fde047; display: inline-block;">⚠️ Atenção: ${qtdEncomendada} estão reservados!</div>` : '';

            const btnEditarProd = isAdmin ? `<button class="btn-acao" style="width: 36px; height: 36px;" onclick="abrirModalEditarProducao(${p.linha})" title="Editar Previsão">✏️</button>` : '';
            const btnExcluirProd = isAdmin ? `<button class="btn-acao" style="width: 36px; height: 36px;" onclick="prepararExclusaoRegistro('Produção', ${p.linha}, 'Lote: ${p.nome_produto}')" title="Cancelar Produção">🗑️</button>` : '';
            const btnFinalizarProd = isAdmin ? `<button class="btn-salvar" style="margin:0; padding:10px 20px; font-size:0.8rem; background:#2e7d32; box-shadow: 0 4px 10px rgba(46, 125, 50, 0.3);" onclick="abrirModalFinalizarProducao(${p.linha})">✔️ FINALIZAR LOTE</button>` : '';

            // 🖨️ Controle de caixinhas 3D do lote (só Admin): marca conforme sai da impressora, direto da tela
            let htmlCaixas = '';
            if (isAdmin) {
                const metaCx = parseFloat(p.qtd_prevista) || 0;
                const cxProntas = parseInt(p.caixas_prontas) || 0;
                const cxCompletas = metaCx > 0 && cxProntas >= metaCx;
                const btnCompletarCx = !cxCompletas ? `<button class="btn-acao" style="width:34px; height:34px; font-weight:900; background:#dcfce7; color:#15803d; border-color:#86efac;" onclick="definirCaixasProducao(${p.linha}, ${metaCx})" title="Marcar TODAS como impressas">✔</button>` : '';
                htmlCaixas = `
                <div style="margin-top:10px; background:${cxCompletas ? '#f0fdf4' : '#fdf5f7'}; border:1px dashed ${cxCompletas ? '#86efac' : '#f3d8e2'}; border-radius:8px; padding:8px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                    <span onclick="digitarCaixasProducao(${p.linha})" title="Toque para digitar a quantidade exata" style="font-size:0.72rem; font-weight:800; cursor:pointer; text-decoration:underline dotted; color:${cxCompletas ? '#15803d' : 'var(--primary-dark)'};">🖨️ Caixinhas 3D: ${cxProntas}/${metaCx}${cxCompletas ? ' — ✅ todas impressas!' : ` (faltam ${Math.max(0, metaCx - cxProntas)})`}</span>
                    <span style="display:flex; gap:6px;">
                        <button class="btn-acao" style="width:34px; height:34px; font-weight:900;" onclick="ajustarCaixasProducao(${p.linha}, -1)" title="Tirar uma">−</button>
                        <button class="btn-acao" style="width:34px; height:34px; font-weight:900; background:#e8f5e9; color:#2e7d32; border-color:#c8e6c9;" onclick="ajustarCaixasProducao(${p.linha}, 1)" title="Mais uma impressa">+</button>
                        ${btnCompletarCx}
                    </span>
                </div>`;
            }

            html += `
            <div class="rotulo-card card-producao-list" style="border-left: 5px solid ${corTextoGen}; border-radius: 8px; padding: 15px;">
                <div class="prod-info-main" style="flex:1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; color: var(--brand-dark);">
                        <span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px; vertical-align: middle;">${p.codigo}</span>
                        ${p.nome_produto} ${badgeGenero}
                    </h4>
                    <p style="font-size: 0.75rem; color: var(--brand-dark); font-weight: 700; margin: 0 0 5px 0;">🧪 ${textoMacerando}</p>
                    <p style="font-size: 0.65rem; color: #888; margin: 0;">📅 Iniciado em: ${dataBR(p.data_inicio)}</p>
                    ${badgeAlertaFabrica}
                    ${htmlCaixas}
                </div>

                <div class="prod-actions">
                    <div style="text-align: right; margin-right: 15px;">
                        <p style="font-size: 0.75rem; margin: 0; color: #888;">Meta de Envase</p>
                        <p style="margin: 0; color: var(--brand-dark); font-size: 1.2rem; font-weight: 900;">${p.qtd_prevista} un</p>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        ${btnEditarProd}
                        ${btnExcluirProd}
                        ${btnFinalizarProd}
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`; 
    });

    fila.innerHTML = html;

    if (resumo) {
        resumo.innerHTML = `
            <div class="dash-card highlight" style="grid-column: span 2; padding: 15px; margin-bottom: 0; text-align:center;">
                <h3 style="color:#e8dde1; font-size:0.75rem;">Volume Total em Maceração</h3>
                <p class="valor" style="font-size: 2rem;">${totalUnidades} un</p>
            </div>
            <div class="dash-card" style="padding: 12px; background:#fff0f6; border: 1px solid #fce7f3; transform:none; cursor:default;">
                <h3 style="color:#be185d; font-size:0.65rem;">Femininos</h3>
                <p class="valor" style="font-size: 1.4rem; color:#be185d;">${countFem}</p>
            </div>
            <div class="dash-card" style="padding: 12px; background:#f0f9ff; border: 1px solid #e0f2fe; transform:none; cursor:default;">
                <h3 style="color:#0369a1; font-size:0.65rem;">Masculinos</h3>
                <p class="valor" style="font-size: 1.4rem; color:#0369a1;">${countMasc}</p>
            </div>
        `;
    }
}

// ==========================================
// ⏳ CONSULTA DE MACERAÇÃO PARA VENDEDORES
// Só mostra o essencial (produto, quantidade, quando fica pronto) — sem custo nem data de início, que é segredo de fábrica
// ==========================================
function renderizarMaceracaoVendedor() {
    const container = document.getElementById('lista-maceracao-vendedor');
    if (!container) return;

    const todasEmAndamento = producaoGlobal.filter(p => p.status === 'Em Andamento');
    if (todasEmAndamento.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; font-size:0.85rem; padding:20px 0;'>Nenhum perfume em maceração no momento.</p>";
        return;
    }

    const tBusca = document.getElementById('busca-maceracao-vendedor') ? document.getElementById('busca-maceracao-vendedor').value.toLowerCase().trim() : '';
    let itens = todasEmAndamento;
    if (tBusca) {
        itens = itens.filter(p => {
            const matchNome = p.nome_produto.toLowerCase().includes(tBusca);
            const matchCodigo = p.codigo && String(p.codigo).toLowerCase().includes(tBusca);
            const matchCodigoLimpo = p.codigo && String(p.codigo).toLowerCase().replace('n', '').includes(tBusca);
            return matchNome || matchCodigo || matchCodigoLimpo;
        });
    }

    if (itens.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; font-size:0.85rem; padding:20px 0;'>Nenhum resultado pra essa busca.</p>";
        return;
    }

    const hojeObj = new Date(); hojeObj.setHours(0, 0, 0, 0);

    // Agrupa por data de previsão — todo item do mesmo grupo compartilha o mesmo status de urgência
    let grupos = {};
    itens.forEach(p => {
        const chave = p.data_previsao;
        if (!grupos[chave]) grupos[chave] = { itens: [], totalQtd: 0 };
        grupos[chave].itens.push(p);
        grupos[chave].totalQtd += parseFloat(p.qtd_prevista) || 0;
    });

    const datasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(a) - new Date(b));

    let html = '';
    datasOrdenadas.forEach(dataChave => {
        const grupo = grupos[dataChave];
        const [ano, mes, dia] = dataChave.split('-');
        const dataPrevObj = new Date(ano, mes - 1, dia);
        const diffDias = Math.round((dataPrevObj - hojeObj) / 86400000);
        const dataBr = `${dia}/${mes}/${ano}`;

        let corGrupo = '#0369a1', textoStatus = '⏳ Pronto em ' + diffDias + ' dias';
        if (diffDias < 0) { corGrupo = '#dc2626'; textoStatus = '⚠️ Atrasado'; }
        else if (diffDias === 0) { corGrupo = '#16a34a'; textoStatus = '✅ Pronto hoje!'; }
        else if (diffDias === 1) { corGrupo = '#16a34a'; textoStatus = '⏳ Pronto amanhã'; }

        const qtdProdutos = grupo.itens.length;
        const txtProdutos = qtdProdutos === 1 ? '1 produto' : `${qtdProdutos} produtos`;

        html += `<div class="separador-data div-futuro" style="background:${corGrupo}; margin: 25px 0 10px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">
                    <span>🗓️ ${dataBr} — ${textoStatus}</span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.3);">${txtProdutos} • ${grupo.totalQtd} un</span>
                 </div>`;

        html += `<div class="grid-vendas-grupo">`;

        grupo.itens.sort((a, b) => a.nome_produto.localeCompare(b.nome_produto)).forEach(p => {
            // Busca o gênero na tabela de Essências (dado público, não é segredo de fábrica) pra destacar no cartão
            const rotuloRef = rotulosGlobal.find(r => r.codigo === p.codigo);
            const genLow = rotuloRef && rotuloRef.genero ? String(rotuloRef.genero).toLowerCase().trim() : 'unissex';
            let corGen = '#9ca3af', corFundoGen = '#f3f4f6', corTextoGen = '#4b5563', txtGen = 'Unissex';
            if (genLow === 'masculino') { corGen = '#0369a1'; corFundoGen = '#e0f2fe'; corTextoGen = '#0369a1'; txtGen = 'Masculino'; }
            else if (genLow === 'feminino') { corGen = '#be185d'; corFundoGen = '#fce7f3'; corTextoGen = '#be185d'; txtGen = 'Feminino'; }
            else if (genLow === 'infantil') { corGen = '#166534'; corFundoGen = '#dcfce7'; corTextoGen = '#166534'; txtGen = 'Infantil'; }

            const codigoBadge = p.codigo ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px;">${p.codigo}</span>` : '';
            const generoBadge = `<span style="background:${corFundoGen}; color:${corTextoGen}; padding:2px 8px; border-radius:4px; font-size:0.6rem; font-weight:800; text-transform:uppercase; margin-left:5px;">${txtGen}</span>`;

            html += `
            <div class="rotulo-card" style="flex-direction:column; align-items:stretch; border-left: 5px solid ${corGen}; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <h4 style="margin:0; font-size:0.9rem; color:var(--brand-dark);">${codigoBadge}${p.nome_produto}${generoBadge}</h4>
                </div>
                <p style="margin:6px 0 0 0; font-size:0.75rem; color:#666;">📦 Rendimento previsto: <b>${p.qtd_prevista} un</b></p>
            </div>`;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

// ==========================================
// 💡 SUGESTÃO DE PRODUÇÃO (vendedor sugere, Admin decide)
// ==========================================
function popularDatalistProdutosSugestao() {
    const datalist = document.getElementById('lista-produtos-sugestao');
    if (!datalist) return;
    const nomes = Object.values(estoqueAgrupado).map(e => e.nome).sort((a, b) => a.localeCompare(b));
    datalist.innerHTML = nomes.map(n => `<option value="${n}">`).join('');
}

function salvarSugestaoProducao() {
    const campoProduto = document.getElementById('sp-produto');
    const nomeProduto = padronizarTexto(campoProduto.value);
    const observacao = document.getElementById('sp-observacao').value;
    if (!nomeProduto) return mostrarAlerta("Atenção", "Escreva ou escolha o produto que você gostaria de sugerir.", "warning");

    mostrarLoading("Enviando sugestão...");
    const msgLog = `💡 Sugeriu fabricar: ${nomeProduto}`;
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_sugestao_producao", nome_produto: nomeProduto, observacao: observacao, log_detalhe: msgLog }) })
    .then(r => r.json())
    .then(res => {
        if (res.sucesso) {
            mostrarAlerta("Enviado!", "Sua sugestão chegou pra Diretoria.", "success");
            campoProduto.value = "";
            document.getElementById('sp-observacao').value = "";
            sincronizarDadosUnico();
        } else {
            mostrarAlerta("Erro", res.erro || "Falha ao enviar sugestão.", "error");
        }
    })
    .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => ocultarLoading());
}

function renderizarMinhasSugestoes() {
    const container = document.getElementById('lista-minhas-sugestoes');
    if (!container) return;

    const minhas = sugestoesProducaoGlobal
        .filter(s => String(s.sugeridoPor || '').toLowerCase().trim() === usuarioLogado.toLowerCase().trim())
        .sort((a, b) => new Date(b.dataSugestao) - new Date(a.dataSugestao));

    if (minhas.length === 0) { container.innerHTML = ''; return; }

    const corStatus = (status) => status === 'Atendida' ? '#166534' : status === 'Descartada' ? '#991b1b' : '#b45309';
    const fundoStatus = (status) => status === 'Atendida' ? '#dcfce7' : status === 'Descartada' ? '#fee2e2' : '#fef3c7';

    let html = `<p style="font-size:0.75rem; color:#888; font-weight:800; text-transform:uppercase; margin-bottom:10px;">📋 Minhas sugestões enviadas</p>`;
    minhas.forEach(s => {
        html += `<div class="rotulo-card" style="padding:12px; margin-bottom:8px; border-left: 4px solid ${corStatus(s.status)};">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <strong style="font-size:0.85rem; color:var(--brand-dark);">${s.nomeProduto}</strong>
                <span style="background:${fundoStatus(s.status)}; color:${corStatus(s.status)}; padding:2px 8px; border-radius:4px; font-size:0.65rem; font-weight:800; text-transform:uppercase;">${s.status}</span>
            </div>
            ${s.observacao ? `<p style="font-size:0.7rem; color:#888; margin:4px 0 0 0; font-style:italic;">${s.observacao}</p>` : ''}
        </div>`;
    });
    container.innerHTML = html;
}

// Painel do Admin: todas as sugestões pendentes de todos os vendedores, mais um histórico recente
function renderizarSugestoesProducaoAdmin() {
    const container = document.getElementById('lista-sugestoes-producao');
    if (!container) return;

    if (sugestoesProducaoGlobal.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; font-size:0.85rem; padding:20px 0;'>Nenhuma sugestão enviada ainda.</p>";
        return;
    }

    const pendentes = sugestoesProducaoGlobal.filter(s => s.status === 'Pendente').sort((a, b) => new Date(a.dataSugestao) - new Date(b.dataSugestao));
    const historico = sugestoesProducaoGlobal.filter(s => s.status !== 'Pendente').sort((a, b) => new Date(b.dataSugestao) - new Date(a.dataSugestao)).slice(0, 10);

    let html = '';
    if (pendentes.length === 0) {
        html += `<p style='text-align:center; color:#15803d; font-size:0.85rem; font-weight:bold; padding:10px 0;'>✨ Nenhuma sugestão pendente!</p>`;
    } else {
        pendentes.forEach(s => {
            html += `<div class="rotulo-card" style="flex-direction:column; align-items:stretch; border-left: 5px solid #0369a1; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <h4 style="margin:0; font-size:0.9rem; color:var(--brand-dark);">${s.nomeProduto}</h4>
                    <span style="font-size:0.65rem; color:#888;">👤 ${s.sugeridoPor}</span>
                </div>
                ${s.observacao ? `<p style="margin:6px 0 0 0; font-size:0.75rem; color:#666; font-style:italic;">"${s.observacao}"</p>` : ''}
                <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                    <button class="btn-salvar" style="margin:0; padding:8px 14px; font-size:0.75rem; background:#2C2A2B; box-shadow:none; flex:1;" onclick="irFabricarSugestao('${encodeURIComponent(s.nomeProduto)}')">🏭 Ir Fabricar</button>
                    <button class="btn-acao" style="background:#dcfce7; color:#166534; border-color:#bbf7d0;" onclick="decidirSugestaoProducao(${s.linha}, 'Atendida')" title="Marcar como atendida">✔️</button>
                    <button class="btn-acao" style="background:#fee2e2; color:#991b1b; border-color:#fecaca;" onclick="decidirSugestaoProducao(${s.linha}, 'Descartada')" title="Descartar">🗑️</button>
                </div>
            </div>`;
        });
    }

    if (historico.length > 0) {
        html += `<p style="font-size:0.7rem; color:#888; font-weight:800; text-transform:uppercase; margin:20px 0 10px 0;">Histórico recente</p>`;
        historico.forEach(s => {
            const cor = s.status === 'Atendida' ? '#166534' : '#991b1b';
            html += `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e5e7eb; font-size:0.75rem;">
                <span>${s.nomeProduto} <span style="color:#888;">(${s.sugeridoPor})</span></span>
                <span style="color:${cor}; font-weight:800;">${s.status}</span>
            </div>`;
        });
    }

    container.innerHTML = html;
}

function decidirSugestaoProducao(id, novoStatus) {
    const s = sugestoesProducaoGlobal.find(x => x.linha == id);
    if (!s) return;
    mostrarLoading("Atualizando...");
    const msgLog = `💡 Sugestão de [${s.nomeProduto}] marcada como ${novoStatus}`;
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "atualizar_status_sugestao", linha: id, status: novoStatus, log_detalhe: msgLog }) })
    .then(() => sincronizarDadosUnico())
    .finally(() => ocultarLoading());
}

// Leva direto pro formulário de "Lançar Produção" com o produto já selecionado, se ele já existir no catálogo
function irFabricarSugestao(nomeEncoded) {
    const nome = decodeURIComponent(nomeEncoded);
    toggleFabricaTab('lancar');
    setTimeout(() => {
        const selectProduto = document.getElementById('pr-produto');
        const opcaoExiste = selectProduto && Array.from(selectProduto.options).some(o => o.value === nome);
        if (opcaoExiste) {
            selectProduto.value = nome;
            selectProduto.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => { const campoQtd = document.getElementById('pr-qtd'); if (campoQtd) campoQtd.focus(); }, 300);
        } else {
            mostrarAlerta("Produto Novo", `"${nome}" ainda não existe no catálogo de estoque. Cadastre a receita primeiro em "🧪 Nova Receita".`, "warning");
        }
    }, 100);
}

function abrirModalFinalizarProducao(id) {
    const p = producaoGlobal.find(x => x.linha === id);
    if(!p) return;
    document.getElementById('mfp-linha').value = p.linha;
    document.getElementById('mfp-produto').innerText = p.nome_produto;
    document.getElementById('mfp-qtd-real').value = p.qtd_prevista;
    
    // FORMATANDO OS VALORES PARA APARECEREM NA TELA COM O "R$"
    document.getElementById('mfp-custo').value = safeFmt(p.custo_unitario);
    document.getElementById('mfp-preco').value = safeFmt(p.preco_sugerido);
    
    document.getElementById('mfp-codigo').value = p.codigo;
    document.getElementById('mfp-tipo').value = p.tipo;
    document.getElementById('modal-finalizar-producao').style.display = 'flex';
}

function confirmarFinalizarProducao() {
    const linha = document.getElementById('mfp-linha').value;
    const nome_produto = document.getElementById('mfp-produto').innerText;
    const qtdReal = document.getElementById('mfp-qtd-real').value;
    const local = padronizarTexto(document.getElementById('mfp-local').value) || 'Sede';
    
    // CAPTURANDO OS VALORES DIGITADOS E REMOVENDO A MÁSCARA "R$"
    const custo = parseDinheiro(document.getElementById('mfp-custo').value);
    const preco = parseDinheiro(document.getElementById('mfp-preco').value);
    
    const codigo = document.getElementById('mfp-codigo').value;
    const tipo = document.getElementById('mfp-tipo').value;
    
    document.getElementById('modal-finalizar-producao').style.display = 'none';
    mostrarLoading("Envasando e Enviando..."); 
    
    const msgLog = `✅ Lote Finalizado: ${qtdReal}x [${nome_produto}]. Prateleira: ${local}. Venda: ${fmt(preco)}`; 

    fetch(API_NOVERA, { 
        method: "POST", headers: cabecalhoAuth(), 
        body: JSON.stringify({ 
            usuario: usuarioLogado, 
            acao: "finalizar_producao", 
            linha: linha, 
            nome_produto: nome_produto, 
            tipo: tipo, 
            qtd: qtdReal, 
            custo: fmtPlanilha(custo), 
            preco: fmtPlanilha(preco), 
            codigo: codigo, 
            local: local, 
            log_detalhe: msgLog 
        }) 
    }).then(() => { 
        mostrarAlerta("Pronto!", `Envase concluído. Estoque atualizado!`, "success"); 
        sincronizarDadosUnico(); 
    });
}

function calcularRadarProducao() {
    const radarBox = document.getElementById('radar-producao-box');
    const listaRadar = document.getElementById('lista-radar-itens');
    if (!radarBox || !listaRadar) return;

    let htmlItensCriticos = "";
    let encontrouCriticos = false;
    let totalMacerandoPorProduto = {};

    producaoGlobal.forEach(p => {
        if (p.status === 'Em Andamento') {
            let nomePadrao = padronizarTexto(p.nome_produto);
            totalMacerandoPorProduto[nomePadrao] = (totalMacerandoPorProduto[nomePadrao] || 0) + (parseFloat(p.qtd_prevista) || 0);
        }
    });

    let totalEncomendadoPorProduto = {};
    encomendasGlobal.forEach(enc => {
        if (enc.status === 'Pendente' || enc.status === 'Produzido') {
            let nomeP = padronizarTexto(enc.item);
            totalEncomendadoPorProduto[nomeP] = (totalEncomendadoPorProduto[nomeP] || 0) + (parseInt(enc.qtd) || 0);
        }
    });

    // 🎛️ Variável Dinâmica de Segurança
    let minEstoqueGlob = parseInt(configuracoesGlobais.estoque_minimo) || 5;

    for (let key in estoqueAgrupado) {
        let e = estoqueAgrupado[key];
        let tipoLowerCase = String(e.tipo).toLowerCase();
        if(!tipoLowerCase.includes('perfume')) continue;

        let qtdPrateleira = e.totalQtd;
        let qtdMacerando = totalMacerandoPorProduto[key] || 0;
        let qtdReservada = totalEncomendadoPorProduto[key] || 0;
        
        let estoqueProjetadoLivre = (qtdPrateleira + qtdMacerando) - qtdReservada;

        // 🎛️ Aqui ele escuta o seu comando da nuvem!
        if (estoqueProjetadoLivre < minEstoqueGlob) {
            encontrouCriticos = true;
            let avisoEnc = qtdReservada > 0 ? `<b style="color:#991b1b;">(-${qtdReservada} Reservados)</b>` : '';

            htmlItensCriticos += `
            <div class="radar-item">
                <div>
                    <strong>${e.nome}</strong>
                    <div class="detalhes">Físico: ${qtdPrateleira} | Macerando: ${qtdMacerando} ${avisoEnc}</div>
                    <div class="detalhes" style="color:#991b1b;"><b>Projetado Livre: ${estoqueProjetadoLivre}</b></div>
                </div>
                <button class="radar-btn" onclick="document.getElementById('pr-produto').value='${e.nome}'; document.getElementById('pr-produto').scrollIntoView({behavior: 'smooth', block: 'center'}); setTimeout(() => document.getElementById('pr-qtd').focus(), 400);">🏭 Fabricar</button>
            </div>`;
        }
    }

    if (encontrouCriticos) {
        listaRadar.innerHTML = htmlItensCriticos;
        // Atualiza a frase vermelha no HTML para mostrar qual é o mínimo atual!
        const boxTitulo = radarBox.querySelector('div');
        if(boxTitulo) boxTitulo.innerHTML = `🚨 ALERTA: Abaixo do Mínimo (${minEstoqueGlob} un)`;
        radarBox.style.display = 'block';
    } else {
        radarBox.style.display = 'none';
        listaRadar.innerHTML = "";
    }
}

let limiteEstoqueLista = 40;
let assinaturaFiltrosEstoque = '';
function mostrarMaisEstoque() { limiteEstoqueLista += 60; renderizarEstoque(); }

function renderizarEstoque() {
    const isAdmin = (usuarioCargo === 'Admin');
    const tBusca = document.getElementById('busca-estoque').value.toLowerCase().trim();
    const dFiltroLocal = document.getElementById('f-e-local');
    const localSelecionado = dFiltroLocal ? dFiltroLocal.value.trim() : "";
    const dFiltroGenero = document.getElementById('f-e-genero');
    const generoSelecionado = dFiltroGenero ? dFiltroGenero.value : "";

    const famSelAssinatura = document.getElementById('f-e-familia') ? document.getElementById('f-e-familia').value : '';
    const assinaturaE = [tBusca, localSelecionado, generoSelecionado, famSelAssinatura].join('|');
    if (assinaturaE !== assinaturaFiltrosEstoque) { assinaturaFiltrosEstoque = assinaturaE; limiteEstoqueLista = 40; }

    let totalMacerandoPorProduto = {};
    let dataPrevistaPorProduto = {}; // nome padronizado -> data prevista mais próxima entre os lotes "Em Andamento"
    producaoGlobal.forEach(p => {
        if (p.status === 'Em Andamento') {
            let nomeP = padronizarTexto(p.nome_produto);
            totalMacerandoPorProduto[nomeP] = (totalMacerandoPorProduto[nomeP] || 0) + (parseFloat(p.qtd_prevista) || 0);
            if (!dataPrevistaPorProduto[nomeP] || new Date(p.data_previsao) < new Date(dataPrevistaPorProduto[nomeP])) {
                dataPrevistaPorProduto[nomeP] = p.data_previsao;
            }
        }
    });

    let totalEncomendadoPorProduto = {};
    encomendasGlobal.forEach(enc => {
        if (enc.status === 'Pendente' || enc.status === 'Produzido') {
            let nomeP = padronizarTexto(enc.item);
            totalEncomendadoPorProduto[nomeP] = (totalEncomendadoPorProduto[nomeP] || 0) + (parseInt(enc.qtd) || 0);
        }
    });

    // 🌳 FAMÍLIA OLFATIVA: mapeia as fichas, popula o seletor dedicado e deixa a busca entender também
    const mapaFamiliaBusca = {};
    const mapaFamiliaExibe = {};
    const familiasExistentes = new Set();
    rotulosGlobal.forEach(r => {
        const fR = lerFichaDoRotulo(r);
        if (fR && fR.familia && r.codigo) {
            mapaFamiliaBusca[r.codigo] = String(fR.familia).toLowerCase() + ' ' + normalizarNomeBusca(fR.familia);
            mapaFamiliaExibe[r.codigo] = String(fR.familia).trim();
            String(fR.familia).split(/[·,;]/).map(s => s.trim()).filter(Boolean).forEach(fam => familiasExistentes.add(fam.charAt(0).toUpperCase() + fam.slice(1).toLowerCase()));
        }
    });

    // Seletor auto-populado só com as famílias que realmente existem nas fichas
    const selFamilia = document.getElementById('f-e-familia');
    let familiaSelecionada = '';
    if (selFamilia) {
        familiaSelecionada = selFamilia.value;
        const opcoesFam = [...familiasExistentes].sort((a, b) => a.localeCompare(b));
        selFamilia.innerHTML = '<option value="">🌳 Todas as Famílias Olfativas</option>' + opcoesFam.map(f => `<option value="${f}">${f}</option>`).join('');
        selFamilia.value = familiaSelecionada;
        familiaSelecionada = selFamilia.value; // se a família sumiu das fichas, volta pro "Todas"
        selFamilia.style.display = opcoesFam.length ? 'block' : 'none'; // sem fichas ainda? seletor nem aparece
    }
    const familiaNorm = normalizarNomeBusca(familiaSelecionada);

    let arrEstoque = Object.values(estoqueAgrupado);
    arrEstoque = arrEstoque.filter(e => {
        let passBusca = !tBusca || (e.nome + " " + e.tipo + " " + (e.codigo || "") + " " + (mapaFamiliaBusca[e.codigo] || "")).toLowerCase().includes(tBusca);
        let passLocal = !localSelecionado || (e.locais[localSelecionado] !== undefined && e.locais[localSelecionado] > 0);
        let genE = e.genero ? String(e.genero).toLowerCase() : 'unissex';
        let passGenero = !generoSelecionado || genE === String(generoSelecionado).toLowerCase() || (generoSelecionado === 'Unissex' && genE === '');
        let passFamilia = !familiaNorm || (mapaFamiliaBusca[e.codigo] || '').includes(familiaNorm);
        return passBusca && passLocal && passGenero && passFamilia;
    });
    
    arrEstoque.sort((a, b) => { 
        let qA = localSelecionado ? (a.locais[localSelecionado] || 0) : a.totalQtd; 
        let qB = localSelecionado ? (b.locais[localSelecionado] || 0) : b.totalQtd; 
        if (qA > 0 && qB <= 0) return -1; 
        if (qA <= 0 && qB > 0) return 1; 
        return String(b.codigo||"").localeCompare(String(a.codigo||"")); 
    }); 

    const lista = document.getElementById('lista-estoque-cards'); 
    if(arrEstoque.length === 0) { 
        lista.innerHTML = "<p style='text-align:center; color:#999;'>Estoque vazio ou não encontrado.</p>"; 
        document.getElementById('est-total-itens').innerText = "0"; 
        document.getElementById('est-valor-total').innerText = "R$ 0,00"; 
        return; 
    } 

    let html = "", somaItens = 0, somaValor = 0; 
    let gruposEstoque = {};
    
    // 🎛️ O MÍNIMO DE ESTOQUE AGORA VEM DA NUVEM (Variável Dinâmica)
    let minEstoqueGlob = parseInt(configuracoesGlobais.estoque_minimo) || 5;

    arrEstoque.forEach(e => { 
        const qtdExibicao = localSelecionado ? (e.locais[localSelecionado] || 0) : e.totalQtd; 
        const precoNum = parseDinheiro(e.preco); 
        somaItens += qtdExibicao; 
        somaValor += (qtdExibicao * precoNum); 
        
        let tipoKey = (e.tipo || 'Sem Categoria').toUpperCase();
        if(!gruposEstoque[tipoKey]) gruposEstoque[tipoKey] = { itens: [], qtdGrupo: 0, valorGrupo: 0 };
        
        gruposEstoque[tipoKey].qtdGrupo += qtdExibicao;
        gruposEstoque[tipoKey].valorGrupo += (qtdExibicao * precoNum);

        let opacidade = qtdExibicao <= 0 ? "opacity: 0.65; filter: grayscale(50%);" : ""; 
        let urlPri = melhorFotoUrl(e.foto) || 'logo.png';
        let codigoBadge = e.codigo ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px;">${e.codigo}</span>` : ''; 
        
        let corFundoGen = "#f3f4f6", corTextoGen = "#4b5563";
        let gLow = String(e.genero).toLowerCase();
        if(gLow === "masculino") { corFundoGen = "#e0f2fe"; corTextoGen = "#0369a1"; }
        else if(gLow === "feminino") { corFundoGen = "#fce7f3"; corTextoGen = "#be185d"; }
        else if(gLow === "infantil") { corFundoGen = "#dcfce7"; corTextoGen = "#166534"; }
        let badgeGenero = e.genero ? `<span style="background:${corFundoGen}; color:${corTextoGen}; padding:2px 6px; border-radius:4px; font-size:0.6rem; font-weight:800; text-transform:uppercase; margin-left:5px;">${e.genero}</span>` : '';

        let qtdMacerando = totalMacerandoPorProduto[padronizarTexto(e.nome)] || 0;
        let qtdEncomendada = totalEncomendadoPorProduto[padronizarTexto(e.nome)] || 0;
        let qtdLivre = qtdExibicao - qtdEncomendada;
        let qtdProjetada = qtdLivre + qtdMacerando;
        
        let corCustoVal = "var(--brand-dark)";
        let htmlSaudeEstoque = "";
        
        // 🎛️ A regra se adapta ao que você salvar lá na aba de Configurações
        if (qtdProjetada < minEstoqueGlob && qtdLivre > 0) {
            corCustoVal = "#991b1b"; htmlSaudeEstoque = `<span class="badge-estoque badge-critico" style="margin:0;">⚠️ Crítico (< ${minEstoqueGlob})</span>`;
        } else if (qtdLivre < minEstoqueGlob && qtdMacerando > 0) {
            corCustoVal = "#a16207";
            const dataPrevProduto = dataPrevistaPorProduto[padronizarTexto(e.nome)];
            let txtLoteVindo = '⏳ Lote Vindo';
            if (dataPrevProduto) {
                const [anoLv, mesLv, diaLv] = dataPrevProduto.split('-');
                const hojeLv = new Date(); hojeLv.setHours(0, 0, 0, 0);
                const diffLv = Math.round((new Date(anoLv, mesLv - 1, diaLv) - hojeLv) / 86400000);
                if (diffLv <= 0) txtLoteVindo = '⏳ Chega hoje';
                else if (diffLv === 1) txtLoteVindo = '⏳ Chega amanhã';
                else txtLoteVindo = `⏳ Chega em ${diffLv}d`;
            }
            htmlSaudeEstoque = `<span class="badge-estoque badge-produzindo" style="margin:0;">${txtLoteVindo}</span>`;
        } else if (qtdLivre <= 0) {
            corCustoVal = "#991b1b"; htmlSaudeEstoque = `<span class="badge-estoque badge-critico" style="margin:0;">🚫 Sem Estoque Livre</span>`;
        } else {
            corCustoVal = "#166534"; htmlSaudeEstoque = `<span class="badge-estoque badge-saudavel" style="margin:0;">✔️ Seguro</span>`;
        }
        
        // Vendedor não precisa de leitura de gestão ("Seguro"/"Crítico" é assunto de reposição) —
        // pra ele ficam só os avisos úteis de venda: "Chega em Xd" e "Sem Estoque Livre"
        if (!isAdmin && (htmlSaudeEstoque.includes('Crítico') || htmlSaudeEstoque.includes('Seguro'))) htmlSaudeEstoque = '';

        let htmlInfoProducao = qtdMacerando > 0 ? `<p style="font-size: 0.65rem; color: #a16207; font-weight: 700; margin: 3px 0 0 0;">Macerando: +${qtdMacerando}</p>` : "";
        let badgeEncomenda = qtdEncomendada > 0 ? `<div style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:6px; font-size:0.7rem; font-weight:bold; margin-top:8px; border:1px solid #fca5a5; display:inline-block;">📦 ${qtdEncomendada} Reservado(s)</div>` : '';

        let locaisHtml = `<div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px;">`;
        for(let loc in e.locais) {
            if(e.locais[loc] > 0) { const idadeLoc = isAdmin ? badgeIdadeEstoque(e.locaisDatas ? e.locaisDatas[loc] : null) : ''; locaisHtml += `<span style="background:#f3f4f6; color:#4b5563; padding:3px 8px; border-radius:6px; font-size:0.65rem; font-weight:700; border:1px solid #e5e7eb;">📍 ${loc}: <b style="color:var(--primary-dark);">${e.locais[loc]}</b>${idadeLoc}</span>`; }
        }
        locaisHtml += `</div>`;
        if (qtdExibicao <= 0) locaisHtml = "";
        
        const nomeEncode = encodeURIComponent(e.nome); 
        const txtCusto = isAdmin ? `<p style="margin:0; font-size:0.75rem; color:#888;">Custo: ${safeFmt(e.custo)}</p>` : '';
        const btnEditarEst = isAdmin ? `<button class="btn-acao" style="width: 36px; height: 36px; margin-left: 10px;" onclick="abrirModalEditarEstoque('${nomeEncode}')" title="Editar Distribução">✏️</button>` : '';
        const btnTransferirEst = (isAdmin && qtdExibicao > 0) ? `<button class="btn-acao" style="width: 36px; height: 36px; margin-left: 6px; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;" onclick="abrirModalTransferirEstoque('${nomeEncode}')" title="Transferir Entre Locais">🔄</button>` : '';

        gruposEstoque[tipoKey].itens.push(`
        <div class="rotulo-card card-estoque-list" style="${opacidade}">
            <div class="prod-info-main">
                <img src="${urlPri}" onerror="this.src='logo.png';" class="list-img" onclick="abrirModalImagem(this.src)">
                <div class="e-nome-block">
                    <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; color: var(--brand-dark);">${codigoBadge}${e.nome} ${badgeGenero}${mapaFamiliaExibe[e.codigo] ? `<span style="background:#f6ebef; color:#a86f88; padding:2px 6px; border-radius:4px; font-size:0.6rem; margin-left:5px; text-transform:uppercase; font-weight:800; vertical-align: middle;">🌳 ${mapaFamiliaExibe[e.codigo]}</span>` : ''}</h4>
                    <div style="display:flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <p style="margin:0; font-size:0.8rem; color:var(--primary); font-weight:700;">Venda: ${safeFmt(e.preco)}</p>
                        ${txtCusto}
                    </div>
                    ${badgeEncomenda}
                </div>
            </div>
            
            <div class="e-locais-block">${locaisHtml}</div>

            <div class="prod-actions">
                <div style="text-align: right;">
                    <div style="display:flex; justify-content: flex-end;">${htmlSaudeEstoque}</div>
                    ${isAdmin ? `<div style="font-size:0.7rem; color:#888; margin-top:5px;">Físico Total: ${qtdExibicao}</div>` : ''}
                    <div class="custo-val" style="color:${corCustoVal}; font-size: 1.1rem; font-weight:900;">${isAdmin ? 'Livre' : 'Disponível'}: ${qtdLivre} un</div>
                    ${htmlInfoProducao}
                </div>
                <div style="display:flex; align-items:center;">
                    ${btnTransferirEst}
                    ${btnEditarEst}
                </div>
            </div>
        </div>`);
    }); 

    let tiposOrdenados = Object.keys(gruposEstoque).sort();
    let eItensRender = 0, eGruposOcultos = 0, eItensOcultos = 0;
    for (const tipoChave of tiposOrdenados) {
        if (eItensRender >= limiteEstoqueLista) { eGruposOcultos++; eItensOcultos += gruposEstoque[tipoChave].itens.length; continue; }
        let tagValor = isAdmin ? ` | 💰 ${fmt(gruposEstoque[tipoChave].valorGrupo)}` : '';
        html += `<div class="separador-data div-futuro" style="background: var(--primary-dark); margin: 25px 0 10px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                    <span>📦 CATEGORIA: ${tipoChave}</span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.3);">ESTOQUE: ${gruposEstoque[tipoChave].qtdGrupo} un ${tagValor}</span>
                 </div>`;
        html += `<div class="grid-estoque-grupo">${gruposEstoque[tipoChave].itens.join('')}</div>`;
        eItensRender += gruposEstoque[tipoChave].itens.length;
    }
    if (eItensOcultos > 0) {
        html += `<button class="btn-salvar" style="background:#fff; color:var(--primary-dark); border:2px dashed var(--primary); box-shadow:none; margin-top:20px; font-size:0.85rem;" onclick="mostrarMaisEstoque()">⬇️ Mostrar mais ${eGruposOcultos} categoria(s) — ${eItensOcultos} produto(s)</button>`;
    }

    lista.innerHTML = html;
    document.getElementById('est-total-itens').innerText = somaItens; 
    if(document.getElementById('est-valor-total')) { document.getElementById('est-valor-total').innerText = isAdmin ? fmt(somaValor) : '---'; }
}

// ==========================================
// 🐌 ESTOQUE PARADO + BÔNUS DE COMISSÃO
// ==========================================
let estoqueParadoAtual = []; // lista exibida agora, pra ligar os botões de bônus ao produto certo pelo índice

function ajustarFiltroDiasParado(delta) {
    const input = document.getElementById('ep-filtro-dias');
    if (!input) return;
    let val = parseInt(input.value) || limiteDiasParadoConfigurado();
    input.value = Math.max(1, val + delta);
    renderizarEstoqueParado();
}

function renderizarBonusAtivos() {
    const cont = document.getElementById('lista-bonus-ativos');
    if (!cont) return;

    if (!bonusComissaoGlobal.length && !descontosProdutoGlobal.length) {
        cont.innerHTML = `<p style='color:#999; font-size:0.8rem; margin: 5px 0 0 0;'>Nenhum incentivo ativo no momento. Defina um 🔥 bônus ou 💸 desconto nos produtos parados abaixo. 👇</p>`;
        return;
    }

    let html = '';
    [...bonusComissaoGlobal].sort((a, b) => (parseFloat(b.bonusPercentual) || 0) - (parseFloat(a.bonusPercentual) || 0)).forEach(b => {
        const prod = estoqueAgrupado[padronizarTexto(b.nomeProduto)];
        const qtd = prod ? (prod.totalQtd || 0) : 0;
        const codigoBadge = prod && prod.codigo ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px;">${prod.codigo}</span>` : '';
        const avisoZerado = qtd <= 0 ? ` <span style="color:#b91c1c; font-weight:800;">(estoque zerou — pode remover!)</span>` : '';
        html += `
        <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <div style="min-width:0;">
                <span style="font-size:0.85rem; font-weight:800; color:#92400e;">🔥 +${b.bonusPercentual}%</span>
                <span style="font-size:0.82rem; color:var(--brand-dark); font-weight:700; margin-left:6px;">${codigoBadge}${b.nomeProduto}</span>
                <span style="font-size:0.7rem; color:#a16207; display:block; margin-top:2px;">📦 ${qtd} un no estoque${avisoZerado}</span>
            </div>
            <button class="btn-acao" style="background:#fee2e2; color:#991b1b; border-color:#fecaca; width:36px; height:36px; flex:0 0 auto;" onclick="removerBonusComissao('${encodeURIComponent(b.nomeProduto)}')" title="Remover bônus">🗑️</button>
        </div>`;
    });

    // 💸 Descontos ativos: a alavanca que PUXA o cliente (catálogo, PDF e aviso pra equipe)
    [...descontosProdutoGlobal].sort((a, b) => (parseFloat(b.percentual) || 0) - (parseFloat(a.percentual) || 0)).forEach(dd => {
        const prod = estoqueAgrupado[padronizarTexto(dd.nomeProduto)];
        const qtd = prod ? (prod.totalQtd || 0) : 0;
        const precoCheio = prod ? (parseFloat(prod.preco) || 0) : 0;
        const precoPromo = precoCheio > 0 ? precoCheio * (1 - dd.percentual / 100) : 0;
        const codigoBadge = prod && prod.codigo ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px;">${prod.codigo}</span>` : '';
        const txtValidade = dd.validade ? ` · ⏰ até ${dd.validade.split('-').reverse().join('/')}` : ' · sem prazo';
        html += `
        <div style="background:#e8f5e9; border:1px solid #bbf7d0; border-radius:8px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <div style="min-width:0;">
                <span style="font-size:0.85rem; font-weight:800; color:#166534;">💸 -${dd.percentual}%</span>
                <span style="font-size:0.82rem; color:var(--brand-dark); font-weight:700; margin-left:6px;">${codigoBadge}${dd.nomeProduto}</span>
                <span style="font-size:0.7rem; color:#15803d; display:block; margin-top:2px;">${precoCheio > 0 ? `de <s>${fmt(precoCheio)}</s> por <b>${fmt(precoPromo)}</b>` : ''}${txtValidade} · 📦 ${qtd} un</span>
            </div>
            <button class="btn-acao" style="background:#fee2e2; color:#991b1b; border-color:#fecaca; width:36px; height:36px; flex:0 0 auto;" onclick="removerDescontoProduto('${encodeURIComponent(dd.nomeProduto)}')" title="Remover desconto">🗑️</button>
        </div>`;
    });
    cont.innerHTML = html;
}

function renderizarEstoqueParado() {
    renderizarBonusAtivos();

    const container = document.getElementById('lista-estoque-parado');
    if (!container) return;

    const inputFiltro = document.getElementById('ep-filtro-dias');
    // Só preenche o padrão quando o campo NÃO está em edição — senão, ao apagar pra digitar, o valor antigo volta sozinho
    if (inputFiltro && !inputFiltro.value && document.activeElement !== inputFiltro) inputFiltro.value = limiteDiasParadoConfigurado();
    const diasFiltro = parseInt(inputFiltro ? inputFiltro.value : limiteDiasParadoConfigurado()) || limiteDiasParadoConfigurado();

    const mapaBonus = {};
    bonusComissaoGlobal.forEach(b => mapaBonus[b.nomeProduto] = b);
    const mapaDescEP = {};
    descontosProdutoGlobal.forEach(dd => mapaDescEP[dd.nomeProduto] = dd);

    let itens = [];
    for (let key in estoqueAgrupado) {
        const e = estoqueAgrupado[key];
        if (e.totalQtd <= 0) continue;

        // Pega o "pior caso": o local com mais dias sem reposição entre os que têm estoque
        let piorDias = null;
        for (let loc in e.locais) {
            if (e.locais[loc] <= 0) continue;
            const dias = diasParadoDesde(e.locaisDatas[loc]);
            if (dias !== null && (piorDias === null || dias > piorDias)) piorDias = dias;
        }
        if (piorDias === null || piorDias < diasFiltro) continue;

        itens.push({ nome: e.nome, codigo: e.codigo, qtd: e.totalQtd, preco: parseFloat(e.preco) || 0, dias: piorDias, bonus: mapaBonus[e.nome] || null, desconto: mapaDescEP[e.nome] || null });
    }

    itens.sort((a, b) => b.dias - a.dias);
    estoqueParadoAtual = itens;

    if (itens.length === 0) {
        container.innerHTML = `<p style='text-align:center; color:#999; font-size:0.85rem; padding: 20px 0;'>✨ Nenhum produto parado há mais de ${diasFiltro} dias. Tudo girando bem!</p>`;
        return;
    }

    let html = '';
    itens.forEach((item, i) => {
        const codigoBadge = item.codigo ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px;">${item.codigo}</span>` : '';
        const corDias = item.dias >= diasFiltro * 2 ? '#991b1b' : '#92400e';
        const iconeDias = item.dias >= diasFiltro * 2 ? '🐌' : '⏳';

        // 🔥 Arma 1: bônus de comissão (EMPURRA pelo vendedor)
        let blocoBonus;
        if (item.bonus) {
            blocoBonus = `
            <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:10px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <span style="font-size:0.8rem; font-weight:800; color:#92400e;">🔥 Bônus ativo: +${item.bonus.bonusPercentual}% de comissão</span>
                <button class="btn-acao" style="background:#fee2e2; color:#991b1b; border-color:#fecaca; width:36px; height:36px;" onclick="removerBonusComissao('${encodeURIComponent(item.nome)}')" title="Remover bônus">🗑️</button>
            </div>`;
        } else {
            blocoBonus = `
            <div style="display:flex; gap:8px; margin-top:10px; align-items:center; flex-wrap:wrap;">
                <span style="font-size:0.9rem;">🔥</span>
                <input type="number" id="ep-bonus-input-${i}" placeholder="Ex: 2" min="0.1" step="0.1" style="flex:1 1 70px; width:auto; min-width:70px; padding:8px; border-radius:8px; border:1px solid var(--border-color); box-sizing:border-box;">
                <span style="font-size:0.75rem; color:#888; white-space:nowrap;">% bônus vendedor</span>
                <button class="btn-salvar" style="margin:0; padding:8px 14px; font-size:0.75rem; background:#0369a1; box-shadow:0 4px 0 #075985; white-space:nowrap; width:auto; flex:0 0 auto;" onclick="salvarBonusComissao(${i})">✔️ Definir</button>
            </div>`;
        }

        // 💸 Arma 2: desconto pro cliente (PUXA pelo preço no catálogo/PDF)
        let blocoDesconto;
        if (item.desconto) {
            const precoPromoItem = item.preco > 0 ? item.preco * (1 - item.desconto.percentual / 100) : 0;
            const validadeTxt = item.desconto.validade ? ` até ${item.desconto.validade.split('-').reverse().join('/')}` : '';
            blocoDesconto = `
            <div style="background:#e8f5e9; border:1px solid #bbf7d0; border-radius:8px; padding:10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <span style="font-size:0.8rem; font-weight:800; color:#166534;">💸 Desconto ativo: -${item.desconto.percentual}%${item.preco > 0 ? ` (de <s>${fmt(item.preco)}</s> por ${fmt(precoPromoItem)})` : ''}${validadeTxt}</span>
                <button class="btn-acao" style="background:#fee2e2; color:#991b1b; border-color:#fecaca; width:36px; height:36px;" onclick="removerDescontoProduto('${encodeURIComponent(item.nome)}')" title="Remover desconto">🗑️</button>
            </div>`;
        } else {
            blocoDesconto = `
            <div style="display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;">
                <span style="font-size:0.9rem;">💸</span>
                <input type="number" id="ep-desc-input-${i}" placeholder="Ex: 15" min="1" max="89" step="1" oninput="previewDescontoParado(${i})" style="flex:1 1 60px; width:auto; min-width:60px; padding:8px; border-radius:8px; border:1px solid var(--border-color); box-sizing:border-box;">
                <span style="font-size:0.75rem; color:#888; white-space:nowrap;">% off</span>
                <input type="date" id="ep-desc-val-${i}" title="Validade (opcional — vazio = sem prazo)" style="flex:1 1 110px; width:auto; min-width:110px; padding:7px; border-radius:8px; border:1px solid var(--border-color); box-sizing:border-box; font-size:0.75rem;">
                <button class="btn-salvar" style="margin:0; padding:8px 14px; font-size:0.75rem; background:#166534; box-shadow:0 4px 0 #14532d; white-space:nowrap; width:auto; flex:0 0 auto;" onclick="salvarDescontoProduto(${i})">✔️ Ativar</button>
                <span id="ep-desc-preview-${i}" style="font-size:0.7rem; font-weight:800; color:#15803d; width:100%;"></span>
            </div>`;
        }

        html += `
        <div class="rotulo-card" style="flex-direction:column; align-items:stretch; border-left: 5px solid ${corDias}; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                <h4 style="margin:0; font-size:0.9rem; color:var(--brand-dark);">${codigoBadge}${item.nome}</h4>
                <span style="color:${corDias}; font-weight:900; font-size:0.85rem;">${iconeDias} há ${item.dias} dias</span>
            </div>
            <p style="margin:5px 0 0 0; font-size:0.75rem; color:#666;">📦 Estoque total: <b>${item.qtd} un</b>${item.preco > 0 ? ` · 💰 ${fmt(item.preco)}` : ''}</p>
            ${blocoBonus}
            ${blocoDesconto}
        </div>`;
    });

    container.innerHTML = html;
}

function salvarBonusComissao(index) {
    const item = estoqueParadoAtual[index];
    if (!item) return;
    const inputEl = document.getElementById('ep-bonus-input-' + index);
    const bonusPct = parseFloat(inputEl.value);
    if (isNaN(bonusPct) || bonusPct <= 0) return mostrarAlerta("Atenção", "Digite um percentual de bônus válido, maior que zero.", "warning");

    mostrarLoading("Definindo bônus...");
    const msgLog = `🔥 Definiu bônus de comissão: +${bonusPct}% em [${item.nome}] (parado há ${item.dias} dias)`;
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_bonus_comissao", nome_produto: item.nome, bonus_percentual: bonusPct, log_detalhe: msgLog }) })
    .then(r => r.json())
    .then(res => {
        if (res.sucesso) { mostrarAlerta("Bônus Definido!", `+${bonusPct}% de comissão em ${item.nome}.`, "success"); sincronizarDadosUnico(); }
        else mostrarAlerta("Erro", res.erro || "Falha ao definir bônus.", "error");
    })
    .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => ocultarLoading());
}

// 💸 Preview ao vivo: digita a % e já vê "de R$50 por R$42,50" antes de ativar
function previewDescontoParado(index) {
    const item = estoqueParadoAtual[index];
    const alvo = document.getElementById('ep-desc-preview-' + index);
    if (!item || !alvo) return;
    const pct = parseFloat(document.getElementById('ep-desc-input-' + index).value);
    alvo.innerText = (!isNaN(pct) && pct > 0 && pct < 90 && item.preco > 0)
        ? `→ de ${fmt(item.preco)} por ${fmt(item.preco * (1 - pct / 100))}`
        : '';
}

function salvarDescontoProduto(index) {
    const item = estoqueParadoAtual[index];
    if (!item) return;
    const pct = parseFloat(document.getElementById('ep-desc-input-' + index).value);
    if (isNaN(pct) || pct <= 0 || pct >= 90) return mostrarAlerta("Atenção", "Digite um percentual de desconto entre 1 e 89.", "warning");
    const validade = document.getElementById('ep-desc-val-' + index).value || '';

    const precoPromo = item.preco > 0 ? ` (de ${fmt(item.preco)} por ${fmt(item.preco * (1 - pct / 100))})` : '';
    mostrarLoading("Ativando desconto...");
    const msgLog = `💸 Definiu desconto de -${pct}% em [${item.nome}]${validade ? ` até ${validade}` : ''} (parado há ${item.dias} dias)`;
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_desconto_produto", nome_produto: item.nome, percentual: pct, validade: validade, log_detalhe: msgLog }) })
    .then(r => r.json())
    .then(res => {
        if (res.sucesso) { mostrarAlerta("Desconto Ativo!", `-${pct}% em ${item.nome}${precoPromo}. Já vale no catálogo online, no PDF e a equipe foi avisada na tela de vendas.${validade ? ` Expira sozinho em ${validade.split('-').reverse().join('/')}.` : ''}`, "success"); sincronizarDadosUnico(); }
        else mostrarAlerta("Erro", res.erro || "Falha ao ativar o desconto.", "error");
    })
    .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => ocultarLoading());
}

function removerDescontoProduto(nomeEncoded) {
    const nome = decodeURIComponent(nomeEncoded);
    abrirConfirmacao("Remover Desconto?", `O desconto de "${nome}" será removido — catálogo online e PDF voltam ao preço cheio na hora.`, "💸", "#A05252", "#803f3f", "🗑️ Remover", () => {
        mostrarLoading("Removendo desconto...");
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "remover_desconto_produto", nome_produto: nome, log_detalhe: `💸 Removeu o desconto de [${nome}]` }) })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) { mostrarAlerta("Removido!", "Desconto removido — preço cheio de volta.", "success"); sincronizarDadosUnico(); }
            else mostrarAlerta("Erro", res.erro || "Falha ao remover.", "error");
        })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
    });
}

function removerBonusComissao(nomeEncoded) {
    const nome = decodeURIComponent(nomeEncoded);
    abrirConfirmacao("Remover Bônus?", `O bônus de comissão de "${nome}" será removido. Vendas futuras voltam a valer só a comissão normal.`, "🗑️", "#A05252", "#803f3f", "🗑️ Remover", () => {
        mostrarLoading("Removendo bônus...");
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "remover_bonus_comissao", nome_produto: nome, log_detalhe: `🔥 Removeu bônus de comissão de [${nome}]` }) })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) { mostrarAlerta("Removido!", "Bônus de comissão removido.", "success"); sincronizarDadosUnico(); }
            else mostrarAlerta("Erro", res.erro || "Falha ao remover.", "error");
        })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
    });
}

function abrirModalEditarEstoque(nomeEncoded) { const nomeDecoded = decodeURIComponent(nomeEncoded); const e = estoqueAgrupado[padronizarTexto(nomeDecoded)]; if (!e) return; document.getElementById('edit-e-nome').value = e.nome; document.getElementById('edit-e-tipo').value = e.tipo; document.getElementById('edit-e-custo').value = safeFmt(e.custo); document.getElementById('edit-e-preco').value = safeFmt(e.preco); document.getElementById('edit-e-codigo').value = e.codigo || ''; let fotos = e.foto ? e.foto.split(',') : []; document.getElementById('edit-e-img-preview').src = fotos[0] || 'logo.png'; document.getElementById('img-original-preview').src = fotos[0] || 'logo.png'; document.getElementById('edit-e-foto-antiga').value = e.foto || ''; document.getElementById('edit-e-foto-nova').value = ''; document.getElementById('ai-preview-box').style.display = 'none'; const container = document.getElementById('edit-e-locais-container'); container.innerHTML = ''; for (let loc in e.locais) { adicionarLinhaLocal(loc, e.locais[loc]); } if (Object.keys(e.locais).length === 0) adicionarLinhaLocal('Sede', 0); document.getElementById('modal-editar-estoque').style.display = 'flex'; }
function adicionarLinhaLocal(loc = '', qtd = 0) { const div = document.createElement('div'); div.className = 'row edit-local-row'; div.style.marginBottom = '5px'; div.innerHTML = `<div class="col"><input type="text" class="edit-l-nome" value="${loc}" list="lista-locais-estoque" placeholder="Ex: Sede, Casa..."></div><div class="col" style="flex:0.4"><input type="number" class="edit-l-qtd" value="${qtd}" min="0"></div><button class="btn-acao" style="margin-top:2px; height: 46px; background:#fff0f6; border-color:#fce7f3; color:#be185d;" onclick="this.parentElement.remove()" title="Remover Local">🗑️</button>`; document.getElementById('edit-e-locais-container').appendChild(div); }

async function salvarEdicaoEstoque() { 
    const fileInput = document.getElementById('edit-e-foto-nova'); let fotoFinal = document.getElementById('edit-e-foto-antiga').value; const escolha = document.getElementById('escolha-foto-ia').value; 
    if (escolha === 'ia') { 
        mostrarLoading("Enviando IA..."); 
        try { const imgSrc = document.getElementById('ai-img-result').src; const response = await fetch(imgSrc); const blob = await response.blob(); const file = new File([blob], "produto_ia.jpg", { type: "image/jpeg" }); if (!KEY_IMGBB && !TOKEN_ONIONSYS) throw new Error("Chaves ausentes."); fotoFinal = await uploadDuplo(file); } catch (e) { ocultarLoading(); return mostrarAlerta("Erro", "Falha ao salvar foto da IA.", "error"); } 
    } else if (fileInput.files.length > 0 && escolha === 'original') { 
        mostrarLoading("Enviando Imagem..."); 
        try { const blob = await comprimirImagem(fileInput.files[0], 800, 800, 0.8); if (!KEY_IMGBB && !TOKEN_ONIONSYS) throw new Error("Chaves ausentes."); fotoFinal = await uploadDuplo(blob); } catch (err) { ocultarLoading(); return mostrarAlerta("Erro", err.message, "error"); } 
    } 
    const nome = document.getElementById('edit-e-nome').value; const tipo = document.getElementById('edit-e-tipo').value; const c = parseDinheiro(document.getElementById('edit-e-custo').value); const p = parseDinheiro(document.getElementById('edit-e-preco').value); const cod = document.getElementById('edit-e-codigo').value; const rows = document.querySelectorAll('.edit-local-row'); const distribuicao = []; rows.forEach(r => { let loc = r.querySelector('.edit-l-nome').value.trim(); let q = parseFloat(r.querySelector('.edit-l-qtd').value) || 0; if (loc) distribuicao.push({ local: loc, qtd: q }); }); const oldE = estoqueAgrupado[padronizarTexto(nome)]; const oldTotal = oldE ? oldE.totalQtd : 0; const newTotal = distribuicao.reduce((sum, d) => sum + d.qtd, 0); const descLocais = distribuicao.length > 0 ? distribuicao.map(d => `${d.qtd} no(a) ${d.local}`).join(' e ') : "Estoque Zerado"; const msgLog = `📦 Ajuste [${nome}]: Tinha ${oldTotal} un -> Ficou com ${newTotal} un. (${descLocais})`; 
    document.getElementById('modal-editar-estoque').style.display = 'none'; 
    mostrarLoading("Atualizando Servidor..."); 
    try { 
        const py = { usuario: usuarioLogado, acao: "atualizar_estoque_multilocal", nome: nome, tipo: tipo, custo: fmtPlanilha(c), preco: fmtPlanilha(p), foto: fotoFinal, codigo: cod, distribuicao: distribuicao, log_detalhe: msgLog };
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(py) }).then(() => { mostrarAlerta("Atualizado!", "Estoque Multi-Local ajustado.", "success"); sincronizarDadosUnico(); });
    } catch (e) { }
}

// ==========================================
// 🔄 TRANSFERIR ESTOQUE ENTRE LOCAIS (rápido, sem reescrever a distribuição inteira)
// ==========================================
function abrirModalTransferirEstoque(nomeEncoded) {
    const nomeDecoded = decodeURIComponent(nomeEncoded);
    const e = estoqueAgrupado[padronizarTexto(nomeDecoded)];
    if (!e) return;

    const locaisComEstoque = Object.keys(e.locais).filter(l => e.locais[l] > 0);
    if (locaisComEstoque.length === 0) return mostrarAlerta("Aviso", "Esse produto não tem estoque disponível em nenhum local.", "warning");

    document.getElementById('modal-transferir-estoque').dataset.produto = e.nome;
    document.getElementById('ts-nome-produto').innerText = e.nome;

    // Locais conhecidos: os que já têm esse produto + os cadastrados no sistema (pra permitir criar uma distribuição nova)
    const todosLocais = new Set([...locaisComEstoque, ...estoqueGlobal.map(x => x.local ? x.local.trim() : 'Sede').filter(Boolean)]);

    const selOrigem = document.getElementById('ts-local-origem');
    selOrigem.innerHTML = locaisComEstoque.map(l => `<option value="${l}">${l} (${e.locais[l]} un)</option>`).join('');

    const selDestino = document.getElementById('ts-local-destino');
    selDestino.innerHTML = [...todosLocais].sort().map(l => `<option value="${l}">${l}</option>`).join('');
    // Sugere um destino diferente da origem, se houver mais de um local
    if (todosLocais.size > 1 && selDestino.options[0].value === selOrigem.value) selDestino.selectedIndex = 1;

    document.getElementById('ts-qtd').value = 1;
    atualizarSaldoOrigemTransferencia();
    document.getElementById('modal-transferir-estoque').style.display = 'flex';
}

function atualizarSaldoOrigemTransferencia() {
    const nome = document.getElementById('modal-transferir-estoque').dataset.produto;
    const e = estoqueAgrupado[padronizarTexto(nome)];
    const origem = document.getElementById('ts-local-origem').value;
    const saldo = e && e.locais[origem] ? e.locais[origem] : 0;
    document.getElementById('ts-saldo-origem').innerText = `Disponível em ${origem}: ${saldo} un`;
    document.getElementById('ts-qtd').max = saldo;
}

let transferenciaEmAndamento = false; // trava contra clique duplo
function confirmarTransferirEstoque() {
    if (transferenciaEmAndamento) return;
    const nome = document.getElementById('modal-transferir-estoque').dataset.produto;
    const localOrigem = document.getElementById('ts-local-origem').value;
    const localDestino = document.getElementById('ts-local-destino').value;
    const qtd = parseFloat(document.getElementById('ts-qtd').value) || 0;

    if (qtd <= 0) return mostrarAlerta("Atenção", "Informe uma quantidade válida.", "warning");
    if (localOrigem === localDestino) return mostrarAlerta("Atenção", "Escolha dois locais diferentes.", "warning");

    transferenciaEmAndamento = true;
    const btn = document.getElementById('btn-confirmar-transferencia');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ TRANSFERINDO...'; }
    mostrarLoading("Transferindo Estoque...");

    const msgLog = `🔄 Transferiu ${qtd}x [${nome}]: ${localOrigem} → ${localDestino}`;
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "transferir_estoque", nome: nome, qtd: qtd, local_origem: localOrigem, local_destino: localDestino, log_detalhe: msgLog }) })
    .then(r => r.json())
    .then(res => {
        if (res.sucesso) {
            document.getElementById('modal-transferir-estoque').style.display = 'none';
            mostrarAlerta("Transferido!", `${qtd}x movido(s) de ${localOrigem} para ${localDestino}.`, "success");
            sincronizarDadosUnico();
        } else {
            mostrarAlerta("Erro", res.erro || "Não foi possível transferir.", "error");
        }
    })
    .catch(e => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => {
        ocultarLoading();
        transferenciaEmAndamento = false;
        if (btn) { btn.disabled = false; btn.innerHTML = '✅ Confirmar Transferência'; }
    });
}

function abrirModalCatalogo() { const tipos = new Set(estoqueGlobal.map(e => padronizarTexto(e.tipo)).filter(t => t)); let html = `<label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; margin-bottom:10px; cursor:pointer;"><input type="checkbox" id="cat-todas" onchange="toggleTodasCategorias(this)" checked style="width:16px; height:16px; flex-shrink:0;"> <strong>Selecionar Todas</strong></label><div style="border-top:1px dashed #E8DDE1; margin-bottom:10px;"></div>`;[...tipos].forEach(t => { let nomeBonito = t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); html += `<label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; margin-bottom:8px; cursor:pointer;"><input type="checkbox" class="chk-cat-tipo" value="${t}" checked onchange="verificarCategorias()" style="width:16px; height:16px; flex-shrink:0;"> ${nomeBonito}</label>`; }); document.getElementById('cat-checkbox-container').innerHTML = html; const listaProdCat = document.getElementById('cat-lista-produtos'); if (listaProdCat) { listaProdCat.style.display = 'none'; document.getElementById('cat-produtos-rows').innerHTML = ''; document.getElementById('cat-prod-busca').value = ''; document.getElementById('cat-ajuste-pct').value = ''; const vFixoEl = document.getElementById('cat-valor-fixo'); if (vFixoEl) vFixoEl.value = ''; } document.getElementById('modal-gerar-catalogo').style.display = 'flex'; }
function toggleTodasCategorias(source) { const checkboxes = document.querySelectorAll('.chk-cat-tipo'); checkboxes.forEach(cb => cb.checked = source.checked); }
function verificarCategorias() { const checkboxes = document.querySelectorAll('.chk-cat-tipo'); const todas = document.getElementById('cat-todas'); const marcadas = document.querySelectorAll('.chk-cat-tipo:checked').length; todas.checked = (marcadas === checkboxes.length); }

// ==========================================
// 🎯 CATÁLOGO SOB MEDIDA: escolher produtos a dedo e (Diretoria) preços próprios
// Vale pro PDF e pro Link Online. Nada disso mexe nos preços reais do sistema.
// ==========================================
function montarListaProdutosCatalogo() {
    const box = document.getElementById('cat-lista-produtos');
    if (box.style.display !== 'none') { box.style.display = 'none'; return; }

    // Preserva o que já estava marcado/digitado se a pessoa fechar e reabrir a lista
    const estadoAnterior = {};
    document.querySelectorAll('.cat-prod-row').forEach(row => {
        const inpAnt = row.querySelector('.inp-cat-preco');
        estadoAnterior[row.dataset.nome] = { marcado: row.querySelector('.chk-cat-prod').checked, preco: inpAnt ? inpAnt.value : '' };
    });

    const tiposSel = Array.from(document.querySelectorAll('.chk-cat-tipo:checked')).map(cb => String(cb.value).toLowerCase().trim());
    const genSel = Array.from(document.querySelectorAll('.chk-cat-genero:checked')).map(cb => String(cb.value).toLowerCase().trim());
    const ehAdminCat = (usuarioCargo === 'Admin');

    const itensLista = Object.values(estoqueAgrupado)
        .filter(e => tiposSel.indexOf(String(e.tipo).toLowerCase().trim()) !== -1 && genSel.indexOf(String(e.genero || 'Unissex').toLowerCase().trim()) !== -1)
        .sort((a, b) => String(a.codigo || '').localeCompare(String(b.codigo || '')));

    document.getElementById('cat-produtos-rows').innerHTML = itensLista.map(e => {
        const ant = estadoAnterior[e.nome] || {};
        const precoBase = parseFloat(e.preco) || 0;
        return `<div class="cat-prod-row" data-nome="${String(e.nome).replace(/"/g, '&quot;')}" data-busca="${padronizarTexto(e.nome + ' ' + (e.codigo || ''))}" style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px dashed #eee;">
            <input type="checkbox" class="chk-cat-prod" ${ant.marcado === false ? '' : 'checked'} style="width:16px; height:16px; flex-shrink:0;">
            <span style="flex:1; min-width:0; font-size:0.72rem; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${e.codigo ? `<b style="color:var(--primary-dark);">${e.codigo}</b> · ` : ''}${e.nome}</span>
            ${ehAdminCat ? `<input type="number" class="inp-cat-preco" data-base="${precoBase}" value="${ant.preco || ''}" placeholder="${precoBase ? precoBase.toFixed(2) : 'R$'}" step="0.5" min="0" style="width:64px; padding:5px; border:1px solid #e3c6d2; border-radius:6px; font-size:0.7rem; flex-shrink:0;">` : ''}
        </div>`;
    }).join('') || '<p style="font-size:0.7rem; color:#999; text-align:center;">Nenhum produto nesses filtros.</p>';

    document.getElementById('cat-box-ajuste').style.display = ehAdminCat ? 'flex' : 'none';
    box.style.display = 'block';
    filtrarListaProdutosCatalogo();
}

function filtrarListaProdutosCatalogo() {
    const termo = padronizarTexto(document.getElementById('cat-prod-busca').value || '');
    document.querySelectorAll('.cat-prod-row').forEach(row => {
        row.style.display = (!termo || row.dataset.busca.indexOf(termo) !== -1) ? 'flex' : 'none';
    });
    // Marcar age nos visíveis quando há busca; Desmarcar SEMPRE zera tudo (intuição manda)
    const btnM = document.getElementById('btn-cat-marcar');
    if (btnM) btnM.innerHTML = termo ? '✔️ Marcar visíveis' : '✔️ Marcar todos';
    atualizarContadorSelecaoCatalogo();
}

function marcarTodosProdutosCatalogo(marcar) {
    // ✖️ Desmarcar limpa TUDO (até o que a busca esconde) — foi assim que home sprays
    // entravam de carona em catálogo "só de perfumes". ✔️ Marcar respeita a busca.
    document.querySelectorAll('.cat-prod-row').forEach(row => {
        if (!marcar || row.style.display !== 'none') row.querySelector('.chk-cat-prod').checked = marcar;
    });
    atualizarContadorSelecaoCatalogo();
}

// 🧮 Placar da seleção: mostra o total marcado e DENUNCIA marcados escondidos pela busca
// (foi isso que fez home sprays entrarem de carona num catálogo "só de perfumes")
function atualizarContadorSelecaoCatalogo() {
    const contadorEl = document.getElementById('cat-sel-contador');
    if (!contadorEl) return;
    const rows = Array.from(document.querySelectorAll('.cat-prod-row'));
    if (!rows.length) { contadorEl.innerHTML = ''; return; }
    const marcadas = rows.filter(r => r.querySelector('.chk-cat-prod').checked);
    const foraDaBusca = marcadas.filter(r => r.style.display === 'none').length;
    let html = `✅ ${marcadas.length} de ${rows.length} produtos no catálogo`;
    if (foraDaBusca > 0 && padronizarTexto(document.getElementById('cat-prod-busca').value || '')) {
        html += ` <span style="color:#b45309;">— ⚠️ ${foraDaBusca} marcado(s) FORA desta busca (também entram!)</span>`;
    }
    contadorEl.innerHTML = html;
}

function aplicarAjustePrecoCatalogo(modo) {
    // ⚡ Só mexe nos produtos VISÍVEIS na busca — filtre "perfume" e mude a categoria inteira
    const linhasVisiveis = Array.from(document.querySelectorAll('.cat-prod-row')).filter(r => r.style.display !== 'none');
    if (!linhasVisiveis.length) return mostrarAlerta("Atenção", "Nenhum produto visível na lista pra ajustar.", "warning");

    let mexidos = 0;
    if (modo === 'valor') {
        const vFixo = parseFloat(document.getElementById('cat-valor-fixo').value);
        if (isNaN(vFixo) || vFixo < 0) return mostrarAlerta("Atenção", "Digite o valor em R$ (ex: 80).", "warning");
        linhasVisiveis.forEach(r => { const inp = r.querySelector('.inp-cat-preco'); if (inp) { inp.value = vFixo.toFixed(2); mexidos++; } });
        mostrarAlerta("Pronto!", `${mexidos} produto(s) visível(is) definido(s) em ${fmt(vFixo)} — só neste catálogo, os preços reais do sistema continuam intactos.`, "success");
    } else {
        const pct = parseFloat(document.getElementById('cat-ajuste-pct').value);
        if (isNaN(pct)) return mostrarAlerta("Atenção", "Digite a porcentagem: 10 pra aumentar 10%, -5 pra baixar 5%.", "warning");
        linhasVisiveis.forEach(r => {
            const inp = r.querySelector('.inp-cat-preco');
            if (inp) { const base = parseFloat(inp.dataset.base) || 0; if (base > 0) { inp.value = (Math.round(base * (1 + pct / 100) * 100) / 100).toFixed(2); mexidos++; } }
        });
        mostrarAlerta("Pronto!", `${mexidos} produto(s) visível(is) ajustado(s) em ${pct > 0 ? '+' : ''}${pct}% — só neste catálogo, os preços reais do sistema continuam intactos.`, "success");
    }
}

// Devolve a personalização ({sel, precos}) ou null se está tudo no padrão
function coletarSelecaoProdutosCatalogo() {
    const rows = document.querySelectorAll('.cat-prod-row');
    if (!rows.length) return null;
    const sel = [], precos = {};
    let desmarcouAlgum = false, mudouPreco = false;
    rows.forEach(row => {
        const nome = row.dataset.nome;
        if (row.querySelector('.chk-cat-prod').checked) sel.push(nome); else desmarcouAlgum = true;
        const inp = row.querySelector('.inp-cat-preco');
        if (inp && inp.value !== '') {
            const v = parseFloat(inp.value);
            if (!isNaN(v) && v >= 0 && v !== (parseFloat(inp.dataset.base) || 0)) { precos[nome] = v; mudouPreco = true; }
        }
    });
    if (!desmarcouAlgum && !mudouPreco) return null;
    return { sel, precos: mudouPreco ? precos : null };
}

// ==========================================
// 🗂️ MEUS LINKS DE CATÁLOGO: histórico com copiar, abrir e liga/desliga
// Promoção acabou? Desativa o link e quem abrir vê "catálogo encerrado".
// ==========================================
function abrirMeusCatalogos() {
    const antigo = document.getElementById('modal-meus-catalogos');
    if (antigo) antigo.remove();

    const ehAdminLk = (usuarioCargo === 'Admin');
    const linhas = catalogoLinksGlobal.map(lk => {
        const urlLk = new URL('catalogo.html', window.location.href); urlLk.search = 'k=' + lk.codigo;
        const resumo = [
            lk.qtdSel > 0 ? `🎯 ${lk.qtdSel} produtos` : (lk.tipos ? `📂 ${lk.tipos}` : '📖 completo'),
            lk.generos ? `🚻 ${lk.generos}` : '',
            lk.temPrecos ? '💰 preço próprio' : '',
            lk.soEstoque ? '📦 só c/ estoque' : ''
        ].filter(Boolean).join(' · ');
        return `
        <div style="border:1px solid ${lk.ativo ? '#e3c6d2' : '#fca5a5'}; background:${lk.ativo ? '#fff' : '#fef2f2'}; border-radius:12px; padding:10px 12px; margin-bottom:8px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <span style="font-size:0.72rem; font-weight:800; color:#966178;">?k=${lk.codigo} ${lk.ativo ? '<span style="background:#e8f5e9; color:#2e7d32; padding:1px 8px; border-radius:10px; font-size:0.55rem;">ATIVO</span>' : '<span style="background:#fee2e2; color:#b91c1c; padding:1px 8px; border-radius:10px; font-size:0.55rem;">DESATIVADO</span>'}</span>
                <span style="font-size:0.6rem; color:#999;">${lk.data || ''}</span>
            </div>
            <p style="font-size:0.62rem; color:#888; margin:5px 0 8px; text-transform:capitalize;">${resumo}${ehAdminLk && lk.criadoPor ? ` · 👤 ${lk.criadoPor}` : ''}</p>
            <div style="display:flex; gap:6px;">
                <button onclick="copiarLinkCatalogoSalvo('${urlLk.href}', this)" style="flex:1; background:#fdf5f7; color:#966178; border:1px solid #f3d8e2; border-radius:8px; padding:7px; font-size:0.62rem; font-weight:800; cursor:pointer;">📋 Copiar</button>
                <button onclick="window.open('${urlLk.href}', '_blank')" style="flex:1; background:#fdf5f7; color:#966178; border:1px solid #f3d8e2; border-radius:8px; padding:7px; font-size:0.62rem; font-weight:800; cursor:pointer;">👀 Abrir</button>
                <button onclick="alternarLinkCatalogo(${lk.linha}, ${lk.ativo ? 'false' : 'true'})" style="flex:1; background:${lk.ativo ? '#fef2f2' : '#e8f5e9'}; color:${lk.ativo ? '#b91c1c' : '#2e7d32'}; border:1px solid ${lk.ativo ? '#fca5a5' : '#bbf7d0'}; border-radius:8px; padding:7px; font-size:0.62rem; font-weight:800; cursor:pointer;">${lk.ativo ? '⏻ Desativar' : '🔛 Reativar'}</button>
                <button onclick="excluirLinkCatalogo(${lk.linha}, '${lk.codigo}')" title="Excluir de vez" style="flex:0 0 36px; background:#fee2e2; color:#991b1b; border:1px solid #fecaca; border-radius:8px; padding:7px 0; font-size:0.7rem; cursor:pointer;">🗑️</button>
            </div>
        </div>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'modal-meus-catalogos';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(24,16,32,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px); animation:fadeIn 0.25s ease;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
        <div style="background:#fff; border-radius:20px; max-width:400px; width:100%; max-height:85vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.45); font-family:'Montserrat', sans-serif;">
            <div style="padding:20px 20px 10px; text-align:center; position:relative;">
                <button onclick="document.getElementById('modal-meus-catalogos').remove()" style="position:absolute; top:14px; right:14px; background:#f3e8ed; border:none; width:30px; height:30px; border-radius:50%; font-weight:bold; color:#966178; cursor:pointer;">×</button>
                <div style="font-size:2rem;">🗂️</div>
                <h3 style="margin:4px 0 2px; color:#966178; font-size:1.05rem; font-weight:900;">${ehAdminLk ? 'Links de Catálogo da Equipe' : 'Meus Links de Catálogo'}</h3>
                <p style="margin:0; color:#999; font-size:0.68rem;">Promoção acabou? Desative o link — quem abrir verá "catálogo encerrado".</p>
            </div>
            <div style="padding:12px 16px 18px; overflow-y:auto;">
                ${linhas || '<p style="text-align:center; color:#999; font-size:0.75rem; padding:20px 0;">Nenhum link criado ainda.<br>Gere o primeiro no botão verde do Catálogo! 🔗</p>'}
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

async function copiarLinkCatalogoSalvo(linkTxt, btn) {
    try { await navigator.clipboard.writeText(linkTxt); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = linkTxt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    btn.innerHTML = '✅ Copiado!';
    setTimeout(() => { btn.innerHTML = '📋 Copiar'; }, 2000);
}

function excluirLinkCatalogo(idLink, codigoLk) {
    abrirConfirmacao("Excluir este link?", `O link ?k=${codigoLk} sumirá da sua lista PARA SEMPRE. Quem já recebeu esse link verá "catálogo encerrado" ao abrir. (Se for algo temporário, prefira Desativar — dá pra reativar depois.)`, "🗑️", "#A05252", "#803f3f", "🗑️ Excluir de vez", () => {
        mostrarLoading("Excluindo link...");
        fetch(API_NOVERA, { method: 'POST', headers: cabecalhoAuth(), body: JSON.stringify({ acao: 'excluir_catalogo_link', usuario: usuarioLogado, id_link: idLink }) })
            .then(r => r.json())
            .then(res => {
                if (res.sucesso) {
                    catalogoLinksGlobal = catalogoLinksGlobal.filter(l => l.linha != idLink);
                    abrirMeusCatalogos(); // redesenha a lista já sem o excluído
                    sincronizarDadosUnico();
                } else { mostrarAlerta("Erro", res.erro || "Falha ao excluir o link.", "error"); }
            })
            .catch(() => mostrarAlerta("Erro", "Falha de conexão.", "error"))
            .finally(() => ocultarLoading());
    });
}

function alternarLinkCatalogo(idLink, ativar) {
    mostrarLoading(ativar ? "Reativando link..." : "Desativando link...");
    fetch(API_NOVERA, { method: 'POST', headers: cabecalhoAuth(), body: JSON.stringify({ acao: 'alternar_catalogo_link', usuario: usuarioLogado, id_link: idLink, ativo: ativar }) })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) {
                const lkLocal = catalogoLinksGlobal.find(l => l.linha == idLink);
                if (lkLocal) lkLocal.ativo = ativar;
                abrirMeusCatalogos(); // redesenha a lista já com o novo estado
                sincronizarDadosUnico();
            } else { mostrarAlerta("Erro", res.erro || "Falha ao alterar o link.", "error"); }
        })
        .catch(() => mostrarAlerta("Erro", "Falha de conexão.", "error"))
        .finally(() => ocultarLoading());
}

// 🎴 CARTÃO DO CATÁLOGO: QR emoldurado com a identidade da marca + instrução de uso,
// pronto pra imprimir e colar nas sacolinhas — ninguém se assusta com QR pelado rsrs
async function montarCartaoQrCatalogo(hostEl, linkQr) {
    const ninho = hostEl.querySelector('#qr-catalogo-render');
    ninho.innerHTML = '';
    new QRCode(ninho, { text: linkQr, width: 440, height: 440, correctLevel: QRCode.CorrectLevel.M });
    await new Promise(r => setTimeout(r, 150)); // respiro pro desenho do QR terminar
    const qrFonte = ninho.querySelector('canvas') || ninho.querySelector('img');
    if (!qrFonte) throw new Error('QR não gerado');
    try { await document.fonts.ready; } catch (e) { /* segue com as fontes que tiver */ }

    const marcaNome = String(configuracoesGlobais.marca_nome || IDENTIDADE_PADRAO.marca_nome).toUpperCase();
    const corForte = configuracoesGlobais.cor_primaria_escura || IDENTIDADE_PADRAO.cor_primaria_escura;
    const W = 720, H = 1020, R = 36;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    const cantosRedondos = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };

    // Fundo branco de cantos arredondados (fora fica transparente — imprime bonito)
    cantosRedondos(0, 0, W, H, R);
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    // ✦ Marca (encolhe a fonte se o nome da loja for comprido)
    ctx.fillStyle = corForte;
    let tamMarca = 54;
    do { ctx.font = `700 ${tamMarca}px "Playfair Display", Georgia, serif`; tamMarca -= 2; }
    while (ctx.measureText(marcaNome).width > W - 90 && tamMarca > 26);
    try { ctx.letterSpacing = '6px'; } catch (e) { }
    ctx.fillText(marcaNome, W / 2, 118);

    try { ctx.letterSpacing = '5px'; } catch (e) { }
    ctx.fillStyle = '#b8a0ab';
    ctx.font = '700 22px Montserrat, sans-serif';
    ctx.fillText('CATÁLOGO DE PRODUTOS', W / 2, 168);

    // Filete decorativo
    ctx.fillStyle = '#e8dde1';
    ctx.fillRect(W / 2 - 120, 196, 240, 2);

    // Moldura do QR (borda na cor da marca) + zona de silêncio branca
    const QRS = 440, qx = (W - QRS) / 2, qy = 246;
    ctx.strokeStyle = corForte; ctx.lineWidth = 3;
    cantosRedondos(qx - 22, qy - 22, QRS + 44, QRS + 44, 26); ctx.stroke();
    ctx.drawImage(qrFonte, qx, qy, QRS, QRS);

    // Instrução pra quem nunca leu um QR na vida
    try { ctx.letterSpacing = '1px'; } catch (e) { }
    ctx.fillStyle = '#2C2A2B';
    ctx.font = '800 27px Montserrat, sans-serif';
    ctx.fillText('APONTE A CÂMERA DO CELULAR', W / 2, 790);
    ctx.fillStyle = '#6d5c66';
    ctx.font = '500 21px Montserrat, sans-serif';
    ctx.fillText('para o código e o catálogo abre sozinho,', W / 2, 828);
    ctx.fillText('com preços e novidades sempre atualizados ✨', W / 2, 860);

    // Assinatura do vendedor
    ctx.fillStyle = corForte;
    ctx.font = '700 23px Montserrat, sans-serif';
    ctx.fillText(`💬 Atendimento: ${usuarioLogado}`, W / 2, 930);

    // Faixa inferior na cor da marca
    ctx.fillStyle = corForte;
    ctx.fillRect(0, H - 26, W, 26);
    ctx.restore();

    return cv.toDataURL('image/png');
}

// 🔗 CATÁLOGO ONLINE: monta o link da página pública (catalogo.html) com os MESMOS filtros
// do modal e entrega pronto pra enviar — o cliente abre no celular e vê tudo atualizado.
async function gerarLinkCatalogoOnline() {
    const tipos = Array.from(document.querySelectorAll('.chk-cat-tipo:checked')).map(cb => String(cb.value).toLowerCase().trim());
    if (!tipos.length) return mostrarAlerta("Aviso", "Selecione pelo menos uma categoria.", "warning");
    const generos = Array.from(document.querySelectorAll('.chk-cat-genero:checked')).map(cb => String(cb.value).toLowerCase().trim());
    if (!generos.length) return mostrarAlerta("Aviso", "Selecione pelo menos um gênero.", "warning");

    // Filtro que inclui tudo fica FORA do link — link mais curto e bonito no WhatsApp
    const dadosLink = {};
    if (tipos.length < document.querySelectorAll('.chk-cat-tipo').length) dadosLink.t = tipos.join(',');
    if (generos.length < document.querySelectorAll('.chk-cat-genero').length) dadosLink.g = generos.join(',');
    if (document.getElementById('cat-filtro-estoque').checked) dadosLink.e = 1;
    if (document.getElementById('cat-filtro-exibir-qtd').checked) dadosLink.q = 1;

    const urlPagina = new URL('catalogo.html', window.location.href);
    const customCatLink = coletarSelecaoProdutosCatalogo();
    if (customCatLink) {
        dadosLink.sel = customCatLink.sel;
        if (customCatLink.precos) dadosLink.p = customCatLink.precos;
    }

    // 🔗 TODO link vira código CURTO no servidor (?k=abc123) — link comprido cheio de letras
    // parece golpe no WhatsApp e ninguém clica. O formato longo fica só como plano B de emergência.
    mostrarLoading("Gerando seu link...");
    try {
        const resLk = await fetch(API_NOVERA, { method: 'POST', headers: cabecalhoAuth(), body: JSON.stringify({ acao: 'salvar_catalogo_link', usuario: usuarioLogado, dados: dadosLink }) });
        const jsonLk = await resLk.json();
        if (!jsonLk.sucesso || !jsonLk.codigo) throw new Error(jsonLk.erro || 'Falha ao salvar.');
        urlPagina.search = 'k=' + jsonLk.codigo;
    } catch (e) {
        if (customCatLink) {
            // Personalizado NÃO tem plano B (a configuração só existe no servidor)
            ocultarLoading();
            return mostrarAlerta("Erro", "Não consegui salvar o catálogo personalizado no servidor. " + (e.message || ''), "error");
        }
        // Catálogo padrão: cai no código embaralhado antigo — feio, mas nunca deixa na mão
        dadosLink.v = usuarioLogado;
        const jsonLink = JSON.stringify(dadosLink);
        const tokenLink = btoa(unescape(encodeURIComponent(jsonLink))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        urlPagina.search = 'c=' + tokenLink;
    }
    ocultarLoading();
    const link = urlPagina.href;

    document.getElementById('modal-gerar-catalogo').style.display = 'none';

    const antigo = document.getElementById('modal-link-catalogo');
    if (antigo) antigo.remove();
    const overlay = document.createElement('div');
    overlay.id = 'modal-link-catalogo';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(24,16,32,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fadeIn 0.25s ease;';
    overlay.innerHTML = `
        <div style="background:#fff; border-radius:20px; max-width:340px; width:100%; padding:26px 22px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.45); font-family:'Montserrat', sans-serif;">
            <div style="font-size:3rem;">🔗</div>
            <h3 style="margin:6px 0 4px 0; color:#966178; font-size:1.1rem; font-weight:900;">Link do Catálogo Pronto!</h3>
            <p style="margin:0 0 12px 0; color:#888; font-size:0.75rem;">A página abre com os filtros escolhidos e mostra sempre os preços e o estoque de agora.</p>
            <div style="background:#faf7f8; border:1px dashed #e3c6d2; border-radius:10px; padding:8px 10px; font-size:0.65rem; color:#966178; word-break:break-all; margin-bottom:14px;">${link}</div>
            <button id="btn-link-zap" class="btn-salvar" style="margin:0 0 8px 0; background:#25D366; box-shadow:0 4px 0 #1b9c4b;">📲 Enviar no WhatsApp</button>
            <button id="btn-link-copiar" class="btn-salvar" style="margin:0 0 8px 0; background:#966178; box-shadow:0 4px 0 #7a4a5e;">📋 Copiar Link</button>
            <button id="btn-link-qr" class="btn-salvar" style="margin:0 0 8px 0; background:#1e293b; box-shadow:0 4px 0 #0f172a;">📱 Gerar Cartão com QR Code</button>
            <div id="area-qr-catalogo" style="display:none; margin: 4px 0 12px 0;">
                <div id="qr-catalogo-render" style="display:none;"></div>
                <img id="qr-cartao-img" alt="Cartão do catálogo" style="width:100%; max-width:250px; border-radius:14px; box-shadow:0 10px 26px rgba(0,0,0,0.22); display:block; margin:0 auto;">
                <p style="font-size:0.62rem; color:#888; margin:8px 0 8px;">Cartão pronto pra imprimir: cole nas sacolinhas, caixinhas ou ponha na bio do Instagram!</p>
                <button id="btn-qr-baixar" class="btn-salvar" style="margin:0; background:#fdf5f7; color:#966178; border:1px solid #f3d8e2; box-shadow:none;">⬇️ Baixar Cartão (imagem)</button>
            </div>
            <button id="btn-link-abrir" class="btn-salvar" style="margin:0 0 8px 0; background:#fdf5f7; color:#966178; border:1px solid #f3d8e2; box-shadow:none;">👀 Ver como o Cliente vê</button>
            <button class="btn-modal-cancel" style="width:100%;" onclick="document.getElementById('modal-link-catalogo').remove();">Fechar</button>
        </div>`;
    document.body.appendChild(overlay);

    // 📱 Cartão de marca com QR: prévia bonita no modal e imagem pronta pra imprimir
    overlay.querySelector('#btn-link-qr').onclick = async (ev) => {
        const area = overlay.querySelector('#area-qr-catalogo');
        const btnQr = ev.currentTarget;
        if (area.style.display !== 'none') { area.style.display = 'none'; btnQr.innerHTML = '📱 Gerar Cartão com QR Code'; return; }
        if (!overlay._cartaoQr) {
            btnQr.innerHTML = '⏳ Montando o cartão...';
            try { overlay._cartaoQr = await montarCartaoQrCatalogo(overlay, link); }
            catch (e) { btnQr.innerHTML = '📱 Gerar Cartão com QR Code'; return mostrarAlerta("Erro", "Não consegui desenhar o QR Code neste aparelho.", "error"); }
            overlay.querySelector('#qr-cartao-img').src = overlay._cartaoQr;
        }
        area.style.display = 'block';
        btnQr.innerHTML = '📱 Ocultar Cartão';
    };
    overlay.querySelector('#btn-qr-baixar').onclick = () => {
        if (!overlay._cartaoQr) return;
        const aQr = document.createElement('a');
        aQr.href = overlay._cartaoQr;
        aQr.download = 'Cartao_Catalogo_' + String(usuarioLogado).replace(/\s+/g, '_') + '.png';
        aQr.click();
    };

    overlay.querySelector('#btn-link-zap').onclick = () => {
        const msg = `✨ Dá uma olhada no nosso catálogo! Perfumes e cosméticos com preços e disponibilidade atualizados:\n\n${link}`;
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    };
    overlay.querySelector('#btn-link-copiar').onclick = async (ev) => {
        const btn = ev.currentTarget;
        try { await navigator.clipboard.writeText(link); }
        catch (e) { const ta = document.createElement('textarea'); ta.value = link; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        btn.innerHTML = '✅ Copiado!';
        setTimeout(() => { btn.innerHTML = '📋 Copiar Link'; }, 2000);
    };
    overlay.querySelector('#btn-link-abrir').onclick = () => window.open(link, '_blank');
}

// 📬 Modal de entrega do PDF: os botões dão o "clique fresco" que o navegador exige
// pra liberar compartilhamento/baixa — sem isso, gerações longas terminavam sem arquivo.
function mostrarModalPdfPronto(blobPdf, nomeArquivo, totalPaginas) {
    const antigo = document.getElementById('modal-pdf-pronto');
    if (antigo) antigo.remove();
    const urlBlob = URL.createObjectURL(blobPdf);
    const arquivoPdf = new File([blobPdf], nomeArquivo, { type: 'application/pdf' });
    const podeCompartilhar = !!(navigator.canShare && navigator.canShare({ files: [arquivoPdf] }));

    const overlay = document.createElement('div');
    overlay.id = 'modal-pdf-pronto';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(24,16,32,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fadeIn 0.25s ease;';
    overlay.innerHTML = `
        <div style="background:#fff; border-radius:20px; max-width:340px; width:100%; padding:26px 22px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.45); font-family:'Montserrat', sans-serif;">
            <div style="font-size:3rem;">📖</div>
            <h3 style="margin:6px 0 4px 0; color:#966178; font-size:1.1rem; font-weight:900;">Catálogo Pronto!</h3>
            <p style="margin:0 0 18px 0; color:#888; font-size:0.78rem;">${totalPaginas} página(s) geradas com sucesso.</p>
            ${podeCompartilhar ? `<button id="btn-pdf-compartilhar" class="btn-salvar" style="margin:0 0 8px 0; background:#25D366; box-shadow:0 4px 0 #1b9c4b;">📲 Enviar / Compartilhar</button>` : ''}
            <button id="btn-pdf-baixar" class="btn-salvar" style="margin:0 0 8px 0; background:#966178; box-shadow:0 4px 0 #7a4a5e;">⬇️ Baixar PDF</button>
            <button class="btn-modal-cancel" style="width:100%;" onclick="document.getElementById('modal-pdf-pronto').remove(); setTimeout(() => URL.revokeObjectURL('${urlBlob}'), 1000);">Fechar</button>
        </div>`;
    document.body.appendChild(overlay);

    const btnComp = overlay.querySelector('#btn-pdf-compartilhar');
    if (btnComp) btnComp.onclick = async () => {
        try { await navigator.share({ files: [arquivoPdf], title: 'Catálogo' }); } catch (e) { /* cancelou, tudo bem */ }
    };
    overlay.querySelector('#btn-pdf-baixar').onclick = () => {
        const linkPdf = document.createElement('a');
        linkPdf.href = urlBlob; linkPdf.download = nomeArquivo; linkPdf.click();
    };
}

// ✂️ Recorta a foto no formato exato do cartão (corte central, SEM distorcer) e devolve pronta.
// O gerador de PDF estraga tanto object-fit quanto background cover — então entregamos já recortada.
function carregarFotoRecortada(url, alvoW, alvoH) {
    return new Promise((resolve) => {
        let resolvido = false;
        const fim = (r) => { if (!resolvido) { resolvido = true; resolve(r); } };
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const cv = document.createElement('canvas');
                cv.width = alvoW * 2; cv.height = alvoH * 2; // 2x pra sair nítido no PDF
                const ctx = cv.getContext('2d');
                const escala = Math.max(cv.width / img.width, cv.height / img.height);
                const w = img.width * escala, h = img.height * escala;
                ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
                fim(cv.toDataURL('image/jpeg', 0.85));
            } catch (e) { fim(null); }
        };
        img.onerror = () => fim(null);
        setTimeout(() => fim(null), 8000); // foto que não carregar em 8s vira cartão NS
        img.src = url;
    });
}

async function gerarCatalogoPDFFrontend() {
    const checkboxes = document.querySelectorAll('.chk-cat-tipo:checked'); 
    if (checkboxes.length === 0) return mostrarAlerta("Aviso", "Selecione pelo menos uma categoria.", "warning"); 
    const tiposSelecionados = Array.from(checkboxes).map(cb => String(cb.value).toLowerCase().trim()); 
    
    const checkboxesGen = document.querySelectorAll('.chk-cat-genero:checked');
    if (checkboxesGen.length === 0) return mostrarAlerta("Aviso", "Selecione pelo menos um gênero.", "warning");
    const generosSelecionados = Array.from(checkboxesGen).map(cb => String(cb.value).toLowerCase().trim());

    const apenasEstoque = document.getElementById('cat-filtro-estoque').checked; 
    const exibirQtd = document.getElementById('cat-filtro-exibir-qtd').checked; 
    
    document.getElementById('modal-gerar-catalogo').style.display = 'none'; 
    mostrarLoading("Gerando..."); 
    
    let itensFiltrados = Object.values(estoqueAgrupado).filter(e => { 
        let tipoStr = String(e.tipo).toLowerCase().trim(); 
        if (tiposSelecionados.indexOf(tipoStr) === -1) return false; 
        
        let genE = String(e.genero || "Unissex").toLowerCase().trim();
        if (generosSelecionados.indexOf(genE) === -1) return false;

        if (apenasEstoque && e.totalQtd <= 0) return false;
        return true;
    });

    // 🎯 Personalização fina: só os produtos escolhidos a dedo, com os preços deste catálogo
    const customCatPdf = coletarSelecaoProdutosCatalogo();
    if (customCatPdf) {
        const selSetPdf = new Set(customCatPdf.sel);
        itensFiltrados = itensFiltrados.filter(e => selSetPdf.has(e.nome));
        if (customCatPdf.precos) itensFiltrados = itensFiltrados.map(e => customCatPdf.precos[e.nome] != null ? { ...e, preco: customCatPdf.precos[e.nome] } : e);
    }

    if (itensFiltrados.length === 0) {
        ocultarLoading(); 
        return mostrarAlerta("Aviso", "Nenhum produto atende a esses filtros.", "warning"); 
    } 
    
    // ✂️ Pré-recorta todas as fotos no formato do cartão (retrato grande 210x300), sem distorção
    mostrarLoading("Preparando as fotos...");
    const FOTO_W = 210, FOTO_H = 300;
    const mapaFotosCat = {};
    await Promise.all(itensFiltrados.map(async (e) => {
        const url = melhorFotoUrl(e.foto); // prioriza a URL do imgbb (com CORS liberado pro recorte)
        if (url) mapaFotosCat[e.nome] = await carregarFotoRecortada(url, FOTO_W, FOTO_H);
    }));
    mostrarLoading("Montando o catálogo...");

    // 📖 Agrupa por tipo na mesma ordem dos Parâmetros Globais (igual aos dropdowns de venda)
    const ordemTiposCat = (configuracoesGlobais.tipos_produto || '').split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    const idxTipoCat = (t) => { const i = ordemTiposCat.indexOf(String(t || '').toLowerCase().trim()); return i === -1 ? 999 : i; };
    const gruposCat = {};
    itensFiltrados.forEach(e => {
        const tKey = String(e.tipo || 'Outros').trim();
        if (!gruposCat[tKey]) gruposCat[tKey] = [];
        gruposCat[tKey].push(e);
    });
    const tiposOrdenados = Object.keys(gruposCat).sort((a, b) => {
        const ia = idxTipoCat(a), ib = idxTipoCat(b);
        return ia !== ib ? ia - ib : a.localeCompare(b);
    });

    const iconeGeneroCat = (gen) => {
        const g = String(gen || '').toLowerCase().trim();
        if (g === 'feminino') return '🌸 Feminino';
        if (g === 'masculino') return '🔷 Masculino';
        if (g === 'infantil') return '🧸 Infantil';
        return '⚪ Unissex';
    };

    // 💎 Cartão de LUXO (1 por linha): foto retrato grande, serifa Playfair no nome,
    // descrição com respiro, notas em pirâmide olfativa e preço em destaque com filete
    const cardCatalogo = (e) => {
        const nomeSemTipo = e.nome.replace(new RegExp('^' + e.tipo + '\\s*', 'i'), '').trim().replace(/^[- ]+/, "");
        const fotoPronta = mapaFotosCat[e.nome] || null;

        // 🎨 Paleta por gênero, seguindo o padrão das embalagens: masculino = cinza-chumbo; demais = rosé
        const ehMascCat = String(e.genero || '').toLowerCase().trim() === 'masculino';
        const pal = ehMascCat
            ? { forte: '#525a66', medio: '#6b7482', suave: '#8a92a0', micro: '#aab2bd', chipBorda: '#c8cdd5', chipFundo: '#f6f7f9', filete: '#e2e5e9', letterbox: '#eef0f3', placA: '#f4f5f7', placB: '#dfe2e7', placTxt: '#9aa2ae' }
            : { forte: '#966178', medio: '#a86f88', suave: '#b98ba1', micro: '#c9b3bd', chipBorda: '#e3c6d2', chipFundo: '#fdf8fa', filete: '#eadfe4', letterbox: '#f6ebef', placA: '#fdf5f7', placB: '#f0dde6', placTxt: '#c9a2b4' };

        // A coluna da foto se ESTICA junto com o cartão (letterbox na cor do gênero se sobrar espaço)
        const imgTag = fotoPronta
            ? `<div style="width: ${FOTO_W}px; flex-shrink: 0; align-self: stretch; background: ${pal.letterbox}; display: flex; align-items: center; justify-content: center; overflow: hidden;"><img src="${fotoPronta}" width="${FOTO_W}" height="${FOTO_H}" style="display: block; width: ${FOTO_W}px; height: ${FOTO_H}px;"></div>`
            : `<div style="width: ${FOTO_W}px; flex-shrink: 0; align-self: stretch; min-height: ${FOTO_H}px; background: linear-gradient(160deg, ${pal.placA}, ${pal.placB}); display: flex; align-items: center; justify-content: center;"><span style="font-family: 'Playfair Display', serif; font-size: 42px; color: ${pal.placTxt}; letter-spacing: 3px;">NS</span></div>`;
        const dispHtml = exibirQtd ? (e.totalQtd > 0
            ? `<span style="font-size: 8.5px; color: #5a8a68; font-weight: 700; letter-spacing: 1px;">DISPONÍVEL · ${e.totalQtd} UN</span>`
            : `<span style="font-size: 8.5px; color: #b08585; font-weight: 700; letter-spacing: 1px;">SOB ENCOMENDA</span>`) : "";

        // 💸 Produto em promoção: preço cheio riscado + preço novo (ancoragem que converte)
        const descCat = descontosProdutoGlobal.find(dd => dd.nomeProduto === e.nome);
        const precoBaseCat = parseFloat(e.preco) || 0;
        const precoFinalCat = (descCat && precoBaseCat > 0) ? precoBaseCat * (1 - descCat.percentual / 100) : precoBaseCat;

        const rotCat = rotulosGlobal.find(rr => rr.codigo === e.codigo);
        const fichaCat = rotCat ? lerFichaDoRotulo(rotCat) : null;
        let htmlFichaCat = '';
        if (fichaCat && fichaCat.descricao) {
            const linhaNota = (rotulo, valor) => valor ? `<div style="margin-top: 3px;"><span style="display: inline-block; min-width: 62px; font-size: 7.5px; font-weight: 800; color: ${pal.suave}; letter-spacing: 2px;">${rotulo}</span><span style="font-size: 9px; color: #6d5c66;">${valor}</span></div>` : '';
            // 💫 Ocasiões de uso em "joias" (chips) — o gatilho de compra em destaque
            const chipsOcasioes = fichaCat.ocasioes ? `
                <div style="margin-top: 9px;">${String(fichaCat.ocasioes).split(/[·,;]/).map(o => o.trim()).filter(Boolean).slice(0, 4).map(o => `<span style="display: inline-block; border: 1px solid ${pal.chipBorda}; background: ${pal.chipFundo}; color: ${pal.medio}; border-radius: 20px; padding: 3.5px 11px; font-size: 7.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 5px 4px 0;">${o}</span>`).join('')}</div>` : '';
            htmlFichaCat = `
                <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 10.5px; color: #6d5c66; font-style: italic; line-height: 1.55; margin: 7px 0 0 0;">“${String(fichaCat.descricao).substring(0, 200)}”</div>
                ${fichaCat.notas_saida ? `
                <div style="height: 1px; background: linear-gradient(90deg, ${pal.filete}, rgba(255,255,255,0)); margin: 8px 0 5px 0;"></div>
                ${linhaNota('SAÍDA', fichaCat.notas_saida)}
                ${linhaNota('CORAÇÃO', fichaCat.notas_coracao)}
                ${linhaNota('FUNDO', fichaCat.notas_fundo)}` : ''}
                ${chipsOcasioes}`;
        }

        return `<div style="border: 1px solid ${pal.filete}; border-radius: 18px; overflow: hidden; background: #fff; display: flex; align-items: stretch;">
            ${imgTag}
            <div style="flex: 1; min-width: 0; padding: 16px 22px; display: flex; flex-direction: column; justify-content: center;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    ${e.codigo ? `<span style="font-size: 10px; font-weight: 800; color: ${pal.forte}; letter-spacing: 3px;">${e.codigo}</span>` : '<span></span>'}
                    <span style="font-size: 8.5px; color: ${pal.micro}; letter-spacing: 1.5px; text-transform: uppercase;">${(fichaCat && fichaCat.familia) ? `<span style="color: ${pal.medio}; font-weight: 800;">${fichaCat.familia}</span> &nbsp;·&nbsp; ` : ''}${iconeGeneroCat(e.genero)}</span>
                </div>
                <div style="font-size: 7.5px; color: ${pal.micro}; text-transform: uppercase; letter-spacing: 3px; margin-top: 6px;">Inspiração</div>
                <div style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; color: #2C2A2B; line-height: 1.2; margin-top: 2px;">${nomeSemTipo}</div>
                ${htmlFichaCat}
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; padding-top: 9px; border-top: 1px solid ${pal.filete};">
                    <span>${(descCat && precoBaseCat > 0)
                        ? `<span style="font-size: 11px; color: ${pal.micro}; text-decoration: line-through;">${safeFmt(precoBaseCat)}</span> <span style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 19px; color: #2e7d32;">${safeFmt(precoFinalCat)}</span> <span style="background: #e8f5e9; border: 1px solid #bbf7d0; color: #166534; border-radius: 20px; padding: 2.5px 9px; font-size: 7.5px; font-weight: 800; letter-spacing: 1px;">🔥 -${descCat.percentual}% OFF</span>`
                        : `<span style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 19px; color: ${pal.forte};">${safeFmt(e.preco)}</span>`}</span>
                    ${dispHtml}
                </div>
            </div>
        </div>`;
    };

    // 🧱 Monta os BLOCOS do catálogo (cabeçalhos e linhas de 2 cartões) como peças independentes.
    // Usamos padding em vez de margin pra medição de altura sair exata.
    const blocosCat = [];
    blocosCat.push(`<div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #E8DDE1; margin-bottom: 6px;">
        <h1 style="color: #966178; font-family: 'Playfair Display', serif; margin: 0; font-size: 30px; text-transform: uppercase; letter-spacing: 5px;">Novera Scent</h1>
        <h2 style="font-size: 12px; font-weight: 600; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 3px; color: #b8a0ab;">Catálogo de Produtos</h2>
    </div>`);

    // 🚻 Dentro de cada categoria, os gêneros ganham seu próprio bloco (com subtítulo
    // quando há mais de um) — femininos e masculinos nunca mais misturados na página
    const ordemGeneroCat = ['feminino', 'masculino', 'unissex', 'infantil'];
    const chaveGenCat = (g) => { const gn = String(g || 'unissex').toLowerCase().trim(); return ordemGeneroCat.indexOf(gn) === -1 ? 'unissex' : gn; };
    const rotuloGeneroCat = { feminino: '🌸 Femininos', masculino: '🔷 Masculinos', unissex: '⚪ Unissex', infantil: '🧸 Infantis' };
    const corGeneroCat = { feminino: '#a86f88', masculino: '#6b7482', unissex: '#9aa2ae', infantil: '#a86f88' };

    tiposOrdenados.forEach(tipoKey => {
        const nomeGrupo = tipoKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        blocosCat.push({ cabecalho: true, html: `<div style="text-align: center; padding: 16px 0 12px 0;">
            <div style="font-family: 'Playfair Display', serif; font-size: 18px; color: #966178; letter-spacing: 4px; text-transform: uppercase;">— ${nomeGrupo}${nomeGrupo.toLowerCase().endsWith('s') ? '' : 's'} —</div>
        </div>` });

        const porGeneroCat = {};
        gruposCat[tipoKey].forEach(it => { const gk = chaveGenCat(it.genero); (porGeneroCat[gk] = porGeneroCat[gk] || []).push(it); });
        const gensDoGrupo = ordemGeneroCat.filter(gk => porGeneroCat[gk]);
        const mostrarSubtitulo = gensDoGrupo.length > 1; // categoria de gênero único fica limpa, sem subtítulo redundante

        gensDoGrupo.forEach(gk => {
            if (mostrarSubtitulo) {
                blocosCat.push({ cabecalho: true, html: `<div style="text-align: center; padding: 10px 0 10px 0;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 3px; color: ${corGeneroCat[gk]}; text-transform: uppercase;">${rotuloGeneroCat[gk]}</span>
                    <div style="height: 1px; width: 130px; margin: 7px auto 0; background: linear-gradient(90deg, rgba(255,255,255,0), ${corGeneroCat[gk]}55, rgba(255,255,255,0));"></div>
                </div>` });
            }
            // 💎 Um cartão por linha: cada produto tem seu momento de vitrine
            porGeneroCat[gk].sort((a, b) => String(a.codigo || '').localeCompare(String(b.codigo || ''))).forEach(item => {
                blocosCat.push(`<div style="padding-bottom: 14px;">${cardCatalogo(item)}</div>`);
            });
        });
    });

    blocosCat.push(`<div style="text-align: center; padding-top: 14px; font-size: 9px; color: #999; border-top: 1px solid #E8DDE1; letter-spacing: 1px;">✦ &nbsp;Catálogo atualizado em ${new Date().toLocaleDateString('pt-BR')} · Preços sujeitos a alteração&nbsp; ✦</div>`);

    // 📄 ARQUITETURA À PROVA DE CORTE: cada página A4 é uma "caixa" física de tamanho exato,
    // preenchida só com os blocos que cabem inteiros. Depois fotografamos página por página
    // (imagens pequenas — some também o limite de altura do navegador que engolia o fim do catálogo).
    const PAG_W = 210 * 96 / 25.4, PAG_H = 297 * 96 / 25.4, PAG_PAD = 30;
    const areaUtilPagina = PAG_H - 2 * PAG_PAD;
    const brandTopoHtml = `<div style="text-align:center; font-family:'Playfair Display', serif; color:#c9a2b4; font-size:11px; letter-spacing:5px; text-transform:uppercase; padding-bottom:14px;">Novera Scent</div>`;

    const hostCat = document.createElement('div');
    hostCat.style.cssText = 'position:absolute; left:-99999px; top:0;';
    document.body.appendChild(hostCat);

    // Bancada de medição com a MESMA largura útil das páginas
    const estagioCat = document.createElement('div');
    estagioCat.style.cssText = `width:${PAG_W - 2 * PAG_PAD}px; font-family:'Montserrat', sans-serif; color:#2C2A2B; background:#fff;`;
    hostCat.appendChild(estagioCat);

    const paginasCat = [];
    let paginaAtualCat = null, alturaUsadaCat = 0;
    const novaPaginaCat = () => {
        const p = document.createElement('div');
        p.style.cssText = `width:${PAG_W}px; height:${PAG_H}px; padding:${PAG_PAD}px; box-sizing:border-box; background:#fff; font-family:'Montserrat', sans-serif; color:#2C2A2B; overflow:hidden;`;
        alturaUsadaCat = 0;
        if (paginasCat.length > 0) { // páginas seguintes ganham a marca discreta no topo
            const marca = document.createElement('div');
            marca.innerHTML = brandTopoHtml;
            estagioCat.appendChild(marca.firstElementChild);
            const noBrand = estagioCat.lastElementChild;
            alturaUsadaCat = noBrand.offsetHeight;
            p.appendChild(noBrand);
        }
        paginasCat.push(p);
        hostCat.appendChild(p);
        paginaAtualCat = p;
    };

    blocosCat.forEach(b => {
        const ehCabecalho = typeof b === 'object' && b.cabecalho;
        const htmlBloco = typeof b === 'object' ? b.html : b;
        const molde = document.createElement('div');
        molde.innerHTML = htmlBloco;
        const no = molde.firstElementChild;
        estagioCat.appendChild(no);
        const alturaBloco = no.offsetHeight;
        // Cabeçalho de seção "reserva" espaço pro 1º cartão não ficar órfão dele no fim da página
        const alturaNecessaria = alturaBloco + (ehCabecalho ? 240 : 0);
        if (!paginaAtualCat || (alturaUsadaCat + alturaNecessaria > areaUtilPagina && alturaBloco < areaUtilPagina)) novaPaginaCat();
        paginaAtualCat.appendChild(no);
        alturaUsadaCat += alturaBloco;
    });

    try {
        const nomeArquivoPdf = `Catalogo_Novera_${new Date().getTime()}.pdf`;

        // A biblioteca empacotada NÃO expõe o jsPDF por fora — então extraímos o "motor" PDF de
        // dentro dela (worker .toPdf().get('pdf')): a página 1 já sai pronta e ganhamos o objeto
        // pra colar as demais páginas, uma foto por folha. Sem fatiamento = sem corte, nunca.
        // Ignora os gráficos do Painel na "foto" (eles poluem o clone com avisos e deixam tudo lento)
        const ignorarCanvasFora = (el) => el && el.tagName === 'CANVAS';

        mostrarLoading(`Gerando página 1 de ${paginasCat.length}...`);
        const pdfCat = await html2pdf().set({
            margin: 0,
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', onclone: removerTemaEscuroDoClone, ignoreElements: ignorarCanvasFora },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: [] }
        }).from(paginasCat[0]).toPdf().get('pdf');

        // Arredondamento às vezes gera uma folha em branco extra na página 1 — remove
        while (pdfCat.internal.getNumberOfPages() > 1) pdfCat.deletePage(pdfCat.internal.getNumberOfPages());

        for (let i = 1; i < paginasCat.length; i++) {
            mostrarLoading(`Gerando página ${i + 1} de ${paginasCat.length}...`);
            const canvasPag = await html2canvas(paginasCat[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff', ignoreElements: ignorarCanvasFora });
            pdfCat.addPage();
            pdfCat.addImage(canvasPag.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
        }
        const blobPdf = pdfCat.output('blob');
        ocultarLoading();

        // 📬 Entrega com clique SEU: navegadores só liberam compartilhar/baixar logo após um toque —
        // como a geração demora, o toque no botão deste modal é a "permissão fresca" que garante o arquivo
        mostrarModalPdfPronto(blobPdf, nomeArquivoPdf, paginasCat.length);
    } catch(err) {
        console.error('Erro no catálogo:', err);
        mostrarAlerta("Erro", "Falha ao gerar o PDF.", "error");
    } finally {
        document.body.removeChild(hostCat);
        ocultarLoading();
    }
}

function renderizarCompras() {
    const fila = document.getElementById('lista-compras-cards'); 
    if(!fila) return;
    
    const tBusca = document.getElementById('busca-compras') ? document.getElementById('busca-compras').value.toLowerCase().trim() : ''; 
    let pends = comprasGlobal.filter(c => c.status !== 'Comprado' && c.status !== 'Concluido'); 
    
    if (tBusca) { 
        pends = pends.filter(c => (c.item + " " + c.categoria).toLowerCase().includes(tBusca)); 
    } 
    
    pends.sort((a, b) => new Date(a.dataPrevista) - new Date(b.dataPrevista)); 
    
    if (comprasGlobal.length === 0) { 
        fila.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem; margin-top:20px;'>Nenhuma compra planejada.</p>"; 
        return; 
    } 
    if (pends.length === 0) { 
        fila.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem; margin-top:20px;'>Tudo comprado ou não encontrado!</p>"; 
        return; 
    } 
    
    const hojeIso = new Date().toISOString().split('T')[0]; 
    let html = ""; 
    let gruposCompras = {};
    let totalGeralPlanejado = 0; 

    pends.forEach(c => {
        let cat = c.categoria ? c.categoria.toUpperCase() : "OUTROS / SEM CATEGORIA";
        if (!gruposCompras[cat]) gruposCompras[cat] = { itens: [], total: 0 };

        let classBadge = "b-futuro"; let textoBadge = "No prazo";
        if (c.dataPrevista < hojeIso) { classBadge = "b-atrasado"; textoBadge = "Atrasado"; } 
        else if (c.dataPrevista === hojeIso) { classBadge = "b-hoje"; textoBadge = "Hoje"; }
        
        const valorTotalCompra = parseDinheiro(c.valor_previsto) * (parseInt(c.qtd) || 1);
        
        gruposCompras[cat].total += valorTotalCompra;
        totalGeralPlanejado += valorTotalCompra; 

        gruposCompras[cat].itens.push(`
        <div class="rotulo-card card-compra-list" style="border-left: 5px solid var(--primary-dark); padding: 15px; border-radius: 8px;">
            <div style="display: flex; align-items: flex-start; gap: 15px; flex: 1;">
                <input type="checkbox" class="chk-item-compra-lote" value="${c.linha}" style="width:22px; height:22px; accent-color:var(--primary-dark); cursor:pointer; margin-top:2px; flex-shrink:0;">
                
                <div class="prod-info-main" style="flex: 1;">
                    <div class="c-nome-block">
                        <h4 style="margin: 0 0 3px 0; font-size: 0.95rem; color: var(--brand-dark);">
                            ${c.item} <span class="badge-status ${classBadge}" style="margin-left:5px;">${textoBadge}</span>
                        </h4>
                        <p style="color:var(--primary); font-weight:800; font-size:0.7rem; margin:0;">🗓️ Previsto para: ${c.dataDisplay}</p>
                    </div>
                    <div class="c-detalhe-block">
                        <p style="margin:0; font-size:0.85rem; color: var(--brand-dark);"><b>${c.qtd}x</b> unit. ${safeFmt(c.valor_previsto)}</p>
                    </div>
                </div>
            </div>

            <div class="prod-actions">
                <div style="text-align: right;">
                    <p style="font-size:0.7rem; color:#A05252; font-weight:700; margin:0;">Total Estimado</p>
                    <p style="margin: 2px 0 0 0; color: var(--brand-dark); font-size: 1.1rem; font-weight: 900;">${fmt(valorTotalCompra)}</p>
                </div>
                <div style="display:flex; flex-direction:row; gap:6px; align-items:center;">
                    <button class="btn-salvar" style="margin:0; padding:10px 15px; font-size:0.75rem; background:#2e7d32; box-shadow: 0 4px 10px rgba(46,125,50,0.2);" onclick="abrirModalCompra(${c.linha})" title="Efetuar Compra">✔️ LANÇAR</button>
                    <button class="btn-acao" style="width:36px; height:36px;" onclick="abrirModalEditarCompra(${c.linha})" title="Editar">✏️</button>
                    <button class="btn-acao" style="width:36px; height:36px;" onclick="prepararExclusaoRegistro('Compras', ${c.linha}, '${c.item}')" title="Excluir">🗑️</button>
                </div>
            </div>
        </div>`);
    }); 

    // ⭐ NOVO LAYOUT CENTRALIZADO E COM RESPIRO ⭐
    if (!tBusca) {
        html += `
        <div style="background: white; border: 1px solid #e2e8f0; border-top: 5px solid var(--primary-dark); padding: 35px 20px; border-radius: 12px; margin-top: 20px; margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 6px 15px rgba(0,0,0,0.05); gap: 20px;">
            <div>
                <p style="margin:0; font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">💰 Valor Total do Planejamento</p>
                <p style="margin:5px 0 0 0; font-size: 2.5rem; font-weight: 900; color: var(--brand-dark);">${fmt(totalGeralPlanejado)}</p>
            </div>
            <button id="btn-copiar-pedido" onclick="copiarPedidoClipboard()" style="background: var(--primary-dark); color: white; border: none; padding: 14px 30px; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; width: 100%; max-width: 320px; box-sizing: border-box; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: block; margin: 0 auto; text-align: center;">
                📋 Copiar Pedido (S/ Preço)
            </button>
        </div>`;
    }

    Object.keys(gruposCompras).sort().forEach(cat => {
        html += `<div class="separador-data div-futuro" style="background: var(--primary-dark); margin: 25px 0 10px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                    <span>🛒 CATEGORIA: ${cat}</span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.3);">PREVISTO: ${fmt(gruposCompras[cat].total)}</span>
                 </div>`;
        html += `<div class="grid-compras-grupo" style="display:flex; flex-direction:column; gap:10px;">`;
        html += gruposCompras[cat].itens.join('');
        html += `</div>`;
    });

    fila.innerHTML = html;
}

function salvarCompra() { const data = document.getElementById('c-data').value; const cat = padronizarTexto(document.getElementById('c-categoria').value); const item = padronizarTexto(document.getElementById('c-item').value); const qtd = document.getElementById('c-qtd').value; const val = document.getElementById('c-valor').value; if (!data || !item) return mostrarAlerta("Atenção", "Preencha a Data e o Item.", "warning"); mostrarLoading("Salvando..."); const msgLog = `📝 Planejou comprar ${qtd}x [${item}]`; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_compra", data: data, categoria: cat, item: item, qtd: qtd, valor: fmtPlanilha(parseDinheiro(val)), log_detalhe: msgLog }) }).then(() => { mostrarAlerta("Adicionado", "Item na lista de compras.", "success"); document.getElementById('c-item').value = ""; document.getElementById('c-valor').value = ""; sincronizarDadosUnico(); }); }
function abrirModalCompra(linha) { const c = comprasGlobal.find(x => x.linha === linha); if (!c) return; document.getElementById('mc-linha').value = c.linha; document.getElementById('mc-qtd').value = c.qtd; document.getElementById('mc-item-nome').innerText = c.item; document.getElementById('mc-valor-unit').value = safeFmt(c.valor_previsto); calcularTotalCompraModal(); document.getElementById('modal-comprar-item').style.display = 'flex'; }
function calcularTotalCompraModal() { const q = parseFloat(document.getElementById('mc-qtd').value) || 1; const vu = parseDinheiro(document.getElementById('mc-valor-unit').value); document.getElementById('mc-total').value = fmt(q * vu); }
function confirmarCompraModal() { const linha = document.getElementById('mc-linha').value; const c = comprasGlobal.find(x => x.linha == linha); const local = padronizarTexto(document.getElementById('mc-local').value); const socio = padronizarTexto(document.getElementById('mc-socio').value); const valorUnit = document.getElementById('mc-valor-unit').value; const total = document.getElementById('mc-total').value; document.getElementById('modal-comprar-item').style.display = 'none'; mostrarLoading("Lançando Despesa..."); const msgLog = `🛒 Efetuou compra de [${c.item}]. Gasto total: ${total} lançado nas despesas.`; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "marcar_comprado", linha: linha, item: c.item, qtd: c.qtd, local: local, socio: socio, valor_unitario: fmtPlanilha(parseDinheiro(valorUnit)), total: fmtPlanilha(parseDinheiro(total)), log_detalhe: msgLog }) }).then(() => { mostrarAlerta("Pronto!", "Baixa dada e Gasto registrado.", "success"); sincronizarDadosUnico(); }); }
function abrirModalEditarCompra(linha) { const c = comprasGlobal.find(x => x.linha === linha); if (!c) return; document.getElementById('edit-c-linha').value = c.linha; document.getElementById('edit-c-item').value = c.item; document.getElementById('edit-c-qtd').value = c.qtd; document.getElementById('edit-c-valor').value = safeFmt(c.valor_previsto); document.getElementById('edit-c-data').value = c.dataPrevista; document.getElementById('edit-c-categoria').value = c.categoria; document.getElementById('modal-editar-compra').style.display = 'flex'; }
function salvarEdicaoCompra() { const linha = document.getElementById('edit-c-linha').value; const item = padronizarTexto(document.getElementById('edit-c-item').value); const qtd = document.getElementById('edit-c-qtd').value; const valor = parseDinheiro(document.getElementById('edit-c-valor').value); const data = document.getElementById('edit-c-data').value; const cat = padronizarTexto(document.getElementById('edit-c-categoria').value); document.getElementById('modal-editar-compra').style.display = 'none'; mostrarLoading("Atualizando..."); const msgLog = `✏️ Atualizou planejamento de compra: ${qtd}x [${item}]`; const py = { usuario: usuarioLogado, acao: "excluir_registro", aba: "Compras", linha: linha }; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(py) }).then(() => { fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_compra", data: data, categoria: cat, item: item, qtd: qtd, valor: fmtPlanilha(valor), log_detalhe: msgLog }) }).then(() => { mostrarAlerta("Atualizado!", "Planejamento alterado.", "success"); sincronizarDadosUnico(); }); }); }
function abrirModalCompraLote() { const marcados = document.querySelectorAll('.chk-item-compra-lote:checked'); if (marcados.length === 0) return mostrarAlerta("Aviso", "Selecione ao menos um item da fila para lançar.", "warning"); document.getElementById('modal-comprar-lote').style.display = 'flex'; }
async function confirmarCompraLoteModal() { const checkboxes = document.querySelectorAll('.chk-item-compra-lote:checked'); const local = padronizarTexto(document.getElementById('mcl-local').value); const socio = padronizarTexto(document.getElementById('mcl-socio').value); if (!local || !socio) return mostrarAlerta("Atenção", "Informe o Fornecedor e o Sócio.", "warning"); document.getElementById('modal-comprar-lote').style.display = 'none'; mostrarLoading("Lançando Lote..."); let itensStr = []; for (let chk of checkboxes) { let c = comprasGlobal.find(x => x.linha == chk.value); if (c) { itensStr.push(c.item); let totalGasto = (parseFloat(c.qtd) || 1) * parseFloat(c.valor_previsto); await fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "marcar_comprado", linha: c.linha, item: c.item, qtd: c.qtd, local: local, socio: socio, valor_unitario: fmtPlanilha(c.valor_previsto), total: fmtPlanilha(totalGasto), log_detalhe: `🛒 Compra em lote: ${c.item}` }) }); } } mostrarAlerta("Lote Enviado!", "Os itens foram processados.", "success"); sincronizarDadosUnico(); }
function excluirComprasEmLote() { const checkboxes = document.querySelectorAll('.chk-item-compra-lote:checked'); if (checkboxes.length === 0) return mostrarAlerta("Aviso", "Marque os itens.", "warning"); abrirConfirmacao("Excluir Selecionados?", `Deseja apagar ${checkboxes.length} itens marcados?`, "🗑️", "#A05252", "#803f3f", "🗑️ Confirmar", async () => { mostrarLoading("Apagando..."); for (let chk of checkboxes) { await fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "excluir_registro", aba: "Compras", linha: chk.value, log_detalhe: `🗑️ Excluiu compra em lote.` }) }); } mostrarAlerta("Removidos!", "Itens apagados.", "success"); sincronizarDadosUnico(); }); }

// ==========================================
// 🤖 SUGESTÃO INTELIGENTE DE COMPRAS
// Cruza: Fábrica (perfumes abaixo do mínimo) + Essências (cód. fornecedor) + Despesas (último preço pago)
// ==========================================
let sugestaoComprasAtual = [];

// Compara nomes ignorando maiúsculas e acentos ("Essência" bate com "essencia")
function normalizarNomeBusca(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }

// 🔎 Transforma um <select> gigante num campo de busca com lista: toca, vê tudo, digita pra filtrar,
// toca no nome pra escolher. Ao sair do campo, o texto volta a mostrar o que está selecionado —
// impossível "esquecer filtrado". O select original continua existindo (escondido) como fonte da verdade,
// então nada do código existente muda.
function iniciarComboBusca(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel || sel.dataset.combo) return; // já transformado
    sel.dataset.combo = '1';

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = '🔎 Toque pra buscar...';
    inp.autocomplete = 'off';
    const painel = document.createElement('div');
    painel.style.cssText = 'position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid var(--border-color); border-radius:10px; max-height:230px; overflow-y:auto; z-index:5000; display:none; box-shadow:0 10px 25px rgba(0,0,0,0.15); margin-top:4px;';

    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(inp);
    wrap.appendChild(painel);
    wrap.appendChild(sel);
    sel.style.display = 'none';

    const rotuloAtual = () => { const op = sel.options[sel.selectedIndex]; return (op && op.value) ? op.textContent : ''; };

    const renderPainel = (termo) => {
        const t = normalizarNomeBusca(termo);
        let html = '';
        [...sel.options].forEach(op => {
            const especial = !op.value || op.value === 'todos'; // "Nenhum..." e "TODOS OS DEVEDORES" sempre aparecem
            if (!t || especial || normalizarNomeBusca(op.textContent).includes(t)) {
                html += `<div class="combo-op" data-v="${String(op.value).replace(/"/g, '&quot;')}" style="padding:11px 14px; font-size:0.85rem; font-weight:600; cursor:pointer; border-bottom:1px solid #f3f4f6; ${op.value ? 'color:var(--brand-dark);' : 'color:#999;'}">${op.textContent}</div>`;
            }
        });
        painel.innerHTML = html || `<div style="padding:11px 14px; font-size:0.8rem; color:#999;">Nada encontrado…</div>`;
        painel.style.display = 'block';
    };

    inp.addEventListener('focus', () => { inp.select(); renderPainel(''); });
    inp.addEventListener('input', () => renderPainel(inp.value));
    inp.addEventListener('blur', () => setTimeout(() => { painel.style.display = 'none'; inp.value = rotuloAtual(); }, 250));
    painel.addEventListener('mousedown', (e) => {
        const alvo = e.target.closest('.combo-op');
        if (!alvo) return;
        e.preventDefault(); // segura o blur até terminarmos a escolha
        sel.value = alvo.dataset.v;
        inp.value = rotuloAtual();
        painel.style.display = 'none';
        inp.blur();
        sel.dispatchEvent(new Event('change'));
    });

    // Se o select mudar por fora (sync recriou as opções / código limpou a seleção), o texto acompanha
    sel.addEventListener('change', () => { if (document.activeElement !== inp) inp.value = rotuloAtual(); });
    inp.value = rotuloAtual();
}

// ✍️ Em TODO campo com lista de sugestões do sistema: tocar no campo já seleciona o texto inteiro.
// Assim é só digitar por cima pra buscar outra coisa — sem precisar apagar letra por letra.
document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && el.tagName === 'INPUT' && el.getAttribute('list') && el.value && !el.readOnly) {
        setTimeout(() => { try { el.select(); } catch (err) {} }, 0);
    }
});

// ⬆️ Mostra o botão de "voltar ao topo" só depois que a pessoa desceu uma boa rolagem
window.addEventListener('scroll', () => {
    const btnTopo = document.getElementById('btn-voltar-topo');
    if (btnTopo) btnTopo.classList.toggle('visivel', window.scrollY > 500);
}, { passive: true });

// Procura nas Despesas o gasto mais recente cujo nome "lembra" a essência (os nomes nem sempre batem exatos)
function buscarUltimoPrecoEssencia(nomeEssencia) {
    const alvo = normalizarNomeBusca(nomeEssencia);
    if (!alvo) return null;
    let melhor = null;
    gastosGlobal.forEach(g => {
        const item = normalizarNomeBusca(g.item);
        if (!item) return;
        const bate = item.includes(alvo) || (item.length >= 4 && alvo.includes(item));
        if (bate && parseDinheiro(g.valor) > 0) {
            if (!melhor || String(g.dataIso) > String(melhor.dataIso)) melhor = g;
        }
    });
    return melhor;
}

function gerarSugestaoCompras() {
    // Mesma matemática do radar da Fábrica: físico + macerando - reservado em encomendas
    let totalMacerandoPorProduto = {};
    producaoGlobal.forEach(p => { if (p.status === 'Em Andamento') { let n = padronizarTexto(p.nome_produto); totalMacerandoPorProduto[n] = (totalMacerandoPorProduto[n] || 0) + (parseFloat(p.qtd_prevista) || 0); } });
    let totalEncomendadoPorProduto = {};
    encomendasGlobal.forEach(enc => { if (enc.status === 'Pendente' || enc.status === 'Produzido') { let n = padronizarTexto(enc.item); totalEncomendadoPorProduto[n] = (totalEncomendadoPorProduto[n] || 0) + (parseInt(enc.qtd) || 0); } });
    const minEstoqueGlob = parseInt(configuracoesGlobais.estoque_minimo) || 5;

    // Agrupa o déficit por essência: dois volumes do mesmo perfume somam na mesma essência
    const porEssencia = {};
    for (let key in estoqueAgrupado) {
        const e = estoqueAgrupado[key];
        if (!String(e.tipo).toLowerCase().includes('perfume')) continue;
        const projetado = (e.totalQtd + (totalMacerandoPorProduto[key] || 0)) - (totalEncomendadoPorProduto[key] || 0);
        if (projetado >= minEstoqueGlob) continue;
        const deficit = minEstoqueGlob - projetado;

        const rotulo = rotulosGlobal.find(r => r.codigo === e.codigo);
        const chave = rotulo ? String(rotulo.codigo) : 'sem-rotulo-' + key;
        if (!porEssencia[chave]) porEssencia[chave] = { essencia: rotulo ? rotulo.essencia : e.nome, codigoForn: rotulo ? (rotulo.codigo_forn || '') : '', marca: rotulo ? (rotulo.marca || '') : '', temRotulo: !!rotulo, deficit: 0, produtos: [] };
        porEssencia[chave].deficit += deficit;
        porEssencia[chave].produtos.push(`${e.nome} (faltam ${deficit})`);
    }

    sugestaoComprasAtual = Object.values(porEssencia).map(s => ({ ...s, ultimoGasto: buscarUltimoPrecoEssencia(s.essencia) }));

    if (sugestaoComprasAtual.length === 0) return mostrarAlerta("Tudo em dia! ✨", `Nenhum perfume abaixo do estoque mínimo (${minEstoqueGlob} un). Nada a comprar por enquanto.`, "success");

    renderizarSugestaoCompras();
    document.getElementById('modal-sugestao-compras').style.display = 'flex';
}

function renderizarSugestaoCompras() {
    const rendimento = Math.max(1, parseInt(document.getElementById('sc-rendimento').value) || 5);
    let html = '';
    sugestaoComprasAtual.forEach((s, i) => {
        const qtdSugerida = Math.ceil(s.deficit / rendimento);
        const codTxt = s.codigoForn ? `<span style="background:#fdf5f7; border:1px solid #f3d8e2; color:#966178; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:900;">Cód. Forn: ${s.codigoForn}</span>` : `<span style="color:#b45309; font-size:0.65rem; font-weight:700;">⚠️ Sem cód. fornecedor no menu Essências</span>`;
        const marcaTxt = s.marca ? ` <span style="font-size:0.65rem; color:#888;">(${s.marca})</span>` : '';
        const infoPreco = s.ultimoGasto
            ? `💰 Último pago: <b>${safeFmt(s.ultimoGasto.valor)}</b> em ${s.ultimoGasto.dataDisplay} <span style="color:#888;">— despesa: "${s.ultimoGasto.item}"</span>`
            : `<span style="color:#b45309;">💰 Preço não encontrado nas Despesas — preencha ao lado</span>`;
        const precoInicial = s.ultimoGasto ? safeFmt(s.ultimoGasto.valor) : '';

        html += `
        <div style="border:1px solid var(--border-color); border-radius:10px; padding:12px; margin-bottom:10px; background:#fff;">
            <div style="display:flex; align-items:flex-start; gap:10px;">
                <input type="checkbox" id="sc-chk-${i}" checked style="width:20px; height:20px; margin-top:2px; flex-shrink:0;">
                <div style="flex:1; min-width:0;">
                    <p style="margin:0 0 4px 0; font-weight:800; font-size:0.85rem; color:var(--brand-dark);">🧴 Essência ${s.essencia}${marcaTxt}</p>
                    <div style="margin-bottom:5px;">${codTxt}</div>
                    <p style="margin:0 0 4px 0; font-size:0.7rem; color:#666;">📉 Faltam <b>${s.deficit} perfumes</b>: ${s.produtos.join(' | ')}</p>
                    <p style="margin:0 0 8px 0; font-size:0.7rem; color:#444;">${infoPreco}</p>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;"><label style="font-size:0.6rem;">Qtd Essências</label><input type="number" id="sc-qtd-${i}" value="${qtdSugerida}" min="1" style="padding:8px;"></div>
                        <div style="flex:1;"><label style="font-size:0.6rem;">Valor Unit.</label><input type="text" id="sc-valor-${i}" class="mask-money" value="${precoInicial}" placeholder="R$ 0,00" style="padding:8px;"></div>
                    </div>
                </div>
            </div>
        </div>`;
    });
    document.getElementById('lista-sugestao-compras').innerHTML = html;
}

let sugestaoEmEnvio = false; // trava contra clique duplo no confirmar
async function confirmarSugestaoCompras() {
    if (sugestaoEmEnvio) return;
    const selecionados = [];
    sugestaoComprasAtual.forEach((s, i) => {
        const chk = document.getElementById('sc-chk-' + i);
        if (!chk || !chk.checked) return;
        const qtd = Math.max(1, parseInt(document.getElementById('sc-qtd-' + i).value) || 1);
        const valor = parseDinheiro(document.getElementById('sc-valor-' + i).value);
        selecionados.push({ s, qtd, valor });
    });
    if (selecionados.length === 0) return mostrarAlerta("Aviso", "Marque ao menos uma essência para adicionar.", "warning");

    sugestaoEmEnvio = true;
    const btnConf = document.getElementById('btn-confirmar-sugestao');
    if (btnConf) { btnConf.disabled = true; btnConf.innerHTML = '⏳ ADICIONANDO...'; }
    mostrarLoading("Adicionando à Fila de Compras...");

    try {
        const hoje = new Date();
        const dataIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        for (let sel of selecionados) {
            const nomeItem = `Essência ${sel.s.essencia}` + (sel.s.codigoForn ? ` Cod: ${sel.s.codigoForn}` : '');
            await fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_compra", data: dataIso, categoria: "Fragâncias", item: nomeItem, qtd: sel.qtd, valor: fmtPlanilha(sel.valor), log_detalhe: `🤖 Sugestão da fábrica: ${sel.qtd}x ${nomeItem}` }) });
        }
        document.getElementById('modal-sugestao-compras').style.display = 'none';
        mostrarAlerta("Pronto!", `${selecionados.length} essência(s) adicionada(s) à Fila de Compras.`, "success");
        sincronizarDadosUnico();
    } catch (e) {
        mostrarAlerta("Erro", "Falha ao enviar. Verifique a conexão e tente de novo.", "error");
    } finally {
        ocultarLoading();
        sugestaoEmEnvio = false;
        if (btnConf) { btnConf.disabled = false; btnConf.innerHTML = '✅ Adicionar Selecionados à Fila'; }
    }
}

function calcularTotalGasto() { const qtd = parseFloat(document.getElementById('g-qtd').value) || 1; const valUnit = parseDinheiro(document.getElementById('g-valor').value); document.getElementById('g-total').value = valUnit > 0 ? fmt(qtd * valUnit) : "R$ 0,00"; }
function calcularEditGasto() { const qtd = parseFloat(document.getElementById('edit-g-qtd').value) || 1; const valUnit = parseDinheiro(document.getElementById('edit-g-valor').value); document.getElementById('edit-g-total').value = valUnit > 0 ? fmt(qtd * valUnit) : "R$ 0,00"; }

function salvarGasto() {
    const data = document.getElementById('g-data').value,
        local = padronizarTexto(document.getElementById('g-local').value),
        socio = padronizarTexto(document.getElementById('g-socio').value),
        item = padronizarTexto(document.getElementById('g-item').value),
        qtd = document.getElementById('g-qtd').value,
        valor = parseDinheiro(document.getElementById('g-valor').value),
        total = parseDinheiro(document.getElementById('g-total').value);

    if (!data || !item || valor === 0) return mostrarAlerta("Atenção", "Preencha a Data, Item e Valor.", "warning");

    mostrarLoading("Salvando...");
    const msgLog = `💸 Lançou despesa: [${item}] valor de ${fmtPlanilha(total)}`;

    fetch(API_NOVERA, {
        method: "POST",
        headers: cabecalhoAuth(),
        body: JSON.stringify({
            usuario: usuarioLogado,
            acao: "salvar_gasto",
            data: data,
            local: local,
            socio: socio,
            item: item,
            qtd: qtd,
            valor: fmtPlanilha(valor),
            total: fmtPlanilha(total),
            log_detalhe: msgLog
        })
    })
        .then(r => r.json())
        .then(resultado => {
            if (resultado.sucesso) {
                mostrarAlerta("Sucesso", "Despesa lançada.", "success");
                document.getElementById('g-item').value = "";
                document.getElementById('g-valor').value = "";
                document.getElementById('g-total').value = "";
                sincronizarDadosUnico();
            } else {
                mostrarAlerta("Erro", resultado.erro || "Falha ao salvar no banco.", "error");
            }
        })
        .catch(e => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
}

let limiteGastosLista = 30;
let assinaturaFiltrosGastos = '';
function mostrarMaisGastos() { limiteGastosLista += 60; renderizarGastos(); }

function renderizarGastos() {
    const fSocio = document.getElementById('f-socio').value.toLowerCase();
    const fIni = document.getElementById('f-data-ini').value;
    const fFim = document.getElementById('f-data-fim').value;
    const tBusca = document.getElementById('busca-gastos').value.toLowerCase().trim();

    const assinaturaG = [fSocio, fIni, fFim, tBusca].join('|');
    if (assinaturaG !== assinaturaFiltrosGastos) { assinaturaFiltrosGastos = assinaturaG; limiteGastosLista = 30; }

    let filtrados = gastosGlobal.filter(g => { 
        let passSocio = fSocio === "" || String(g.socio).toLowerCase().includes(fSocio); 
        let passData = true; 
        if (fIni && g.dataIso < fIni) passData = false; 
        if (fFim && g.dataIso > fFim) passData = false; 
        let passBusca = true; 
        if (tBusca) { 
            const txtAll = (g.item + " " + g.local + " " + g.socio).toLowerCase(); 
            if (!txtAll.includes(tBusca)) passBusca = false; 
        } 
        return passSocio && passData && passBusca; 
    }); 
    
    filtrados.sort((a, b) => new Date(b.dataIso) - new Date(a.dataIso)); 
    let somaTotal = 0, html = ""; 
    
    if (filtrados.length === 0) { 
        html = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Vazio.</p>"; 
    } else { 
        let gruposGastos = {};

        filtrados.forEach(g => { 
            somaTotal += parseDinheiro(g.total); 

            let dataChave = g.dataDisplay || g.dataIso || "Sem Data";
            if(!gruposGastos[dataChave]) gruposGastos[dataChave] = { itens: [], totalDia: 0 };

            gruposGastos[dataChave].totalDia += parseDinheiro(g.total);

            gruposGastos[dataChave].itens.push(`
            <div class="rotulo-card card-gasto-list" style="border-left: 5px solid #A05252; border-radius: 8px; padding: 15px;">
                <div class="prod-info-main" style="flex:1;">
                    <div class="g-nome-block">
                        <h4 style="margin: 0 0 3px 0; font-size: 0.95rem; color: var(--brand-dark);">${g.item}</h4>
                        <p style="font-size:0.7rem; color:#666; margin: 0;">📍 Local: <b>${g.local}</b></p>
                    </div>
                    <div class="g-detalhe-block">
                        <p style="margin:0; font-size:0.85rem; color: var(--brand-dark);"><b>${g.qtd}x</b> unit. ${safeFmt(g.valor)}</p>
                        <p style="font-size:0.65rem; color:#a1a1aa; margin:2px 0 0 0;">Sócio/Responsável: ${g.socio || '-'}</p>
                    </div>
                </div>
                <div class="prod-actions">
                    <div style="text-align: right;">
                        <p style="font-size:0.7rem; color:#A05252; font-weight:700; margin:0;">Valor Pago</p>
                        <p style="margin: 2px 0 0 0; color: #A05252; font-size: 1.2rem; font-weight: 900;">${safeFmt(g.total)}</p>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button class="btn-acao" style="width:36px; height:36px;" onclick="abrirModalEditarGasto(${g.linha})" title="Editar">✏️</button>
                        <button class="btn-acao" style="width:36px; height:36px;" onclick="prepararExclusaoRegistro('Gastos', ${g.linha}, 'Despesa: ${g.item}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            </div>`); 
        }); 

        let gItensRender = 0, gDiasOcultos = 0, gItensOcultos = 0;
        for (const data of Object.keys(gruposGastos)) {
            if (gItensRender >= limiteGastosLista) { gDiasOcultos++; gItensOcultos += gruposGastos[data].itens.length; continue; }
            html += `<div class="separador-data div-atrasado" style="margin: 25px 0 10px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span>📅 DESPESAS DO DIA: ${data}</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.3);">💸 GASTO TOTAL: ${fmt(gruposGastos[data].totalDia)}</span>
                     </div>`;
            html += `<div class="grid-gastos-grupo">`;
            html += gruposGastos[data].itens.join('');
            html += `</div>`;
            gItensRender += gruposGastos[data].itens.length;
        }
        if (gItensOcultos > 0) {
            html += `<button class="btn-salvar" style="background:#fff; color:#A05252; border:2px dashed #A05252; box-shadow:none; margin-top:20px; font-size:0.85rem;" onclick="mostrarMaisGastos()">⬇️ Mostrar mais ${gDiasOcultos} dia(s) — ${gItensOcultos} despesa(s) mais antiga(s)</button>`;
        }
    }
    
    document.getElementById('lista-gastos-cadastrados').innerHTML = html; 
    document.getElementById('g-total-dashboard').innerText = fmt(somaTotal); 
}

function abrirModalEditarGasto(linha) { const g = gastosGlobal.find(x => x.linha === linha); if (!g) return; document.getElementById('edit-g-linha').value = g.linha; document.getElementById('edit-g-data').value = g.dataIso; document.getElementById('edit-g-socio').value = g.socio; document.getElementById('edit-g-local').value = g.local; document.getElementById('edit-g-item').value = g.item; document.getElementById('edit-g-qtd').value = g.qtd; document.getElementById('edit-g-valor').value = safeFmt(g.valor); document.getElementById('edit-g-total').value = safeFmt(g.total); document.getElementById('modal-editar-gasto').style.display = 'flex'; }
function salvarEdicaoGasto() { const linha = document.getElementById('edit-g-linha').value; const gOrig = gastosGlobal.find(x => x.linha == linha); const vTotal = parseDinheiro(document.getElementById('edit-g-total').value); const py = { usuario: usuarioLogado, acao: "atualizar_gasto", linha: linha, data: document.getElementById('edit-g-data').value, local: padronizarTexto(document.getElementById('edit-g-local').value), socio: padronizarTexto(document.getElementById('edit-g-socio').value), item: padronizarTexto(document.getElementById('edit-g-item').value), qtd: document.getElementById('edit-g-qtd').value, valor: parseDinheiro(document.getElementById('edit-g-valor').value), total: vTotal, log_detalhe: `✏️ Editou despesa [${gOrig ? gOrig.item : 'Item'}]: ${gOrig ? safeFmt(gOrig.total) : ''} -> ${fmtPlanilha(vTotal)}` }; document.getElementById('modal-editar-gasto').style.display = 'none'; mostrarLoading("Salvando..."); py.valor = fmtPlanilha(py.valor); py.total = fmtPlanilha(py.total); fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(py) }).then(() => { mostrarAlerta("Atualizado!", "Edição salva.", "success"); sincronizarDadosUnico(); }); }

let limiteEncomendasLista = 20;
let assinaturaBuscaEncomendas = '';
function mostrarMaisEncomendas() { limiteEncomendasLista += 40; renderizarEncomendas(); }

function renderizarEncomendas() {
    const isAdmin = (usuarioCargo === 'Admin');
    const fila = document.getElementById('lista-encomendas-cards');
    const tBusca = document.getElementById('busca-encomendas').value.toLowerCase().trim();
    if (tBusca !== assinaturaBuscaEncomendas) { assinaturaBuscaEncomendas = tBusca; limiteEncomendasLista = 20; }
    // 'Atendida' = já virou venda automaticamente: sai da lista (fica no banco só como histórico)
    let pendentes = encomendasGlobal.filter(e => e.status !== 'Entregue' && e.status !== 'Atendida');
    if (tBusca) { pendentes = pendentes.filter(e => (e.cliente + " " + e.item).toLowerCase().includes(tBusca)); }
    pendentes.sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
    if (encomendasGlobal.length === 0) { fila.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Nenhuma encomenda ativa.</p>"; return; }
    if (pendentes.length === 0) { fila.innerHTML = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Tudo Entregue ou Não Encontrado!</p>"; return; }

    const encOcultas = Math.max(0, pendentes.length - limiteEncomendasLista);
    let html = "";
    pendentes.slice(0, limiteEncomendasLista).forEach(e => {
        let classBadge = e.status === 'Pendente' ? 'b-atrasado' : 'b-ok';
        let btnVender = e.status === 'Produzido' ? `<button class="btn-salvar" style="margin-top:5px; padding:10px; background:#2C2A2B; font-size:0.8rem; width:100%;" onclick="puxarVendaDeEncomenda(${e.linha})">🚀 Vender (PDV)</button>` : '';
        // Só Admin decide se já ficou pronto — o vendedor só cria/consulta/exclui a própria
        let toggleStatus = '';
        if (isAdmin && e.status === 'Pendente') toggleStatus = `<button class="btn-acao" style="background:#e8f5e9; color:#2e7d32; border-color:#c8e6c9;" onclick="mudarStatusEncomenda(${e.linha}, 'Produzido')" title="Marcar Produzido">✔️</button>`;
        else if (isAdmin && e.status === 'Produzido') toggleStatus = `<button class="btn-acao" style="background:#fee2e2; color:#991b1b; border-color:#fecaca;" onclick="mudarStatusEncomenda(${e.linha}, 'Pendente')" title="Desfazer">↩️</button>`;
        const podeExcluir = isAdmin || String(e.socio || '').toLowerCase().trim() === usuarioLogado.toLowerCase().trim();
        const btnExcluir = podeExcluir ? `<button class="btn-acao" onclick="prepararExclusaoRegistro('Encomendas', ${e.linha}, 'Pedido de ${e.cliente}')">🗑️</button>` : '';
        const txtSocio = e.socio ? `<p style="font-size:0.65rem; color:#888; margin:2px 0 0 0;">👤 Anotado por: ${e.socio}</p>` : '';

        html += `<div class="rotulo-card" style="flex-direction:column; align-items:stretch;"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><div class="rotulo-info"><h4>${e.cliente} <span class="badge-status ${classBadge}" style="margin-left:5px;">${e.status}</span></h4><p style="color:var(--primary); font-weight:800; font-size:0.7rem;">Pedido: ${e.dataDisplay}</p><p><b>${e.qtd}x</b> ${e.item}</p><p style="font-size:0.7rem; color:#888; font-style:italic;">Obs: ${e.obs}</p>${txtSocio}</div><div style="display:flex; gap:5px;">${toggleStatus}${btnExcluir}</div></div>${btnVender}</div>`;
    });
    if (encOcultas > 0) {
        html += `<button class="btn-salvar" style="background:#fff; color:var(--primary-dark); border:2px dashed var(--primary); box-shadow:none; margin-top:15px; font-size:0.85rem;" onclick="mostrarMaisEncomendas()">⬇️ Mostrar mais ${encOcultas} encomenda(s) antiga(s)</button>`;
    }
    fila.innerHTML = html;
}
function salvarEncomenda() { const data = document.getElementById('e-data').value, cli = padronizarTexto(document.getElementById('e-cliente').value), item = padronizarTexto(document.getElementById('e-item').value), qtd = document.getElementById('e-qtd').value, obs = document.getElementById('e-obs').value; if (!data || !cli || !item) return mostrarAlerta("Atenção", "Preencha Data, Cliente e Item.", "warning"); mostrarLoading("Salvando..."); const msgLog = `📦 Nova encomenda de ${cli}: ${qtd}x [${item}]`; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_encomenda", data: data, cliente: cli, item: item, qtd: qtd, status: 'Pendente', obs: obs, log_detalhe: msgLog }) }).then(() => { mostrarAlerta("Registrado", "Encomenda salva.", "success"); document.getElementById('e-item').value = ""; document.getElementById('e-obs').value = ""; sincronizarDadosUnico(); }); }
function mudarStatusEncomenda(linha, novoStatus) { let e = encomendasGlobal.find(x => x.linha == linha); if (!e) return; mostrarLoading("Atualizando..."); const msgLog = `🔄 Pedido de ${e.cliente} marcado como ${novoStatus}`; fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "atualizar_encomenda_status", linha: linha, status: novoStatus, log_detalhe: msgLog }) }).then(() => sincronizarDadosUnico()); }
function puxarVendaDeEncomenda(linha) { const e = encomendasGlobal.find(x => x.linha == linha); if (!e) return; switchTab('vendas'); toggleVendasTab('registro'); document.getElementById('v-cliente').value = e.cliente; document.getElementById('v-qtd').value = e.qtd; document.getElementById('v-observacao').value = "REF ENCOMENDA: " + e.item; const dropdownProd = document.getElementById('v-produto'); let options = Array.from(dropdownProd.options); let achou = options.find(opt => opt.value.toLowerCase() === e.item.toLowerCase()); if (achou) { dropdownProd.value = achou.value; autoPreencherValorVenda(); } mostrarAlerta("Preenchido!", "Preenchemos o PDV para você.", "success"); }

function onStatusVendaChange(isEdit = false) {
    const prefix = isEdit ? 'edit-v-' : 'v-';
    const status = document.getElementById(prefix + 'status').value;
    if (status === 'Presente') {
        document.getElementById(prefix + 'valor').value = "R$ 0,00";
    } else {
        if(isEdit) autoPreencherEdicaoVenda();
        else autoPreencherValorVenda();
    }
}

// Descobre qual local deveria vir pré-selecionado: o local com o nome do vendedor (mesmo com apelido/acento diferente), senão "Sede"
function encontrarLocalPadraoVenda(locaisDisponiveis) {
    if (!locaisDisponiveis || locaisDisponiveis.length === 0) return '';
    const campoSocio = document.getElementById('v-socio');
    const socioNorm = campoSocio ? normalizarNomeBusca(campoSocio.value) : '';
    if (socioNorm) {
        const matchSocio = locaisDisponiveis.find(loc => normalizarNomeBusca(loc).includes(socioNorm));
        if (matchSocio) return matchSocio;
    }
    const matchSede = locaisDisponiveis.find(loc => normalizarNomeBusca(loc) === 'sede');
    return matchSede || locaisDisponiveis[0];
}

function autoPreencherValorVenda() { const selecao = document.getElementById('v-produto').value; const nomePadronizado = padronizarTexto(selecao); const prodAgrupado = estoqueAgrupado[nomePadronizado]; const imgPrev = document.getElementById('v-produto-img-preview'); const comboLocal = document.getElementById('v-local-estoque'); if (comboLocal) comboLocal.innerHTML = ''; if (prodAgrupado && prodAgrupado.totalQtd > 0) { const qtd = parseInt(document.getElementById('v-qtd').value) || 1; const valorUnitario = parseDinheiro(prodAgrupado.preco); document.getElementById('v-valor').value = fmt(valorUnitario * qtd); imgPrev.src = melhorFotoUrl(prodAgrupado.foto) || 'logo.png'; imgPrev.style.display = 'block'; if (comboLocal) { let count = 0; let locaisDisp = []; for (let loc in prodAgrupado.locais) { if (prodAgrupado.locais[loc] > 0) { comboLocal.innerHTML += `<option value="${loc}">${loc} (Disp: ${prodAgrupado.locais[loc]})</option>`; locaisDisp.push(loc); count++; } } if (count === 0) { comboLocal.innerHTML = `<option value="">Sem estoque</option>`; } else { comboLocal.value = encontrarLocalPadraoVenda(locaisDisp); } } } else { document.getElementById('v-valor').value = ""; imgPrev.style.display = 'none'; if (comboLocal) comboLocal.innerHTML = `<option value="">Selecione o Produto Primeiro...</option>`; } atualizarAvisoBonusProduto(selecao); }

// Reforça o bônus de comissão bem no momento em que o vendedor acabou de escolher o produto — não dá pra rolar a tela e perder
function atualizarAvisoBonusProduto(nomeProduto) {
    const aviso = document.getElementById('aviso-bonus-produto-selecionado');
    if (!aviso) return;

    const bonusAtivo = bonusComissaoGlobal.find(b => b.nomeProduto === nomeProduto);
    if (usuarioCargo === 'Admin' || !nomeProduto || !bonusAtivo) { aviso.style.display = 'none'; return; }

    aviso.innerHTML = `🔥 Esse produto tem bônus de <b>+${bonusAtivo.bonusPercentual}%</b> de comissão hoje!`;
    aviso.style.display = 'block';
}

function autoPreencherEdicaoVenda() { 
    const selecao = document.getElementById('edit-v-produto').value;
    const nomePadronizado = padronizarTexto(selecao);
    const prodAgrupado = estoqueAgrupado[nomePadronizado];
    const comboLocal = document.getElementById('edit-v-local');

    if(prodAgrupado) { 
        const qtd = parseInt(document.getElementById('edit-v-qtd').value) || 1, valorUnitario = parseDinheiro(prodAgrupado.preco); 
        
        if(document.getElementById('edit-v-status').value !== 'Presente') {
            document.getElementById('edit-v-valor').value = fmt(valorUnitario * qtd); 
        }

        if(comboLocal) {
            comboLocal.innerHTML = '';
            let count = 0;
            for(let loc in prodAgrupado.locais) {
                if(prodAgrupado.locais[loc] > 0) {
                    comboLocal.innerHTML += `<option value="${loc}">${loc} (Disp: ${prodAgrupado.locais[loc]})</option>`;
                    count++;
                }
            }
            if (count === 0) comboLocal.innerHTML = `<option value="">Sem estoque</option>`;
        }
    } 
}

// ==========================================
// MÓDULO: CARRINHO DE COMPRAS E PDV
// ==========================================
let carrinhoPDV = [];

function adicionarItemCarrinho() {
    const produto = document.getElementById('v-produto').value;
    const elLocal = document.getElementById('v-local-estoque');
    const localRetirada = elLocal ? elLocal.value : "";
    const qtd = parseInt(document.getElementById('v-qtd').value) || 1;
    const valorStr = document.getElementById('v-valor').value;
    const valTotalItem = parseDinheiro(valorStr);

    if (!produto || valTotalItem < 0 || !localRetirada) {
        return mostrarAlerta("Atenção", "Preencha o Produto, Local e Valor antes de inserir.", "warning");
    }

    const prodAgrupado = estoqueAgrupado[padronizarTexto(produto)];
    const cUnd = prodAgrupado ? parseDinheiro(prodAgrupado.custo) : 0;
    const cTot = cUnd * qtd;

    // Coloca o item na memória do celular
    carrinhoPDV.push({
        produto: produto,
        local_estoque: localRetirada,
        qtd: qtd,
        valor_total_item: valTotalItem,
        custo_und: cUnd,
        custo_total: cTot
    });

    // Limpa apenas a parte do produto para o vendedor bipar o próximo
    document.getElementById('v-produto').value = '';
    document.getElementById('v-qtd').value = '1';
    document.getElementById('v-valor').value = '';
    if (elLocal) elLocal.innerHTML = '<option value="">Selecione o Produto Primeiro...</option>';
    document.getElementById('v-produto-img-preview').style.display = 'none';

    renderizarCarrinho();
}

function removerItemCarrinho(index) {
    carrinhoPDV.splice(index, 1);
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const container = document.getElementById('carrinho-lista');
    const elTotal = document.getElementById('carrinho-total');
    
    if (carrinhoPDV.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.8rem; margin: 10px 0;">Carrinho vazio. Adicione produtos acima.</p>';
        elTotal.innerText = "R$ 0,00";
        return;
    }

    let html = '';
    let somaPedido = 0;
    
    carrinhoPDV.forEach((item, index) => {
        somaPedido += item.valor_total_item;
        const nomeFormatado = formatarNomeProdutoHtml(item.produto, 'venda');
        
        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #E8DDE1;">
            <div style="flex: 1; line-height: 1.3; min-width: 0;">
                <span style="font-weight: 700; color: var(--brand-dark); font-size: 0.85rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.qtd}x ${nomeFormatado}</span>
                <span style="font-size: 0.7rem; color: #888;">📍 Retirada: ${item.local_estoque}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; margin-left: 10px;">
                <span style="font-weight: 800; color: var(--primary-dark); font-size: 0.95rem;">${fmt(item.valor_total_item)}</span>
                <button class="btn-acao" style="width: 28px; height: 28px; font-size: 0.7rem; background: #fee2e2; border-color: #fecaca; color: #991b1b;" onclick="removerItemCarrinho(${index})">❌</button>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    elTotal.innerText = fmt(somaPedido);
}

let vendaCarrinhoEmAndamento = false; // trava contra clique duplo enquanto o pedido está sendo enviado ao servidor

function salvarVendaCarrinho() {
    if (vendaCarrinhoEmAndamento) return; // já tem um envio em andamento, ignora cliques repetidos
    if (carrinhoPDV.length === 0) return mostrarAlerta("Atenção", "O carrinho está vazio! Insira produtos primeiro.", "warning");

    const data = document.getElementById('v-data').value;
    const cliente = padronizarTexto(document.getElementById('v-cliente').value);
    const socio = (usuarioCargo === 'Admin') ? padronizarTexto(document.getElementById('v-socio').value) : padronizarTexto(usuarioLogado);
    const status = document.getElementById('v-status').value;
    const observacao = document.getElementById('v-observacao').value;

    if (!data || !cliente) return mostrarAlerta("Atenção", "Preencha a Data e o Cliente no topo.", "warning");

    vendaCarrinhoEmAndamento = true;
    const btnFinalizar = document.getElementById('btn-finalizar-venda');
    const textoOriginalBtn = btnFinalizar ? btnFinalizar.innerHTML : '';
    if (btnFinalizar) { btnFinalizar.disabled = true; btnFinalizar.innerHTML = '⏳ PROCESSANDO...'; }

    mostrarLoading("Registrando Pedido...");
    const msgLog = `🛒 Pedido Fechado: ${cliente} (${carrinhoPDV.length} itens). Status: ${status}`;

    const envio = {
        usuario: usuarioLogado,
        acao: "salvar_venda_carrinho",
        data: data,
        cliente: cliente,
        socio: socio,
        status: status,
        observacao: observacao,
        carrinho: carrinhoPDV,
        log_detalhe: msgLog
    };

    fetch(API_NOVERA, {
        method: "POST",
        headers: cabecalhoAuth(),
        body: JSON.stringify(envio)
    })
    .then(r => r.json())
    .then(resultado => {
        if (resultado.sucesso) {
            mostrarAlerta("Sucesso", "Pedido finalizado!", "success");
            document.getElementById('v-cliente').value = "";
            document.getElementById('v-observacao').value = "";
            carrinhoPDV = []; // Limpa o carrinho
            renderizarCarrinho();
            sincronizarDadosUnico();
        } else {
            // Se o servidor barrou, mostra a mensagem e Sincroniza o estoque na mesma hora!
            mostrarAlerta("⚠️ Alerta de Estoque", resultado.erro || "Falha ao salvar no banco.", "warning");
            sincronizarDadosUnico();
        }
    })
    .catch(e => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => {
        ocultarLoading();
        vendaCarrinhoEmAndamento = false;
        if (btnFinalizar) { btnFinalizar.disabled = false; btnFinalizar.innerHTML = textoOriginalBtn; }
    });
}

// Mostra pro vendedor os produtos com bônus de comissão ativo agora (Estoque Parado), já somando com a % dele
function renderizarBannerBonusComissao() {
    const banner = document.getElementById('banner-bonus-comissao');
    if (!banner) return;

    if (usuarioCargo === 'Admin' || bonusComissaoGlobal.length === 0) { banner.style.display = 'none'; return; }

    const meuUsuario = usuariosGlobal.find(u => String(u.usuario).toLowerCase().trim() === usuarioLogado.toLowerCase().trim());
    const minhaComissao = meuUsuario ? (parseFloat(meuUsuario.comissao) || 0) : 0;

    const itens = bonusComissaoGlobal
        .map(b => ({ bonus: b, estoque: estoqueAgrupado[padronizarTexto(b.nomeProduto)] }))
        .filter(x => x.estoque && x.estoque.totalQtd > 0);

    if (itens.length === 0) { banner.style.display = 'none'; return; }

    let html = `<div class="banner-bonus-pulso" style="background:#fef3c7; border:1px solid #fbbf24; border-radius:12px; padding:15px; margin-bottom:15px;">
        <p style="margin:0 0 10px 0; font-weight:900; color:#92400e; font-size:0.85rem;"><span class="fogo-pulso" style="display:inline-block;">🔥</span> COMISSÃO EXTRA NESSES PRODUTOS HOJE</p>`;

    itens.forEach(({ bonus, estoque }) => {
        const totalPct = (minhaComissao + bonus.bonusPercentual).toFixed(1).replace(/\.0$/, '');
        const codigoBadge = estoque.codigo ? `${estoque.codigo}: ` : '';
        html += `<p style="margin:0 0 6px 0; font-size:0.78rem; color:#78350f; line-height:1.5;">Se vender hoje o perfume <b>${codigoBadge}${estoque.nome}</b>, você ganharia <b>${minhaComissao}% + ${bonus.bonusPercentual}%</b> (adicional) = <b>${totalPct}%</b> de comissão!</p>`;
    });

    html += `</div>`;
    banner.innerHTML = html;
    banner.style.display = 'block';
}

// 💸 Avisa a equipe dos produtos em PROMOÇÃO pro cliente — pra ninguém cobrar preço cheio
// de quem chegou pelo catálogo com desconto anunciado
function renderizarBannerPromosCliente() {
    const banner = document.getElementById('banner-promos-cliente');
    if (!banner) return;

    if (usuarioCargo === 'Admin' || !descontosProdutoGlobal.length) { banner.style.display = 'none'; return; }

    const itensPromo = descontosProdutoGlobal
        .map(dd => ({ desc: dd, estoque: estoqueAgrupado[padronizarTexto(dd.nomeProduto)] }))
        .filter(x => x.estoque && x.estoque.totalQtd > 0);

    if (!itensPromo.length) { banner.style.display = 'none'; return; }

    let html = `<div style="background:#e8f5e9; border:1px solid #86efac; border-radius:12px; padding:15px; margin-bottom:15px;">
        <p style="margin:0 0 10px 0; font-weight:900; color:#166534; font-size:0.85rem;">💸 PROMOÇÃO ATIVA — COBRE O PREÇO COM DESCONTO!</p>`;
    itensPromo.forEach(({ desc, estoque }) => {
        const precoCheio = parseFloat(estoque.preco) || 0;
        const precoPromo = precoCheio > 0 ? precoCheio * (1 - desc.percentual / 100) : 0;
        const codigoBadge = estoque.codigo ? `${estoque.codigo}: ` : '';
        const validadeTxt = desc.validade ? ` (até ${desc.validade.split('-').reverse().join('/')})` : '';
        html += `<p style="margin:0 0 6px 0; font-size:0.78rem; color:#14532d; line-height:1.5;"><b>${codigoBadge}${estoque.nome}</b> está com <b>-${desc.percentual}%</b>${precoCheio > 0 ? `: de <s>${fmt(precoCheio)}</s> por <b>${fmt(precoPromo)}</b>` : ''}${validadeTxt} — o cliente pode chegar já sabendo desse preço pelo catálogo! 📲</p>`;
    });
    html += `</div>`;
    banner.innerHTML = html;
    banner.style.display = 'block';
}

// Avisa o vendedor sobre produtos SEM estoque disponível agora, mas com maceração a caminho (visual discreto, pra não competir com o aviso de bônus)
function renderizarAvisoChegandoEmBreve() {
    const banner = document.getElementById('banner-chegando-em-breve');
    if (!banner) return;

    if (usuarioCargo === 'Admin') { banner.style.display = 'none'; return; }

    let totalEncomendadoPorProduto = {};
    encomendasGlobal.forEach(enc => {
        if (enc.status === 'Pendente' || enc.status === 'Produzido') {
            let nomeP = padronizarTexto(enc.item);
            totalEncomendadoPorProduto[nomeP] = (totalEncomendadoPorProduto[nomeP] || 0) + (parseInt(enc.qtd) || 0);
        }
    });

    let producaoPorProduto = {}; // nome padronizado -> data prevista mais próxima entre os lotes "Em Andamento"
    producaoGlobal.forEach(p => {
        if (p.status !== 'Em Andamento') return;
        const chave = padronizarTexto(p.nome_produto);
        if (!producaoPorProduto[chave] || new Date(p.data_previsao) < new Date(producaoPorProduto[chave])) {
            producaoPorProduto[chave] = p.data_previsao;
        }
    });

    const hojeObj = new Date(); hojeObj.setHours(0, 0, 0, 0);
    let itens = [];

    for (let key in estoqueAgrupado) {
        const e = estoqueAgrupado[key];
        const qtdLivre = e.totalQtd - (totalEncomendadoPorProduto[key] || 0);
        const dataPrevisao = producaoPorProduto[key];
        if (qtdLivre > 0 || !dataPrevisao) continue; // só entra quem está realmente zerado e tem lote a caminho

        const [ano, mes, dia] = dataPrevisao.split('-');
        const diffDias = Math.round((new Date(ano, mes - 1, dia) - hojeObj) / 86400000);
        itens.push({ nome: e.nome, codigo: e.codigo, diffDias, dataBr: `${dia}/${mes}` });
    }

    if (itens.length === 0) { banner.style.display = 'none'; return; }
    itens.sort((a, b) => a.diffDias - b.diffDias);

    const LIMITE_EXIBIDO = 5;
    const visiveis = itens.slice(0, LIMITE_EXIBIDO);
    const restantes = itens.length - visiveis.length;

    let html = `<div style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:10px; padding:12px 15px; margin-bottom:15px;">
        <p style="margin:0 0 8px 0; font-weight:800; color:#4b5563; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.3px;">⏳ Chegando em breve (estoque zerado agora)</p>`;

    visiveis.forEach(item => {
        const txtPrazo = item.diffDias < 0 ? 'atrasado' : item.diffDias === 0 ? 'hoje' : item.diffDias === 1 ? 'amanhã' : `em ${item.diffDias} dias`;
        const codigoTxt = item.codigo ? `${item.codigo}: ` : '';
        html += `<p style="margin:0 0 4px 0; font-size:0.72rem; color:#6b7280;">▫️ ${codigoTxt}${item.nome} — <b>${txtPrazo}</b> (${item.dataBr})</p>`;
    });

    if (restantes > 0) html += `<p style="margin:4px 0 0 0; font-size:0.68rem; color:#9ca3af; font-style:italic;">+ ${restantes} outro(s) produto(s) chegando</p>`;

    html += `</div>`;
    banner.innerHTML = html;
    banner.style.display = 'block';
}

// Monta as <option> de um seletor de produto agrupadas por tipo (optgroup), com ícone de gênero em cada linha
// e o tipo abreviado no nome (ex: "Perf. Fakhar 40ml") — usado tanto no seletor de Venda quanto no de Encomenda,
// pra manter os dois sempre com a mesma cara, sem duplicar essa lógica em dois lugares.
function montarOptionsAgrupadasPorTipo(itens, opcoes = {}) {
    const comBonus = !!opcoes.comBonus;
    const comQtd = opcoes.comQtd !== false; // por padrão mostra a quantidade; Encomendas esconde (é tudo zerado mesmo)
    const mapaBonus = {};
    if (comBonus) bonusComissaoGlobal.forEach(b => mapaBonus[b.nomeProduto] = b.bonusPercentual);

    const iconesPorTipo = { 'perfume': '🌸', 'creme': '🧴', 'home spray': '🏠', 'vela': '🕯️', 'sabonete líquido': '🧼', 'sabonete liquido': '🧼' };
    const iconeDoTipo = (tipo) => iconesPorTipo[String(tipo || '').toLowerCase().trim()] || '📦';

    const iconeGenero = (codigo) => {
        const rotuloRef = rotulosGlobal.find(r => r.codigo === codigo);
        const genLow = rotuloRef && rotuloRef.genero ? String(rotuloRef.genero).toLowerCase().trim() : 'unissex';
        if (genLow === 'feminino') return '🌸';
        if (genLow === 'masculino') return '🔷';
        if (genLow === 'infantil') return '🧸';
        return '⚪';
    };

    const abreviacoesPorTipo = { 'perfume': 'Perf.', 'creme': 'Creme', 'home spray': 'H.Spray', 'vela': 'Vela', 'sabonete líquido': 'Sab.Líq.', 'sabonete liquido': 'Sab.Líq.' };
    const abreviarTipo = (tipo) => {
        const chave = String(tipo || '').toLowerCase().trim();
        if (abreviacoesPorTipo[chave]) return abreviacoesPorTipo[chave];
        return tipo && tipo.length > 6 ? tipo.substring(0, 5) + '.' : (tipo || '');
    };

    // Ordem dos grupos = ordem cadastrada em Parâmetros Globais > Tipos de Produtos Finais. Tipo novo, ainda não listado ali, vai pro fim.
    const ordemTipos = (configuracoesGlobais.tipos_produto || '').split(',').map(s => s.trim()).filter(s => s);
    const indiceTipo = (tipo) => { const i = ordemTipos.findIndex(t => t.toLowerCase() === String(tipo || '').toLowerCase()); return i === -1 ? 999 : i; };

    const escaparRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const abreviarNomeItem = (e) => e.nome.replace(new RegExp('^' + escaparRegex(e.tipo) + '\\s+', 'i'), abreviarTipo(e.tipo) + ' ');

    let html = '';

    // 🔥 Vitrine dos bônus: grupo exclusivo no TOPO da lista. Produto com bônus aparece SÓ aqui
    // (fora do grupo do tipo dele, pra não duplicar). No celular o menu é desenhado pelo sistema,
    // então o destaque vem da posição + título do grupo + foguinho; a cor da linha só pega no PC.
    if (comBonus) {
        const itensComBonus = itens.filter(e => mapaBonus[e.nome]);
        if (itensComBonus.length) {
            html += `<optgroup label="🔥 GANHE + COMISSÃO EXTRA HOJE 🔥">`;
            itensComBonus.sort((a, b) => (mapaBonus[b.nome] || 0) - (mapaBonus[a.nome] || 0)).forEach(e => {
                const exibeCodigo = e.codigo ? e.codigo + ' - ' : '';
                const sufixoQtd = comQtd ? ` (${e.totalQtd}un)` : '';
                html += `<option value="${e.nome}" style="background:#fef3c7; color:#b45309; font-weight:800;">🔥 ${exibeCodigo}${abreviarNomeItem(e)}${sufixoQtd} ⚡+${mapaBonus[e.nome]}%</option>`;
            });
            html += `</optgroup>`;
            itens = itens.filter(e => !mapaBonus[e.nome]);
        }
    }

    const grupos = {};
    itens.forEach(e => {
        const tipoKey = e.tipo || 'Outros';
        if (!grupos[tipoKey]) grupos[tipoKey] = [];
        grupos[tipoKey].push(e);
    });
    Object.keys(grupos).sort((a, b) => {
        const idxA = indiceTipo(a), idxB = indiceTipo(b);
        return idxA !== idxB ? idxA - idxB : a.localeCompare(b);
    }).forEach(tipoKey => {
        grupos[tipoKey].sort((a, b) => {
            if (comBonus) { const ba = mapaBonus[a.nome] || 0, bb = mapaBonus[b.nome] || 0; if (ba !== bb) return bb - ba; }
            return String(b.codigo || "").localeCompare(String(a.codigo || ""));
        });
        const iconeGrupo = iconeDoTipo(tipoKey);
        const tipoEscapado = tipoKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const substituirTipoDoNome = new RegExp('^' + tipoEscapado + '\\s+', 'i');
        const tipoAbreviado = abreviarTipo(tipoKey);

        html += `<optgroup label="${iconeGrupo} ${tipoKey.toUpperCase()}">`;
        grupos[tipoKey].forEach(e => {
            const exibeCodigo = e.codigo ? e.codigo + ' - ' : '';
            const bonusItem = comBonus ? mapaBonus[e.nome] : null;
            const descItem = descontosProdutoGlobal.find(dd => dd.nomeProduto === e.nome);
            const iconeLinha = bonusItem ? '🔥' : (descItem ? '💸' : iconeGenero(e.codigo));
            const nomeAbreviado = e.nome.replace(substituirTipoDoNome, tipoAbreviado + ' ');
            const sufixoBonus = bonusItem ? ` +${bonusItem}%` : '';
            const sufixoDesc = descItem ? ` PROMO -${descItem.percentual}%` : '';
            const sufixoQtd = comQtd ? ` (${e.totalQtd}un)` : '';
            const estiloBonus = bonusItem ? ' style="background:#fef3c7; color:#b45309; font-weight:800;"' : (descItem ? ' style="background:#e8f5e9; color:#166534; font-weight:800;"' : '');
            html += `<option value="${e.nome}"${estiloBonus}>${iconeLinha} ${exibeCodigo}${nomeAbreviado}${sufixoQtd}${sufixoBonus}${sufixoDesc}</option>`;
        });
        html += `</optgroup>`;
    });
    return html;
}

function renderizarVendas() {
    const isAdmin = (usuarioCargo === 'Admin');
    renderizarBannerBonusComissao();
    renderizarBannerPromosCliente();
    renderizarAvisoChegandoEmBreve();
    // Filtra a lista de clientes e devedores para o vendedor ver só os dele
    const listaVendasPermitidas = isAdmin ? vendasGlobal : vendasGlobal.filter(v => String(v.socio).toLowerCase().trim() === usuarioLogado.toLowerCase().trim());

    // Sugestões de cliente = quem já comprou + quem está no cadastro oficial (evita digitar nome novo com erro)
    const dlist = [...new Set([...listaVendasPermitidas.map(v => String(v.cliente).trim()), ...clientesGlobal.map(c => String(c.nome || '').trim())].filter(n => n))].sort((a, b) => a.localeCompare(b));
    document.getElementById('lista-clientes').innerHTML = dlist.map(c => `<option value="${c}">`).join('');
    
    const dlistPagos = [...new Set(listaVendasPermitidas.filter(v => v.status === 'Pago').map(v => String(v.cliente).trim()))].sort((a, b) => a.localeCompare(b));
    const selRecibo = document.getElementById('recibo-cliente'); const reciboAtual = selRecibo.value;
    selRecibo.innerHTML = '<option value="">Nenhum cliente...</option>' + dlistPagos.map(c => `<option value="${c}">${c}</option>`).join('');
    selRecibo.value = reciboAtual;

    const dlistPendentes = [...new Set(listaVendasPermitidas.filter(v => v.status === 'Pendente' || v.status === 'Parcelado').map(v => String(v.cliente).trim()))].sort((a, b) => a.localeCompare(b));
    const selCobranca = document.getElementById('cobranca-cliente'); const cobrancaAtual = selCobranca.value;
    selCobranca.innerHTML = '<option value="">Nenhum devedor...</option><option value="todos">🌟 TODOS OS DEVEDORES</option>' + dlistPendentes.map(c => `<option value="${c}">${c}</option>`).join('');
    selCobranca.value = cobrancaAtual;

    // 🤝 Popula o seletor do Acerto de Comissão em Lote (recurso exclusivo do Admin)
    // 🛡️ Só entram VENDEDORES OFICIAIS da equipe — registros feitos em nome de cliente/admin (ex: "Amor") ficam de fora
    const selAcerto = document.getElementById('ac-vendedor');
    if (selAcerto && isAdmin) {
        const vendedoresOficiais = usuariosGlobal.filter(u => u.cargo === 'Vendedor').map(u => normalizarNomeBusca(u.usuario));
        const pendPorVendedor = {};
        vendasGlobal.forEach(v => {
            if (v.status === 'Pago' && !v.repasse_feito && v.socio && vendedoresOficiais.includes(normalizarNomeBusca(v.socio))) {
                const s = String(v.socio).trim();
                pendPorVendedor[s] = (pendPorVendedor[s] || 0) + 1;
            }
        });
        const selAcertoAtual = selAcerto.value;
        selAcerto.innerHTML = '<option value="">Selecione...</option>' + Object.keys(pendPorVendedor).sort((a, b) => a.localeCompare(b)).map(s => `<option value="${s}">${s} (${pendPorVendedor[s]} pendente${pendPorVendedor[s] > 1 ? 's' : ''})</option>`).join('');
        selAcerto.value = selAcertoAtual;
    }

    // 🔎 Ativa a busca com lista nos seletores grandes (idempotente: só transforma na primeira vez)
    iniciarComboBusca('recibo-cliente');
    iniciarComboBusca('cobranca-cliente');
    iniciarComboBusca('ac-vendedor');

    // 📦 Sugestões do filtro de produto do histórico (só produtos que a pessoa pode ver)
    const dlProdFiltro = document.getElementById('f-lista-produtos');
    if (dlProdFiltro) dlProdFiltro.innerHTML = [...new Set(listaVendasPermitidas.map(v => String(v.produto || '').trim()).filter(p => p))].sort((a, b) => a.localeCompare(b)).map(p => `<option value="${p}">`).join(''); 
    
    // Mesma lista agrupada por tipo: Vendas mostra só o que TEM estoque; Encomendas mostra só o que está ZERADO (encomenda é pro que falta)
    let htmlVendas = '<option value="">Selecione do Estoque...</option>' + montarOptionsAgrupadasPorTipo(Object.values(estoqueAgrupado).filter(e => e.totalQtd > 0), { comBonus: !isAdmin });
    let htmlEncomendas = '<option value="">Selecione o produto esgotado...</option>' + montarOptionsAgrupadasPorTipo(Object.values(estoqueAgrupado).filter(e => (e.totalQtd || 0) <= 0), { comBonus: false, comQtd: false });

    const fvClienteSelect = document.getElementById('f-v-cliente'); 
    const fvClienteAtual = fvClienteSelect.value; 
    fvClienteSelect.innerHTML = '<option value="">Todos</option>' + dlist.map(c => `<option value="${c}">${c}</option>`).join(''); 
    fvClienteSelect.value = fvClienteAtual; 
    
    document.getElementById("v-produto").innerHTML = htmlVendas; 
    document.getElementById("edit-v-produto").innerHTML = htmlVendas; 
    
    const elItemEncomenda = document.getElementById("e-item");
    if(elItemEncomenda) elItemEncomenda.innerHTML = htmlEncomendas;

    filtrarVendas(); 
}

// 🧹 Volta todos os filtros do histórico de vendas pro padrão de fábrica
function limparFiltrosVendas() {
    const elTipo = document.getElementById('f-v-tipo-data'); if (elTipo) elTipo.value = 'venda';
    document.getElementById('f-v-dia').value = '';
    document.getElementById('f-v-mes').value = '';
    document.getElementById('f-v-status').value = '';
    document.getElementById('f-v-socio').value = '';
    document.getElementById('f-v-cliente').value = '';
    const elProd = document.getElementById('f-v-produto'); if (elProd) elProd.value = '';
    const elCom = document.getElementById('f-v-comissao'); if (elCom) elCom.value = '';
    filtrarVendas();
}

// 📜 Paginação da lista de vendas: mostra os dias mais recentes e um botão "Mostrar mais" pro resto.
// Deixa a tela leve mesmo com centenas de vendas — os totais continuam somando TUDO que foi filtrado.
let limiteVendasLista = 30;
let assinaturaFiltrosVendas = '';
function mostrarMaisVendas() { limiteVendasLista += 60; filtrarVendas(); }

function filtrarVendas() {
    const isAdmin = (usuarioCargo === 'Admin');
    const fTipoData = document.getElementById('f-v-tipo-data') ? document.getElementById('f-v-tipo-data').value : 'venda';
    const fDia = document.getElementById('f-v-dia').value, fMes = document.getElementById('f-v-mes').value, fStatus = document.getElementById('f-v-status').value, fSocio = document.getElementById('f-v-socio').value.toLowerCase().trim(), fCliente = normalizarNomeBusca(document.getElementById('f-v-cliente').value); // trim + sem acento: "Cleo " acha "Cléo"
    const elFComissao = document.getElementById('f-v-comissao'); const fComissao = elFComissao ? elFComissao.value : '';
    const elFProduto = document.getElementById('f-v-produto'); const fProduto = elFProduto ? normalizarNomeBusca(elFProduto.value) : '';

    // Mudou qualquer filtro? Volta a paginação pro começo (senão "Mostrar mais" de uma busca vaza pra outra)
    const assinaturaAtual = [fTipoData, fDia, fMes, fStatus, fSocio, fCliente, fProduto, fComissao].join('|');
    if (assinaturaAtual !== assinaturaFiltrosVendas) { assinaturaFiltrosVendas = assinaturaAtual; limiteVendasLista = 30; }

    // 🚨 Aviso visual de filtro ativo: muda a cara do botão de filtros pra ninguém esquecer que a visão está filtrada
    const temFiltroAtivo = !!(fDia || fMes || fStatus || fSocio || fCliente || fComissao || fProduto || fTipoData !== 'venda');
    const btnToggleF = document.getElementById('btn-toggle-filtros-vendas');
    if (btnToggleF) {
        btnToggleF.innerHTML = temFiltroAtivo ? '⚠️ FILTROS ATIVOS — a lista está filtrada' : '🔍 Ocultar / Mostrar Filtros';
        btnToggleF.style.background = temFiltroAtivo ? '#fef3c7' : '#fdf5f7';
        btnToggleF.style.borderColor = temFiltroAtivo ? '#f59e0b' : '#f3d8e2';
        btnToggleF.style.color = temFiltroAtivo ? '#92400e' : 'var(--primary-dark)';
    }
    const btnLimparF = document.getElementById('btn-limpar-filtros-vendas');
    if (btnLimparF) btnLimparF.style.display = temFiltroAtivo ? 'block' : 'none';

    let nomesAdmins = usuariosGlobal.filter(u => u.cargo === 'Admin' || u.cargo === 'Administrador').map(u => String(u.usuario).toLowerCase().trim());
    nomesAdmins.push('amor', 'fernando', 'natália', 'natalia', 'novera', 'admin', 'sem vendedor', '');

    let filtradas = vendasGlobal.filter(v => {
        if (!isAdmin && String(v.socio || '').toLowerCase().trim() !== usuarioLogado.toLowerCase().trim()) return false;

        // Filtro exclusivo de Admin: quem já pagou mas ainda falta (ou já teve) o acerto de comissão com o vendedor
        if (fComissao && isAdmin) {
            const isSocioAdminV = nomesAdmins.includes(String(v.socio || '').toLowerCase().trim());
            if (isSocioAdminV) return false; // comissão só se aplica a vendas de vendedores, não das sócias
            const isPagoV = v.status === 'Pago';
            if (fComissao === 'pendente' && !(isPagoV && !v.repasse_feito)) return false;
            if (fComissao === 'acertado' && !(isPagoV && v.repasse_feito)) return false;
        }

        let pD = true, pM = true, pS = true, pSo = true, pC = true;
        let dataAlvoIso = "";
        if (fTipoData === 'venda') { dataAlvoIso = v.dataVendaIso; } else { if (v.dataPgtoDisplay) { const parts = v.dataPgtoDisplay.split('/'); if (parts.length === 3) dataAlvoIso = `${parts[2]}-${parts[1]}-${parts[0]}`; } }
        if (fDia) { if (dataAlvoIso !== fDia) pD = false; }
        if (fMes) { const mesAlvo = dataAlvoIso ? dataAlvoIso.split('-')[1] : null; if (mesAlvo && mesAlvo !== fMes) pM = false; }
        if (fStatus && v.status !== fStatus) pS = false;
        if (fSocio && String(v.socio || '').toLowerCase() !== fSocio) pSo = false;
        if (fCliente && !normalizarNomeBusca(v.cliente).includes(fCliente)) pC = false;
        if (fProduto) {
            // Aceita nome ("watani") OU código Novera ("N040", "040", "40")
            const casaNome = normalizarNomeBusca(v.produto).includes(fProduto);
            let casaCodigo = false;
            const digitosBusca = fProduto.replace(/\D/g, '');
            if (digitosBusca && fProduto.replace(/[n\d\s]/g, '') === '') { // busca é só código (N + números), não "40ml"
                const prodRefF = estoqueAgrupado[padronizarTexto(v.produto)];
                const codF = prodRefF && prodRefF.codigo ? String(prodRefF.codigo).replace(/\D/g, '') : '';
                casaCodigo = !!codF && parseInt(codF) === parseInt(digitosBusca);
            }
            if (!casaNome && !casaCodigo) return false;
        }
        return pD && pM && pS && pSo && pC;
    });
    
    filtradas.sort((a, b) => new Date(b.dataVendaIso) - new Date(a.dataVendaIso)); 
    
    let tVend = 0, tRec = 0, tDev = 0, tLuc = 0, tItens = 0, html = "";
    let tComPend = 0, tComAcert = 0, tComFutura = 0; 
    
    if (filtradas.length === 0) { 
        html = "<p style='text-align:center; color:#999; font-size:0.8rem;'>Vazio.</p>"; 
    } else {
        let gruposVendas = {};

        filtradas.forEach(v => {
            const val = parseDinheiro(v.valor_venda); tVend += val; tLuc += parseDinheiro(v.lucro); tItens += parseInt(v.qtd) || 0; 
            
            const isP = v.status === 'Pago'; 
            const isPresente = v.status === 'Presente';
            const isAcertado = v.repasse_feito;
            const vComissao = parseFloat(v.valor_comissao) || 0;
            
            const isSocioAdmin = nomesAdmins.includes(String(v.socio || '').toLowerCase().trim());
            
            if(isP) {
                tRec += val; 
                if(isAcertado) { 
                    tComAcert += vComissao; 
                } else if (!isSocioAdmin) { 
                    tComPend += vComissao; 
                } 
            } else if(!isPresente) {
                tDev += val; 
                if (!isSocioAdmin) {
                    tComFutura += vComissao; // Comissão travada pq o cliente não pagou
                }
            } 

            let txtStatus = '';
            let corBorda = "#b45309";
            let badgeClass = 'status-pendente';
            let btnAcerto = '';

            if (isP) {
                if (isSocioAdmin) {
                    txtStatus = `<p style="font-size:0.75rem; color:#2e7d32; font-weight:800; margin:0;">✔️ Pago: ${v.dataPgtoDisplay || '?'}</p>`;
                    corBorda = "#2e7d32"; badgeClass = "status-pago";
                } else {
                    if (isAcertado) {
                        txtStatus = `<p style="font-size:0.75rem; color:#0369a1; font-weight:800; margin:0;">🤝 Acertado / Repassado</p>`;
                        corBorda = "#0369a1"; badgeClass = "status-pago";
                    } else {
                        txtStatus = `<p style="font-size:0.75rem; color:#2e7d32; font-weight:800; margin:0;">✔️ Pago: ${v.dataPgtoDisplay || '?'} (Falta Acerto)</p>`;
                        corBorda = "#2e7d32"; badgeClass = "status-pago";
                        if (isAdmin) {
                            btnAcerto = `<button class="btn-acao" style="width:36px; height:36px; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;" onclick="acertarCaixaVenda(${v.linha})" title="Confirmar Entrada e Comissão">🤝</button>`;
                        }
                    }
                }
            } else if (isPresente) {
                txtStatus = `<p style="font-size:0.75rem; color:#7c3aed; font-weight:800; margin:0;">🎁 Presente</p>`;
                corBorda = "#7c3aed"; badgeClass = "status-presente";
            } else if (v.status === 'Parcelado') {
                corBorda = "#4f46e5"; badgeClass = "status-parcelado";
            }

            // 📲 Nas vendas em aberto, além do sininho (imagem), um botão de cobrar essa venda direto no WhatsApp
            const btnWhatsUnico = (!isP && !isPresente) ? `<button class="btn-acao" style="width:36px; height:36px; background:#dcfce7; color:#15803d; border-color:#bbf7d0;" onclick="cobrarVendaNoWhatsApp(${v.linha})" title="Cobrar no WhatsApp">📲</button>` : '';
            const btnAcaoExtra = (isP ? `<button class="btn-acao" style="width:36px; height:36px; background:#f0fdf4; color:#166534; border-color:#bbf7d0;" onclick="gerarReciboUnico(${v.linha})" title="Gerar Recibo Rápido">🧾</button>` : `<button class="btn-acao" style="width:36px; height:36px; background:#ffedd5; color:#b45309; border-color:#fde047;" onclick="gerarCobrancaUnica(${v.linha})" title="Gerar Cobrança Rápida">🔔</button>`) + btnWhatsUnico;
            const textoObservacao = v.observacao ? `<p style="font-size:0.65rem; color:#888; font-style:italic; margin: 0;">Obs: ${v.observacao}</p>` : ""; 
            const nomeHtml = formatarNomeProdutoHtml(v.produto, 'venda'); 
            
            let txtLucro = '';
            if (isAdmin) {
                if (!isPresente) {
                    let txtComissaoVisual = '';
                    if (!isSocioAdmin) {
                        if (isP) {
                            txtComissaoVisual = `<br> <span style="color:#0369a1;">Comissão: ${safeFmt(v.valor_comissao)}</span>`;
                        } else {
                            txtComissaoVisual = `<br> <span style="color:#888;">Comissão: ${safeFmt(v.valor_comissao)} (Bloqueada: Fiado)</span>`;
                        }
                    }
                    const txtContaLucro = `<p style="font-size:0.6rem; color:#aaa; margin:2px 0 0 0;">🧮 ${safeFmt(v.valor_venda)} − Custo ${safeFmt(v.custo_total)} − Comissão ${safeFmt(v.valor_comissao)} = Lucro ${safeFmt(v.lucro)}</p>`;
                    txtLucro = `<p style="font-size:0.65rem; color:#b45309; font-weight:700; margin:0; line-height: 1.3;">Lucro Líquido: ${safeFmt(v.lucro)} ${txtComissaoVisual}</p>${txtContaLucro}`;
                } else {
                    txtLucro = `<p style="font-size:0.65rem; color:#888; font-weight:700; margin:0;">Custo Abs: ${safeFmt(v.custo_total)}</p>`;
                }
            } else {
                if (!isPresente) {
                    if (isP) {
                        txtLucro = `<p style="font-size:0.65rem; color:#0369a1; font-weight:700; margin:0; line-height: 1.3;">Sua Comissão: <br> <span style="font-size:0.9rem; font-weight:900;">${safeFmt(v.valor_comissao)}</span></p>`;
                    } else {
                        txtLucro = `<p style="font-size:0.65rem; color:#888; font-weight:700; margin:0; line-height: 1.3;">Sua Comissão: <br> <span style="font-size:0.9rem; font-weight:900;">${safeFmt(v.valor_comissao)}</span><br><span style="font-size:0.6rem;">(Libera após pgto do cliente)</span></p>`;
                    }
                }
            }
            
            const txtLocal = `<p style="font-size:0.65rem; color:#666; margin: 2px 0 0 0;">📍 Retirada: <b>${v.local_estoque}</b></p>`;

            const btnApagar = isAdmin ? `<button class="btn-acao" style="width:36px; height:36px;" onclick="prepararExclusaoRegistro('Vendas', ${v.linha}, 'Venda de ${v.cliente}')" title="Excluir">🗑️</button>` : '';
            const btnEditar = isAdmin ? `<button class="btn-acao" style="width:36px; height:36px;" onclick="abrirModalEditarVenda(${v.linha})" title="Editar">✏️</button>` : '';
            const btnBaixa = (!isP && !isPresente) ? `<button class="btn-acao" style="width:36px; height:36px; background:#e8f5e9; color:#2e7d32; border-color:#bbf7d0;" onclick="darBaixaVenda(${v.linha})" title="Marcar Pago">💲</button>` : '';
            
            let dataKeyIso = (fTipoData === 'pgto' && isP) ? v.dataPgtoDisplay : v.dataVendaIso;
            let dataDisplay = (fTipoData === 'pgto' && isP) ? v.dataPgtoDisplay : (v.dataVendaDisplay || v.dataVendaIso);
            
            if(!dataKeyIso) { dataKeyIso = "Sem Data"; dataDisplay = "Data Não Registrada"; }

            if(!gruposVendas[dataKeyIso]) { gruposVendas[dataKeyIso] = { display: dataDisplay, itens: [], totalDia: 0 }; }
            gruposVendas[dataKeyIso].totalDia += val;

            gruposVendas[dataKeyIso].itens.push(`
            <div class="rotulo-card card-venda-list" style="border-left: 5px solid ${corBorda}; border-radius: 8px; padding: 15px;">
                <div class="prod-info-main" style="flex:1;">
                    <div class="v-cli-block">
                        <h4 style="margin: 0 0 3px 0; font-size: 0.9rem; color: var(--brand-dark);">
                            ${v.cliente} <span class="status-badge ${badgeClass}">${v.status}</span>
                        </h4>
                        ${txtLocal}
                        <p style="font-size:0.65rem; color:#a1a1aa; margin:2px 0 0 0;">Vendedor: ${v.socio}</p>
                    </div>
                    <div class="v-prod-block">
                        <div>
                            <p style="font-size: 0.85rem; font-weight: 700; margin: 0 0 3px 0; color: var(--brand-dark);"><b>${v.qtd}x</b> ${nomeHtml}</p>
                            ${txtStatus}
                        </div>
                        <div class="obs-container">${textoObservacao}</div>
                    </div>
                </div>
                <div class="prod-actions">
                    <div style="text-align: right;">
                        ${txtLucro}
                        <p style="margin: 2px 0 0 0; color: var(--brand-dark); font-size: 1.1rem; font-weight: 900;">${safeFmt(v.valor_venda)}</p>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        ${btnAcerto}
                        ${btnAcaoExtra}
                        ${btnBaixa}
                        ${btnEditar}
                        ${btnApagar}
                    </div>
                </div>
            </div>`);
        });

        let datasOrdenadas = Object.keys(gruposVendas).sort((a, b) => new Date(b) - new Date(a));

        let itensRenderizados = 0, diasOcultos = 0, itensOcultos = 0;
        for (const dataChave of datasOrdenadas) {
            // Estourou o limite da página? Só conta o que ficou de fora (dias inteiros, pra não cortar grupo no meio)
            if (itensRenderizados >= limiteVendasLista) {
                diasOcultos++;
                itensOcultos += gruposVendas[dataChave].itens.length;
                continue;
            }
            const diaRecolhido = diasVendasRecolhidos.has(dataChave);
            html += `<div class="separador-data div-futuro" style="background: var(--primary-dark); margin: 25px 0 10px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px; cursor: pointer;" onclick="toggleDiaVendas('${dataChave}')" title="Clique para recolher/expandir">
                        <span><span class="seta-dia-vendas${diaRecolhido ? ' recolhida' : ''}" id="seta-dia-${dataChave}">▼</span>📅 VENDAS DO DIA: ${gruposVendas[dataChave].display}</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.3);">💰 TOTAL: ${fmt(gruposVendas[dataChave].totalDia)}</span>
                     </div>`;
            html += `<div class="grid-vendas-grupo" id="grupo-dia-${dataChave}" style="${diaRecolhido ? 'display:none !important;' : ''}">`;
            html += gruposVendas[dataChave].itens.join('');
            html += `</div>`;
            itensRenderizados += gruposVendas[dataChave].itens.length;
        }

        if (itensOcultos > 0) {
            html += `<button class="btn-salvar" style="background:#fff; color:var(--primary-dark); border:2px dashed var(--primary); box-shadow:none; margin-top:20px; font-size:0.85rem;" onclick="mostrarMaisVendas()">⬇️ Mostrar mais ${diasOcultos} dia(s) — ${itensOcultos} venda(s) mais antiga(s)</button>`;
        }
    }

    document.getElementById('lista-vendas-cadastradas').innerHTML = html; 

    const gridVendas = document.querySelector('.vendas-sticky-header .dash-grid');
    if (gridVendas) {
        if (isAdmin) {
            gridVendas.innerHTML = `
                <div class="dash-card highlight" style="margin-bottom:0; grid-column: span 2;">
                    <h3>Total Vendido</h3><p class="valor">${fmt(tVend)}</p>
                </div>
                <div class="dash-card receita" style="margin-bottom:0;">
                    <h3>Recebido (Na Conta)</h3><p class="valor">${fmt(tRec)}</p>
                </div>
                <div class="dash-card receber" style="margin-bottom:0;">
                    <h3>A Receber (Fiado)</h3><p class="valor">${fmt(tDev)}</p>
                </div>
                <div class="dash-card" style="margin-bottom:0; border-left: 4px solid #7c3aed;">
                    <h3 style="color:#7c3aed;">Lucro Líquido</h3><p class="valor" style="color:#7c3aed;">${fmt(tLuc)}</p>
                </div>
                <div class="dash-card" style="margin-bottom:0;">
                    <h3>Itens Vendidos</h3><p class="valor">${tItens}</p>
                </div>
                <div class="dash-card" style="margin-bottom:0; grid-column: span 2; background:#fffbeb; border: 1px solid #fde047;">
                    <h3 style="color:#b45309; border-bottom:1px dashed #fde047; padding-bottom:5px; margin-bottom:5px;">🤝 Acerto de Comissões (Equipe)</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="text-align:left; flex: 1;">
                            <span style="font-size:0.65rem; color:#b45309; font-weight:bold; display:block;">Bloqueado (Fiado)</span>
                            <span style="font-size:1.1rem; color:#b45309; font-weight:900;">${fmt(tComFutura)}</span>
                        </div>
                        <div style="text-align:center; flex: 1; border-left: 1px dashed #fcd34d; border-right: 1px dashed #fcd34d; padding: 0 10px;">
                            <span style="font-size:0.65rem; color:#b91c1c; font-weight:bold; display:block;">Liberado (Falta Pagar)</span>
                            <span style="font-size:1.3rem; color:#b91c1c; font-weight:900;">${fmt(tComPend)}</span>
                        </div>
                        <div style="text-align:right; flex: 1;">
                            <span style="font-size:0.65rem; color:#15803d; font-weight:bold; display:block;">Já Repassado</span>
                            <span style="font-size:1.1rem; color:#15803d; font-weight:900;">${fmt(tComAcert)}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            gridVendas.innerHTML = `
                <div class="dash-card highlight" style="margin-bottom:0; grid-column: span 2;">
                    <h3>Minhas Vendas (Total)</h3><p class="valor">${fmt(tVend)}</p>
                </div>
                <div class="dash-card receita" style="margin-bottom:0;">
                    <h3>Recebido (Caixa)</h3><p class="valor">${fmt(tRec)}</p>
                </div>
                <div class="dash-card receber" style="margin-bottom:0;">
                    <h3>A Receber (Fiado)</h3><p class="valor">${fmt(tDev)}</p>
                </div>
                <div class="dash-card" style="margin-bottom:0; border-left: 4px solid #0369a1;">
                    <h3 style="color:#0369a1;">Itens Vendidos</h3><p class="valor" style="color:#0369a1;">${tItens}</p>
                </div>
                <div class="dash-card" style="margin-bottom:0; grid-column: span 2; background:#f0fdf4; border: 1px solid #bbf7d0;">
                    <h3 style="color:#166534; border-bottom:1px dashed #bbf7d0; padding-bottom:5px; margin-bottom:5px;">💰 Minhas Comissões</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="text-align:left; flex: 1;">
                            <span style="font-size:0.65rem; color:#b45309; font-weight:bold; display:block;">Futura (Fiado)</span>
                            <span style="font-size:1.1rem; color:#b45309; font-weight:900;">${fmt(tComFutura)}</span>
                        </div>
                        <div style="text-align:center; flex: 1; border-left: 1px dashed #86efac; border-right: 1px dashed #86efac; padding: 0 10px;">
                            <span style="font-size:0.65rem; color:#0369a1; font-weight:bold; display:block;">Liberada (No Caixa)</span>
                            <span style="font-size:1.3rem; color:#0369a1; font-weight:900;">${fmt(tComPend)}</span>
                        </div>
                        <div style="text-align:right; flex: 1;">
                            <span style="font-size:0.65rem; color:#15803d; font-weight:bold; display:block;">Já Recebi</span>
                            <span style="font-size:1.1rem; color:#15803d; font-weight:900;">${fmt(tComAcert)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Recolhe/expande as vendas de um dia na lista (não apaga nada, só esconde visualmente). O estado sobrevive a re-sincronizações.
function toggleDiaVendas(dataChave) {
    const grupo = document.getElementById('grupo-dia-' + dataChave);
    const seta = document.getElementById('seta-dia-' + dataChave);
    if (!grupo) return;

    if (diasVendasRecolhidos.has(dataChave)) {
        diasVendasRecolhidos.delete(dataChave);
        grupo.style.removeProperty('display');
        if (seta) seta.classList.remove('recolhida');
    } else {
        diasVendasRecolhidos.add(dataChave);
        grupo.style.setProperty('display', 'none', 'important');
        if (seta) seta.classList.add('recolhida');
    }
}


// ===============================================
// FUNÇÃO DO BOTÃO "APERTO DE MÃOS" (ACERTO CAIXA)
// ===============================================
function acertarCaixaVenda(id) {
    abrirConfirmacao("Acertar Caixa?", "Você confirma que o valor dessa venda entrou na conta e a comissão do vendedor foi repassada?", "🤝", "#0369a1", "#082f49", "✔️ Confirmar Acerto", () => {
        mostrarLoading("Acertando e validando...");
        const msgLog = `🤝 Confirmou acerto de caixa e repasse da venda ID: ${id}`;
        fetch(API_NOVERA, { 
            method: "POST", headers: cabecalhoAuth(), 
            body: JSON.stringify({ usuario: usuarioLogado, acao: "acertar_caixa_venda", linha: id, log_detalhe: msgLog }) 
        })
        .then(() => {
            mostrarAlerta("Acertado!", "Caixa finalizado com sucesso.", "success");
            sincronizarDadosUnico();
        }).catch(() => {
            ocultarLoading();
            mostrarAlerta("Erro", "Falha de conexão.", "error");
        });
    });
}

// No iPhone, o Safari ignora o "download" de imagens em base64 — a forma que funciona
// de verdade lá é abrir a folha de compartilhamento nativa (a mesma do WhatsApp/Fotos).
// No computador/Android, cai no download normal, que já funciona bem.
async function baixarOuCompartilharImagem(base64image, nomeArquivo) {
    try {
        const blob = await (await fetch(base64image)).blob();
        const arquivo = new File([blob], nomeArquivo, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            await navigator.share({ files: [arquivo], title: nomeArquivo });
            return;
        }
    } catch (e) {
        if (e && e.name === 'AbortError') return; // usuário cancelou o compartilhamento, tudo bem
    }
    // Reserva: abre a imagem numa aba nova (dá pra segurar o dedo e "Salvar Imagem" mesmo no iPhone)
    // ou baixa direto, se o navegador suportar.
    const link = document.createElement('a');
    link.download = nomeArquivo;
    link.href = base64image;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
}

// Configura os botões do modal de prévia: Baixar, Enviar Imagem (folha de compartilhamento
// nativa — o WhatsApp não aceita imagem via link direto) e Enviar Texto (esse sim vai direto
// pro chat do cliente, se ele tiver telefone no cadastro; senão abre o WhatsApp pra escolher).
function configurarBotoesPreview(base64image, nomeArquivo, clienteNome, textoZap) {
    document.getElementById('btn-baixar-img').onclick = () => baixarOuCompartilharImagem(base64image, nomeArquivo);

    const btnImg = document.getElementById('btn-zap-img');
    if (btnImg) {
        let suportaShare = false;
        try { suportaShare = !!(navigator.canShare && navigator.canShare({ files: [new File([new Blob()], 'x.png', { type: 'image/png' })] })); } catch (e) { }
        btnImg.style.display = suportaShare ? 'block' : 'none';
        btnImg.onclick = async () => {
            try {
                const blob = await (await fetch(base64image)).blob();
                await navigator.share({ files: [new File([blob], nomeArquivo, { type: 'image/png' })], title: nomeArquivo });
            } catch (e) { /* usuário cancelou o compartilhamento, tudo bem */ }
        };
    }

    const btnTxt = document.getElementById('btn-zap-texto');
    if (btnTxt) {
        btnTxt.style.display = textoZap ? 'block' : 'none';
        btnTxt.onclick = () => {
            const cad = clientesGlobal.find(c => normalizarNomeBusca(c.nome) === normalizarNomeBusca(clienteNome || ''));
            const digitos = cad && cad.telefone ? String(cad.telefone).replace(/\D/g, '') : '';
            const fone = digitos ? (digitos.length <= 11 ? '55' + digitos : digitos) : '';
            const urlZap = fone ? `https://wa.me/${fone}?text=${encodeURIComponent(textoZap)}` : `https://wa.me/?text=${encodeURIComponent(textoZap)}`;
            const jan = window.open(urlZap, '_blank');
            if (!jan) location.href = urlZap;
        };
    }
}

// 🧾 Gera o recibo direto de uma lista de vendas — atalho usado logo após o "Pagar" em lote,
// pra não precisar ir no Lote Recibos e procurar o cliente de novo
async function gerarReciboDeLinhas(linhas, clienteSugerido) {
    let nomeExibicao = await pedirNomeDocumento(clienteSugerido, "Nome no Recibo");
    if (nomeExibicao === null) return;
    mostrarLoading("Gerando Recibo...");
    document.getElementById('rec-cli-nome').innerText = nomeExibicao;
    document.getElementById('rec-data-emissao').innerText = new Date().toLocaleDateString('pt-BR');
    let htmlItens = "", somaTotal = 0;
    linhas.forEach(l => {
        const pedido = vendasGlobal.find(v => v.linha == l);
        if (pedido) {
            const valor = parseDinheiro(pedido.valor_venda); somaTotal += valor;
            const dataCompra = pedido.dataVendaDisplay || pedido.dataVendaIso;
            const txtPago = `Pago: ${pedido.dataPgtoDisplay || new Date().toLocaleDateString('pt-BR')}`;
            const nomeHtml = formatarNomeProdutoHtml(pedido.produto, 'recibo');
            htmlItens += `<div style="display:flex; justify-content: space-between; border-bottom: 1px solid #f3d8e2; padding: 8px 0;"><div style="flex: 1;"><strong style="color: #2C2A2B; line-height:1.4;">${pedido.qtd}x ${nomeHtml}</strong><br><span style="font-size: 0.7rem; color: #888;">Data: ${dataCompra} | ${txtPago}</span></div><div style="font-weight: 700; color: #966178;">${fmt(valor)}</div></div>`;
        }
    });
    document.getElementById('rec-itens-lista').innerHTML = htmlItens;
    document.getElementById('rec-total').innerText = fmt(somaTotal);
    try {
        const template = document.getElementById('recibo-template'); template.style.display = 'block'; template.style.position = 'fixed'; template.style.top = '0'; template.style.left = '0'; template.style.zIndex = '-9999';
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(template, { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const base64image = canvas.toDataURL("image/png"); template.style.display = 'none';
        document.getElementById('recibo-img-container').innerHTML = `<img src="${base64image}" style="width: 100%; height: auto; display: block; border-radius:8px; border:1px solid #E8DDE1;">`;
        document.getElementById('preview-title').innerText = "Recibo Pronto!";
        configurarBotoesPreview(base64image, `Recibo_Novera_${nomeExibicao.replace(/\s+/g, '_')}.png`, clienteSugerido, null);
        document.getElementById('modal-recibo-preview').style.display = 'flex';
    } catch (error) { mostrarAlerta("Erro", "Falha ao gerar a imagem.", "error"); } finally { ocultarLoading(); }
}

async function montarRecibo() {
    const clienteReal = document.getElementById('recibo-cliente').value, clienteNomeExibicao = document.getElementById('recibo-nome-exibicao').value.trim() || clienteReal, checkboxes = document.querySelectorAll('.chk-item-recibo:checked');
    if (checkboxes.length === 0) return mostrarAlerta("Aviso", "Deixe pelo menos um pedido marcado para o recibo.", "warning");
    mostrarLoading("Gerando Recibo..."); document.getElementById('rec-cli-nome').innerText = clienteNomeExibicao; document.getElementById('rec-data-emissao').innerText = new Date().toLocaleDateString('pt-BR'); let htmlItens = "", somaTotal = 0;
    checkboxes.forEach(chk => { const pedido = vendasGlobal.find(v => v.linha == chk.value); if (pedido) { const valor = parseDinheiro(pedido.valor_venda); somaTotal += valor; const dataCompra = pedido.dataVendaDisplay || pedido.dataVendaIso, txtPago = pedido.status === 'Pago' ? `Pago: ${pedido.dataPgtoDisplay || '?'}` : 'Pendente'; const nomeHtml = formatarNomeProdutoHtml(pedido.produto, 'recibo'); htmlItens += `<div style="display:flex; justify-content: space-between; border-bottom: 1px solid #f3d8e2; padding: 8px 0;"><div style="flex: 1;"><strong style="color: #2C2A2B; line-height:1.4;">${pedido.qtd}x ${nomeHtml}</strong><br><span style="font-size: 0.7rem; color: #888;">Data: ${dataCompra} | ${txtPago}</span></div><div style="font-weight: 700; color: #966178;">${fmt(valor)}</div></div>`; } });
    document.getElementById('rec-itens-lista').innerHTML = htmlItens; document.getElementById('rec-total').innerText = fmt(somaTotal);
    try {
        const template = document.getElementById('recibo-template'); template.style.display = 'block'; template.style.position = 'fixed'; template.style.top = '0'; template.style.left = '0'; template.style.zIndex = '-9999';
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(template, { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const base64image = canvas.toDataURL("image/png"); template.style.display = 'none';
        document.getElementById('recibo-img-container').innerHTML = `<img src="${base64image}" style="width: 100%; height: auto; display: block; border-radius:8px; border:1px solid #E8DDE1;">`; document.getElementById('preview-title').innerText = "Recibo Pronto!"; configurarBotoesPreview(base64image, `Recibo_Novera_${clienteNomeExibicao.replace(/\s+/g, '_')}.png`, clienteReal, null); document.getElementById('modal-recibo-preview').style.display = 'flex';
    } catch (error) { mostrarAlerta("Erro", "Falha ao gerar a imagem.", "error"); } finally { ocultarLoading(); }
}

async function gerarReciboUnico(linha) {
    const pedido = vendasGlobal.find(v => v.linha == linha); if (!pedido) return; let nomeExibicao = await pedirNomeDocumento(pedido.cliente, "Nome no Recibo"); if (nomeExibicao === null) return;
    mostrarLoading("Gerando Recibo..."); document.getElementById('rec-cli-nome').innerText = nomeExibicao; document.getElementById('rec-data-emissao').innerText = new Date().toLocaleDateString('pt-BR');
    const valor = parseDinheiro(pedido.valor_venda); const dataCompra = pedido.dataVendaDisplay || pedido.dataVendaIso; const txtPago = `Pago em: ${pedido.dataPgtoDisplay || '?'}`; const nomeHtml = formatarNomeProdutoHtml(pedido.produto, 'recibo'); const htmlItem = `<div style="display:flex; justify-content: space-between; border-bottom: 1px solid #f3d8e2; padding: 8px 0;"><div style="flex: 1;"><strong style="color: #2C2A2B; line-height:1.4;">${pedido.qtd}x ${nomeHtml}</strong><br><span style="font-size: 0.7rem; color: #888;">Data: ${dataCompra} | ${txtPago}</span></div><div style="font-weight: 700; color: #966178;">${fmt(valor)}</div></div>`; document.getElementById('rec-itens-lista').innerHTML = htmlItem; document.getElementById('rec-total').innerText = fmt(valor);
    try {
        const template = document.getElementById('recibo-template'); template.style.display = 'block'; template.style.position = 'fixed'; template.style.top = '0'; template.style.left = '0'; template.style.zIndex = '-9999';
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(template, { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const base64image = canvas.toDataURL("image/png"); template.style.display = 'none';
        document.getElementById('recibo-img-container').innerHTML = `<img src="${base64image}" style="width: 100%; height: auto; display: block; border-radius:8px; border:1px solid #E8DDE1;">`; document.getElementById('preview-title').innerText = "Recibo Pronto!"; configurarBotoesPreview(base64image, `Recibo_Novera_${nomeExibicao.replace(/\s+/g, '_')}.png`, pedido.cliente, null); document.getElementById('modal-recibo-preview').style.display = 'flex';
    } catch (error) { mostrarAlerta("Erro", "Falha ao gerar a imagem.", "error"); } finally { ocultarLoading(); }
}

function prepararRecibo() { const cliente = document.getElementById('recibo-cliente').value, divNome = document.getElementById('div-recibo-nome'), inputNome = document.getElementById('recibo-nome-exibicao'), container = document.getElementById('recibo-pedidos-lista'), btn = document.getElementById('btn-gerar-recibo'); if (!cliente) { divNome.style.display = 'none'; container.style.display = 'none'; btn.style.display = 'none'; return; } inputNome.value = cliente; divNome.style.display = 'block'; let pedidos = vendasGlobal.filter(v => v.cliente.trim() === cliente && v.status === 'Pago'); pedidos.sort((a, b) => new Date(b.dataVendaIso) - new Date(a.dataVendaIso)); if (pedidos.length === 0) { container.innerHTML = '<p style="font-size:0.8rem; color:#888;">Nenhum pedido PAGO encontrado.</p>'; } else { let html = ''; pedidos.forEach(p => { const dataCompra = p.dataVendaDisplay || p.dataVendaIso, statusTexto = `<span style="color:#2e7d32;">Pago: ${p.dataPgtoDisplay || '?'}</span>`; const nomeHtml = formatarNomeProdutoHtml(p.produto, 'recibo'); html += `<label class="checkbox-recibo"><input type="checkbox" class="chk-item-recibo" value="${p.linha}" checked><div class="chk-info"><span class="chk-title">${p.qtd}x ${nomeHtml}</span><span class="chk-desc">Data: ${dataCompra} | ${statusTexto}</span></div><div class="chk-val">${safeFmt(p.valor_venda)}</div></label>`; }); container.innerHTML = html; } container.style.display = 'block'; btn.style.display = 'block'; }

function prepararCobranca() { 
    const cliente = document.getElementById('cobranca-cliente').value; 
    const divNome = document.getElementById('div-cobranca-nome'); 
    const inputNome = document.getElementById('cobranca-nome-exibicao'); 
    const container = document.getElementById('cobranca-pedidos-lista'); 
    const divBotoes = document.getElementById('div-cobranca-botoes'); 
    
    if (!cliente) { 
        divNome.style.display = 'none'; container.style.display = 'none'; if (divBotoes) divBotoes.style.display = 'none'; return; 
    } 
    
    const isAdmin = (usuarioCargo === 'Admin');
    let pends = [];
    if (cliente === 'todos') {
        divNome.style.display = 'none';
        pends = vendasGlobal.filter(v => (v.status === 'Pendente' || v.status === 'Parcelado') && (isAdmin || String(v.socio).toLowerCase().trim() === usuarioLogado.toLowerCase().trim()));
    } else {
        inputNome.value = cliente; 
        divNome.style.display = 'block'; 
        pends = vendasGlobal.filter(v => v.cliente.trim() === cliente && (v.status === 'Pendente' || v.status === 'Parcelado')); 
    }
    
    pends.sort((a, b) => new Date(b.dataVendaIso) - new Date(a.dataVendaIso)); 
    
    if (pends.length === 0) { 
        container.innerHTML = '<p style="font-size:0.8rem; color:#888;">Nenhuma pendência encontrada.</p>'; 
    } else { 
        let html = ''; 
        
        // A REGRA DE SEGURANÇA: Se for a lista geral, começa desmarcado. Se for cliente único, já vem marcado.
        const statusCheckbox = cliente === 'todos' ? '' : 'checked';

        pends.forEach(p => { 
            const dataCompra = p.dataVendaDisplay || p.dataVendaIso; 
            const nomeHtml = formatarNomeProdutoHtml(p.produto, 'cobranca'); 
            
            // SE FOR LISTA GERAL, MOSTRA O NOME DA PESSOA EM CIMA DO PEDIDO
            const exibirNome = cliente === 'todos' ? `<div style="font-size:0.75rem; color:#A05252; font-weight:800; margin-bottom:3px;">👤 ${p.cliente}</div>` : '';
            const badge = p.status === 'Parcelado' ? `<span style="background:#e0e7ff; color:#4f46e5; padding:2px 6px; border-radius:4px; font-size:0.6rem; margin-left:5px; text-transform:uppercase; font-weight:800;">Parcelado</span>` : '';
            
            html += `<label class="checkbox-recibo" style="border-color:#ffeeba; background:#fff9e6; align-items:flex-start;"><input type="checkbox" class="chk-item-cobranca" value="${p.linha}" ${statusCheckbox} style="margin-top:2px;"><div class="chk-info">${exibirNome}<span class="chk-title" style="color:#b45309;">${p.qtd}x ${nomeHtml} ${badge}</span><span class="chk-desc">Data: ${dataCompra}</span></div><div class="chk-val" style="color:#b45309; display:flex; align-items:center;">${safeFmt(p.valor_venda)}</div></label>`; 
        }); 
        container.innerHTML = html; 
    } 
    container.style.display = 'block';
    if (divBotoes) {
        divBotoes.style.display = 'flex';
        // ESCONDE O BOTÃO DE GERAR IMAGEM E TEXTO SE FOR A LISTA DE TODOS (Evita enviar pra pessoa errada)
        const botoes = divBotoes.querySelectorAll('.col');
        if (botoes.length >= 3) {
            botoes[0].style.display = cliente === 'todos' ? 'none' : 'block';
            botoes[1].style.display = cliente === 'todos' ? 'none' : 'block';
        }
    }

    // 📲 Botões de WhatsApp: com telefone cadastrado → botão verde de cobrar;
    // sem telefone → botão tracejado que cadastra o número na hora (é assim que a carteira se enche sozinha)
    const btnWhatsCob = document.getElementById('btn-whats-cobranca');
    const btnWhatsCad = document.getElementById('btn-whats-cadastrar');
    const cadCli = cliente !== 'todos' ? clientesGlobal.find(c => normalizarNomeBusca(c.nome) === normalizarNomeBusca(cliente)) : null;
    const temFone = !!(cadCli && String(cadCli.telefone || '').replace(/\D/g, ''));
    if (btnWhatsCob) btnWhatsCob.style.display = temFone ? 'block' : 'none';
    if (btnWhatsCad) btnWhatsCad.style.display = (cliente && cliente !== 'todos' && !temFone) ? 'block' : 'none';
}

// 📲 Cobra UMA venda específica direto no WhatsApp (botão do cartão da venda).
// Se o cliente ainda não tem telefone, pede na hora, salva no cadastro e já abre a conversa.
async function cobrarVendaNoWhatsApp(linha) {
    const p = vendasGlobal.find(v => v.linha == linha);
    if (!p) return;
    const nomeTxt = formatarNomeProdutoTexto(p.produto);
    const val = parseDinheiro(p.valor_venda);
    const txt = `Olá ${p.cliente}, tudo bem com você? Passando aqui pela Novera Scent ✨\n\nEsse é um lembrete carinhoso do seu pedido em aberto:\n\n📅 ${p.dataVendaDisplay} | 📦 ${p.qtd}x ${nomeTxt} | 💰 ${fmt(val)}\n\nQualquer dúvida, é só chamar!`;

    let cad = clientesGlobal.find(c => normalizarNomeBusca(c.nome) === normalizarNomeBusca(p.cliente));
    let digitos = cad && cad.telefone ? String(cad.telefone).replace(/\D/g, '') : '';

    if (!digitos) {
        const tel = await pedirNomeDocumento('', `📱 WhatsApp de ${p.cliente} (DDD + número)`);
        if (tel === null) return;
        digitos = String(tel).replace(/\D/g, '');
        if (digitos.length < 10) return mostrarAlerta("Aviso", "Digite o DDD + número. Ex: 11 99999-8888", "warning");
        // Salva no cadastro em segundo plano, sem travar a cobrança
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_telefone_cliente", nome: p.cliente, telefone: tel.trim() }) }).catch(() => {});
        if (cad) cad.telefone = tel.trim(); else clientesGlobal.push({ linha: 0, nome: p.cliente, telefone: tel.trim(), aniversario: '', obs: '', criadoPor: usuarioLogado });
    }

    const fone = digitos.length <= 11 ? '55' + digitos : digitos;
    const urlZap = `https://wa.me/${fone}?text=${encodeURIComponent(txt)}`;
    const jan = window.open(urlZap, '_blank');
    if (!jan) location.href = urlZap; // alguns celulares bloqueiam popup depois do modal — vai direto então
}

// 📵 Captura o WhatsApp do cliente bem na hora em que a vendedora mais precisa dele: pra cobrar
async function cadastrarTelefoneCobranca() {
    const cliente = document.getElementById('cobranca-cliente').value;
    if (!cliente || cliente === 'todos') return;
    const tel = await pedirNomeDocumento('', `📱 WhatsApp de ${cliente} (DDD + número)`);
    if (tel === null) return;
    const digitos = String(tel).replace(/\D/g, '');
    if (digitos.length < 10) return mostrarAlerta("Aviso", "Digite o DDD + número. Ex: 11 99999-8888", "warning");

    mostrarLoading("Salvando telefone...");
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_telefone_cliente", nome: cliente, telefone: tel.trim() }) })
    .then(r => r.json())
    .then(res => {
        if (res.sucesso) {
            // Atualiza a memória local na hora, pro botão verde acender sem esperar o sync
            const cad = clientesGlobal.find(c => normalizarNomeBusca(c.nome) === normalizarNomeBusca(cliente));
            if (cad) cad.telefone = tel.trim();
            else clientesGlobal.push({ linha: 0, nome: cliente, telefone: tel.trim(), aniversario: '', obs: '', criadoPor: usuarioLogado });
            prepararCobranca();
            mostrarAlerta("Salvo!", "WhatsApp cadastrado — agora é só cobrar direto! 📲", "success");
        } else mostrarAlerta("Erro", res.erro || "Falha ao salvar.", "error");
    })
    .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => ocultarLoading());
}
// Monta o texto de cobrança dos pedidos marcados (usado pelo Copiar e pelo botão de WhatsApp)
function montarTextoPendencias() {
    const cliReal = document.getElementById('cobranca-cliente').value;
    if (!cliReal) { mostrarAlerta("Aviso", "Selecione um cliente para cobrar.", "warning"); return null; }
    const cliDisplay = document.getElementById('cobranca-nome-exibicao').value.trim() || cliReal;
    const checkboxes = document.querySelectorAll('.chk-item-cobranca:checked');
    if (checkboxes.length === 0) { mostrarAlerta("Aviso", "Selecione pelo menos um pedido.", "warning"); return null; }
    let txt = `Olá ${cliDisplay}, tudo bem com você? Passando aqui pela Novera Scent ✨\n\nEsse é um resuminho dos seus pedidos em aberto com a gente:\n\n`;
    let tot = 0;
    checkboxes.forEach(chk => { const p = vendasGlobal.find(v => v.linha == chk.value); if (p) { const val = parseDinheiro(p.valor_venda); const nomeTxt = formatarNomeProdutoTexto(p.produto); txt += `📅 ${p.dataVendaDisplay} | 📦 ${p.qtd}x ${nomeTxt} | 💰 ${fmt(val)}\n`; tot += val; } });
    txt += `\n*Total em aberto: ${fmt(tot)}*\n\nQualquer dúvida, é só chamar!`;
    return { txt, cliReal };
}

function copiarPendenciasWhats() {
    const m = montarTextoPendencias(); if (!m) return;
    copiarTextoSeguro(m.txt).then(() => mostrarAlerta("Copiado!", "Texto copiado.", "success")).catch(() => mostrarAlerta("Erro", "Não foi possível copiar. Copie manualmente.", "error"));
}

// 📲 Abre o WhatsApp do cliente (do cadastro) já com a cobrança escrita
function cobrarNoWhatsApp() {
    const m = montarTextoPendencias(); if (!m) return;
    const cad = clientesGlobal.find(c => normalizarNomeBusca(c.nome) === normalizarNomeBusca(m.cliReal));
    const digitos = cad && cad.telefone ? String(cad.telefone).replace(/\D/g, '') : '';
    if (!digitos) return mostrarAlerta("Sem telefone", "Cadastre o telefone desse cliente na tela Clientes pra cobrar direto no WhatsApp.", "warning");
    const fone = digitos.length <= 11 ? '55' + digitos : digitos; // completa o +55 se a pessoa salvou sem DDI
    window.open(`https://wa.me/${fone}?text=${encodeURIComponent(m.txt)}`, '_blank');
}

async function montarCobranca() {
    const cliReal = document.getElementById('cobranca-cliente').value; if (!cliReal) return mostrarAlerta("Aviso", "Selecione um cliente devedor.", "warning"); const cliDisplay = document.getElementById('cobranca-nome-exibicao').value.trim() || cliReal; const checkboxes = document.querySelectorAll('.chk-item-cobranca:checked'); if (checkboxes.length === 0) return mostrarAlerta("Aviso", "Selecione pelo menos um pedido.", "warning");
    mostrarLoading("Gerando Imagem..."); document.getElementById('cob-cli-nome').innerText = cliDisplay; let htmlItens = "", somaTotal = 0; checkboxes.forEach(chk => { const pedido = vendasGlobal.find(v => v.linha == chk.value); if (pedido) { const valor = parseDinheiro(pedido.valor_venda); somaTotal += valor; const nomeHtml = formatarNomeProdutoHtml(pedido.produto, 'cobranca'); htmlItens += `<div style="display:flex; justify-content: space-between; border-bottom: 1px solid #ffeeba; padding: 8px 0;"><div style="flex: 1;"><strong style="color: #2C2A2B; line-height:1.4;">${pedido.qtd}x ${nomeHtml}</strong><br><span style="font-size: 0.7rem; color: #888;">Data: ${pedido.dataVendaDisplay || pedido.dataVendaIso}</span></div><div style="font-weight: 700; color: #b45309;">${fmt(valor)}</div></div>`; } });
    document.getElementById('cob-itens-lista').innerHTML = htmlItens; document.getElementById('cob-total').innerText = fmt(somaTotal);
    try {
        const template = document.getElementById('cobranca-template'); template.style.display = 'block'; template.style.position = 'fixed'; template.style.top = '0'; template.style.left = '0'; template.style.zIndex = '-9999';
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(template, { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const base64image = canvas.toDataURL("image/png"); template.style.display = 'none';
        document.getElementById('recibo-img-container').innerHTML = `<img src="${base64image}" style="width: 100%; height: auto; display: block; border-radius:8px; border:1px solid #E8DDE1;">`; document.getElementById('preview-title').innerText = "Imagem de Cobrança Pronta!"; configurarBotoesPreview(base64image, `Cobranca_Novera_${cliDisplay.replace(/\s+/g, '_')}.png`, cliReal, (montarTextoPendencias() || {}).txt || ''); document.getElementById('modal-recibo-preview').style.display = 'flex';
    } catch (error) { mostrarAlerta("Erro", "Falha ao gerar a imagem.", "error"); } finally { ocultarLoading(); }
}

async function gerarCobrancaUnica(linha) {
    const pedido = vendasGlobal.find(v => v.linha == linha); if (!pedido) return; let nomeExibicao = await pedirNomeDocumento(pedido.cliente, "Nome na Cobrança"); if (nomeExibicao === null) return;
    mostrarLoading("Gerando Imagem..."); document.getElementById('cob-cli-nome').innerText = nomeExibicao; const valor = parseDinheiro(pedido.valor_venda); const nomeHtml = formatarNomeProdutoHtml(pedido.produto, 'cobranca'); const htmlItem = `<div style="display:flex; justify-content: space-between; border-bottom: 1px solid #ffeeba; padding: 8px 0;"><div style="flex: 1;"><strong style="color: #2C2A2B; line-height:1.4;">${pedido.qtd}x ${nomeHtml}</strong><br><span style="font-size: 0.7rem; color: #888;">Data: ${pedido.dataVendaDisplay || pedido.dataVendaIso}</span></div><div style="font-weight: 700; color: #b45309;">${fmt(valor)}</div></div>`;
    document.getElementById('cob-itens-lista').innerHTML = htmlItem; document.getElementById('cob-total').innerText = fmt(valor);
    try {
        const template = document.getElementById('cobranca-template'); template.style.display = 'block'; template.style.position = 'fixed'; template.style.top = '0'; template.style.left = '0'; template.style.zIndex = '-9999';
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(template, { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const base64image = canvas.toDataURL("image/png"); template.style.display = 'none';
        document.getElementById('recibo-img-container').innerHTML = `<img src="${base64image}" style="width: 100%; height: auto; display: block; border-radius:8px; border:1px solid #E8DDE1;">`; document.getElementById('preview-title').innerText = "Imagem Pronta!"; const txtZapUnico = `Olá ${nomeExibicao}, tudo bem com você? Passando aqui pela Novera Scent ✨\n\nEsse é um lembrete carinhoso do seu pedido em aberto:\n\n📅 ${pedido.dataVendaDisplay} | 📦 ${pedido.qtd}x ${formatarNomeProdutoTexto(pedido.produto)} | 💰 ${fmt(valor)}\n\nQualquer dúvida, é só chamar!`; configurarBotoesPreview(base64image, `Cobranca_Novera_${nomeExibicao.replace(/\s+/g, '_')}.png`, pedido.cliente, txtZapUnico); document.getElementById('modal-recibo-preview').style.display = 'flex';
    } catch (error) { mostrarAlerta("Erro", "Falha ao gerar.", "error"); } finally { ocultarLoading(); }
}

function darBaixaVendaLote() {
    const checkboxes = document.querySelectorAll('.chk-item-cobranca:checked');
    if (checkboxes.length === 0) return mostrarAlerta("Aviso", "Selecione o pedido para dar baixa.", "warning");

    let linhas = [];
    let totalLote = 0;
    let clientesSet = new Set(); // Guarda os nomes dos clientes pra gente saber quantos são

    checkboxes.forEach(chk => {
        linhas.push(chk.value);
        const v = vendasGlobal.find(x => x.linha == chk.value);
        if (v) {
            totalLote += parseDinheiro(v.valor_venda);
            clientesSet.add(v.cliente);
        }
    });

    // Se for mais de 1 cliente, a mensagem avisa "vendas de 3 clientes diferentes"
    const cliNome = clientesSet.size > 1 ? `${clientesSet.size} clientes diferentes` : [...clientesSet][0];

    abrirConfirmacao("Confirmar Pagamento?", `Marcar ${linhas.length} venda(s) de ${cliNome} como RECEBIDA(S) hoje?`, "💰", "#2e7d32", "#1b5e20", "💲 Confirmar", () => {
        mostrarLoading("Salvando...");
        const msgLog = `💰 Recebeu pagamento em lote de ${cliNome} - Total: ${fmt(totalLote)}`;
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "atualizar_status_venda_lote", linhas: linhas, status: "Pago", log_detalhe: msgLog }) }).then(() => {
            sincronizarDadosUnico();
            // 🧾 Atalho esperto: acabou de dar baixa? Já oferece o recibo dessas mesmas vendas, sem procurar de novo
            if (clientesSet.size === 1) {
                abrirConfirmacao("Recebido! Gerar Recibo?", `Baixa de ${linhas.length} venda(s) de ${cliNome} concluída (${fmt(totalLote)}). Quer já gerar o recibo delas?`, "🧾", "#966178", "#7a4a5e", "🧾 Gerar Recibo", () => { gerarReciboDeLinhas(linhas, cliNome); });
            } else {
                mostrarAlerta("Recebido!", "Baixa em lote concluída.", "success");
            }
        });
    });
}

function darBaixaVenda(linha) {
    const v = vendasGlobal.find(x => x.linha == linha);
    if (!v) return;

    abrirConfirmacao("Confirmar Pagamento?", `Marcar a venda de ${v.cliente} como RECEBIDA hoje?`, "💰", "#2e7d32", "#1b5e20", "💲 Receber", () => {
        mostrarLoading("Salvando...");
        const msgLog = `💲 Recebeu pagamento de ${v.cliente} no valor de ${safeFmt(v.valor_venda)}`;
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "atualizar_status_venda_lote", linhas: [linha], status: "Pago", log_detalhe: msgLog }) }).then(() => { mostrarAlerta("Recebido!", "Baixa ok.", "success"); sincronizarDadosUnico(); });
    });
}

function prepararExclusaoRegistro(aba, linha, desc) { 
    abrirConfirmacao("Confirmar Exclusão?", `Apagar "${desc}" de ${aba}?`, "🗑️", "#A05252", "#803f3f", "🗑️ Apagar", () => { 
        mostrarLoading("Apagando..."); 
        const msgLog = `🗑️ Apagou o registro: [${desc}] da aba ${aba}`; 
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "excluir_registro", aba: aba, linha: linha, log_detalhe: msgLog }) })
        .then(r => r.json())
        .then(res => { 
            if(res.sucesso) {
                mostrarAlerta("Excluído", "Registro apagado.", "success"); 
            } else {
                mostrarAlerta("Erro", res.erro || "Falha ao apagar.", "error");
            }
            sincronizarDadosUnico(); 
        }).catch(e => {
            mostrarAlerta("Erro", "Falha na conexão", "error");
            sincronizarDadosUnico();
        }); 
    }); 
}

function abrirModalEditarVenda(linha) { 
    const v = vendasGlobal.find(x => x.linha === linha); if (!v) return; 
    document.getElementById('edit-v-linha').value = v.linha; 
    document.getElementById('edit-v-data').value = v.dataVendaIso; 
    document.getElementById('edit-v-cliente').value = v.cliente; 
    document.getElementById('edit-v-produto').value = v.produto; 
    
    const prodAgrupado = estoqueAgrupado[padronizarTexto(v.produto)];
    const comboLocal = document.getElementById('edit-v-local');
    if (comboLocal) {
        comboLocal.innerHTML = '';
        if (prodAgrupado) {
            for (let loc in prodAgrupado.locais) {
                comboLocal.innerHTML += `<option value="${loc}">${loc} (Disp: ${prodAgrupado.locais[loc]})</option>`;
            }
        }
        if (!comboLocal.querySelector(`option[value="${v.local_estoque}"]`)) {
            comboLocal.innerHTML += `<option value="${v.local_estoque}">${v.local_estoque} (Antigo)</option>`;
        }
        comboLocal.value = v.local_estoque;
    }

    document.getElementById('edit-v-socio').value = v.socio; 
    document.getElementById('edit-v-qtd').value = v.qtd; 
    document.getElementById('edit-v-valor').value = safeFmt(v.valor_venda); 
    document.getElementById('edit-v-status').value = v.status; 
    document.getElementById('edit-v-observacao').value = v.observacao || ""; 
    document.getElementById('modal-editar-venda').style.display = 'flex'; 
}

function salvarEdicaoVenda() { 
    const l = document.getElementById('edit-v-linha').value; 
    const vOrig = vendasGlobal.find(x => x.linha == l); 
    const elLocal = document.getElementById('edit-v-local');
    
    const py = { 
        data: document.getElementById('edit-v-data').value, 
        cliente: padronizarTexto(document.getElementById('edit-v-cliente').value), 
        produto: padronizarTexto(document.getElementById('edit-v-produto').value), 
        socio: padronizarTexto(document.getElementById('edit-v-socio').value), 
        qtd: parseInt(document.getElementById('edit-v-qtd').value) || 1, 
        valorStr: document.getElementById('edit-v-valor').value, 
        status: document.getElementById('edit-v-status').value, 
        observacao: document.getElementById('edit-v-observacao').value,
        local_estoque: elLocal ? elLocal.value : 'Sede'
    }; 
    
    document.getElementById('modal-editar-venda').style.display = 'none'; 
    mostrarLoading("Salvando..."); 
    
    const msgLog = `✏️ Editou saída de ${py.cliente} [${py.produto}]. Local Retirada: ${py.local_estoque}. Status atual: ${py.status}`; 
    const envio = { 
        usuario: usuarioLogado, 
        acao: "atualizar_venda", 
        linha: l, 
        data: py.data, 
        cliente: py.cliente, 
        produto: py.produto, 
        socio: py.socio, 
        qtd: py.qtd, 
        valor_venda: py.valorStr, 
        status: py.status, 
        custo_und: "0", 
        custo_total: "0", 
        data_pg: py.status === "Pago" ? py.data : "", 
        observacao: py.observacao, 
        local_estoque: py.local_estoque, 
        log_detalhe: msgLog 
    }; 
    
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(envio) })
        .then(r => r.json())
        .then(res => { 
            if(res.sucesso) {
                mostrarAlerta("Atualizado!", "Venda editada e estoque corrigido.", "success"); 
            } else {
                mostrarAlerta("Erro", res.erro || "Falha.", "error"); 
            }
            sincronizarDadosUnico(); 
        }).catch(e => {
            mostrarAlerta("Erro", "Falha de conexão.", "error");
            sincronizarDadosUnico();
        }); 
}

// 🔗 Soma visitas E pedidos do catálogo online: total, últimos 7 dias e hoje (null = equipe toda)
function estatisticasVisitasCatalogo(nomeVendedor) {
    const corte7 = new Date(); corte7.setDate(corte7.getDate() - 6);
    const isoCorte = corte7.toISOString().split('T')[0];
    const hojeIso = new Date().toISOString().split('T')[0];
    let total = 0, sete = 0, hoje = 0, ped = 0, ped7 = 0;
    visitasCatalogoGlobal.forEach(vi => {
        if (nomeVendedor && normalizarNomeBusca(vi.vendedor) !== normalizarNomeBusca(nomeVendedor)) return;
        const h = parseInt(vi.hits) || 0, p = parseInt(vi.pedidos) || 0;
        total += h; ped += p;
        if (vi.data >= isoCorte) { sete += h; ped7 += p; }
        if (vi.data === hojeIso) hoje += h;
    });
    return { total, sete, hoje, ped, ped7 };
}

function renderizarDashboard() {
    const isAdmin = (usuarioCargo === 'Admin');
    const container = document.getElementById('dash-dinamico-container');
    if (!container) return;

    // 1. CARREGA OS FILTROS DE TEMPO
    const dMes = document.getElementById('d-filtro-mes');
    const dAno = document.getElementById('d-filtro-ano');
    if (!dMes.value && !dAno.value) {
        const h = new Date();
        dMes.value = String(h.getMonth() + 1).padStart(2, '0');
        dAno.value = String(h.getFullYear());
    }
    const fM = dMes.value;
    const fA = dAno.value;
    let pfx = fA && fM ? `${fA}-${fM}` : fA;

    // 2. CARREGA O FILTRO DE VENDEDOR (Slicer BI)
    const boxFiltroSocio = document.getElementById('box-filtro-socio-dash');
    const selSocio = document.getElementById('d-filtro-socio');
    
    if (isAdmin) {
        if(boxFiltroSocio) boxFiltroSocio.style.display = 'flex';
        if (selSocio && selSocio.options.length <= 1 && vendasGlobal.length > 0) {
            let sociosSet = new Set();
            vendasGlobal.forEach(v => { if(v.socio) sociosSet.add(String(v.socio).trim()); });
            let fAtual = selSocio.value;
            selSocio.innerHTML = '<option value="">Equipe Toda</option>' + [...sociosSet].sort().map(s => `<option value="${s}">${s}</option>`).join('');
            selSocio.value = fAtual;
        }
    } else {
        if(boxFiltroSocio) boxFiltroSocio.style.display = 'none';
    }

    const fSocioDash = (selSocio && isAdmin) ? selSocio.value.toLowerCase().trim() : "";

    // 3. BASE DE DADOS COM FILTRO DE SÓCIO APLICADO
    const vSocioGlobal = vendasGlobal.filter(v => fSocioDash ? (String(v.socio || '').toLowerCase().trim() === fSocioDash) : true);
    const gSocioGlobal = gastosGlobal.filter(g => fSocioDash ? (String(g.socio || '').toLowerCase().trim() === fSocioDash) : true);

    const vDashGlobal = vSocioGlobal.filter(v => pfx ? (v.dataVendaIso && v.dataVendaIso.startsWith(pfx)) : true);

    let rankingMap = {};
    let nomesAdmins = usuariosGlobal.filter(u => u.cargo === 'Admin' || u.cargo === 'Administrador').map(u => String(u.usuario).toLowerCase().trim());
    nomesAdmins.push('amor', 'fernando', 'natália', 'natalia', 'novera', 'admin');

    vDashGlobal.forEach(v => {
        let s = String(v.socio || '').trim();
        let sLower = s.toLowerCase();
        if (!isAdmin && nomesAdmins.includes(sLower)) return;
        if (sLower === 'sem vendedor' || sLower === '') return;

        if(!rankingMap[s]) rankingMap[s] = { total: 0, comissaoPend: 0, itens: 0 };
        rankingMap[s].total += parseDinheiro(v.valor_venda);
        rankingMap[s].itens += (parseInt(v.qtd) || 1);
        if (v.status === 'Pago' && !v.repasse_feito) {
            rankingMap[s].comissaoPend += parseFloat(v.valor_comissao) || 0;
        }
    });
    
    let rankingArr = Object.keys(rankingMap).map(k => ({ nome: k, ...rankingMap[k] })).sort((a,b) => b.total - a.total);

    let htmlRanking = `<div class="dash-card" style="grid-column: span 2; padding: 15px; border: 1px solid #fde047; box-shadow: 0 4px 15px rgba(253, 224, 71, 0.2);">
        <h3 style="color:#b45309; font-size:0.9rem; font-weight:900; text-align:center; margin:0 0 15px 0;">🏆 RANKING DE VENDAS DO PERÍODO</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">`;
    if (rankingArr.length === 0) htmlRanking += `<p style='text-align:center; color:#999; font-size:0.8rem; margin:0;'>Nenhuma venda registrada.</p>`;
    
    rankingArr.forEach((r, idx) => {
        let corMedalha = idx === 0 ? "#fef08a" : (idx === 1 ? "#e2e8f0" : (idx === 2 ? "#fed7aa" : "#f8fafc"));
        let emoji = idx === 0 ? "🥇" : (idx === 1 ? "🥈" : (idx === 2 ? "🥉" : "🎖️"));
        let tagAdmin = isAdmin ? `<div style="font-size:0.65rem; color:#991b1b; font-weight:700;">A Repassar: ${fmt(r.comissaoPend)}</div>` : '';
        let nomeDestaque = r.nome.toLowerCase() === usuarioLogado.toLowerCase() ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.6rem; margin-left:5px;">VOCÊ</span>` : '';
        
        htmlRanking += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:${corMedalha}; padding:10px 15px; border-radius:8px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.5rem;">${emoji}</span>
                <strong style="color:var(--brand-dark); font-size:0.9rem;">${r.nome} ${nomeDestaque}</strong>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:900; color:#b45309; font-size:1rem;">${fmt(r.total)}</div>
                <div style="font-size:0.65rem; color:#888;">${r.itens} vendidos</div>
                ${tagAdmin}
            </div>
        </div>`;
    });
    htmlRanking += `</div></div>`;

    // ============================================
    // VISÃO DO VENDEDOR (Gamificada: Projeção + Badges + CRM)
    // ============================================
    if (!isAdmin) {
        let minhasVendas = vDashGlobal.filter(v => String(v.socio).toLowerCase().trim() === usuarioLogado.toLowerCase().trim());
        let minhasVendasHist = vendasGlobal.filter(v => String(v.socio).toLowerCase().trim() === usuarioLogado.toLowerCase().trim()); 
        
        let tVend = 0, tItens = 0, comAprovada = 0, comPendente = 0;
        let mProd = {}, mCli = {};
        let faturamentoPorDiaMeus = {};

        minhasVendas.forEach(v => {
            const val = parseDinheiro(v.valor_venda); const com = parseFloat(v.valor_comissao) || 0; const q = parseInt(v.qtd) || 1;
            tVend += val; tItens += q;
            if(v.status === 'Pago' && v.repasse_feito) comAprovada += com; else comPendente += com;
            
            if (v.produto) mProd[v.produto] = (mProd[v.produto] || 0) + q;
            if (v.cliente) mCli[v.cliente] = (mCli[v.cliente] || 0) + val;

            if (v.status !== 'Presente') {
                let dia = v.dataVendaIso ? v.dataVendaIso.split('-')[2] : '00';
                if(!faturamentoPorDiaMeus[dia]) faturamentoPorDiaMeus[dia] = 0;
                faturamentoPorDiaMeus[dia] += val;
            }
        });

        // 🔮 MÁGICA 1: PROJEÇÃO DE GANHOS
        let totalComissaoGerada = comAprovada + comPendente;
        let dataHojeProj = new Date();
        let eMesAtual = (parseInt(fM) === dataHojeProj.getMonth() + 1 && parseInt(fA) === dataHojeProj.getFullYear());
        let htmlProjecao = "";

        if (eMesAtual) {
            let diasNoMes = new Date(parseInt(fA), parseInt(fM), 0).getDate();
            let diasPassados = dataHojeProj.getDate();
            
            let projecaoMensal = (totalComissaoGerada / diasPassados) * diasNoMes;
            if (projecaoMensal < totalComissaoGerada) projecaoMensal = totalComissaoGerada;

            let porcentagemProgresso = projecaoMensal > 0 ? (totalComissaoGerada / projecaoMensal) * 100 : 0;
            let msgMotivacional = totalComissaoGerada === 0 ? "Faça a sua primeira venda do mês para calcularmos sua projeção! 🎯" : "*Se você mantiver o seu ritmo atual de vendas. Bora bater a meta! 🚀";

            htmlProjecao = `
            <div class="dash-card" style="grid-column: span 2; padding: 20px; border: 1px solid #c4b5fd; background: #faf5ff; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.15);">
                <h3 style="color:#7e22ce; font-size:0.85rem; font-weight:900; text-align:center; margin:0 0 15px 0;">🔮 SUA ESTIMATIVA DE GANHOS DO MÊS</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="text-align:left;">
                        <span style="font-size:0.65rem; color:#9333ea; font-weight:bold; display:block;">Já Garantido (Comissões)</span>
                        <span style="font-size:1.4rem; color:#7e22ce; font-weight:900;">${fmt(totalComissaoGerada)}</span>
                    </div>
                    <div style="font-size:1.5rem; color:#d8b4fe; animation: pulse 2s infinite;">👉</div>
                    <div style="text-align:right;">
                        <span style="font-size:0.65rem; color:#15803d; font-weight:bold; display:block;">Projeção Final do Mês</span>
                        <span style="font-size:1.4rem; color:#16a34a; font-weight:900;">${fmt(projecaoMensal)}</span>
                    </div>
                </div>
                <div style="width: 100%; background: #e9d5ff; border-radius: 10px; height: 10px; overflow: hidden; position: relative; border: 1px solid #d8b4fe;">
                    <div style="width: ${porcentagemProgresso}%; background: linear-gradient(90deg, #9333ea, #a855f7); height: 100%; border-radius: 10px; transition: width 1.5s ease-in-out;"></div>
                </div>
                <p style="font-size:0.65rem; color:#a855f7; text-align:center; margin:10px 0 0 0; font-style:italic;">${msgMotivacional}</p>
            </div>`;
        }

        // 🏅 MÁGICA 2: BADGES DE CONQUISTAS (CORRIGIDOS PARA METAS CLARAS)
        let totalFiadoMês = 0;
        minhasVendas.forEach(v => { if(v.status !== 'Pago' && v.status !== 'Presente') totalFiadoMês += parseDinheiro(v.valor_venda); });

        let badges = [];
        
        // 🚀 Ouro/Prata trocados por conquistas de "Volume e Ação" claras
        if(tItens >= 50) badges.push(`<div title="Máquina de Vendas: +50 itens no mês!" style="display:flex; flex-direction:column; align-items:center; background:#fef08a; padding:8px 10px; border-radius:8px; border:1px solid #fde047; min-width:65px; box-shadow:0 2px 4px rgba(0,0,0,0.05);"><span style="font-size:1.6rem;">🚀</span><span style="font-size:0.6rem; font-weight:900; color:#b45309; margin-top:4px;">50+ VENDAS</span></div>`);
        else if(tItens >= 20) badges.push(`<div title="Ritmo Acelerado: +20 itens no mês!" style="display:flex; flex-direction:column; align-items:center; background:#fed7aa; padding:8px 10px; border-radius:8px; border:1px solid #fdba74; min-width:65px; box-shadow:0 2px 4px rgba(0,0,0,0.05);"><span style="font-size:1.6rem;">🔥</span><span style="font-size:0.6rem; font-weight:900; color:#c2410c; margin-top:4px;">20+ VENDAS</span></div>`);
        else if(tItens >= 10) badges.push(`<div title="Belo Começo: +10 itens no mês!" style="display:flex; flex-direction:column; align-items:center; background:#bbf7d0; padding:8px 10px; border-radius:8px; border:1px solid #86efac; min-width:65px; box-shadow:0 2px 4px rgba(0,0,0,0.05);"><span style="font-size:1.6rem;">⭐</span><span style="font-size:0.6rem; font-weight:900; color:#15803d; margin-top:4px;">10+ VENDAS</span></div>`);
        
        // 💎 Conquista Financeira
        if(tVend >= 2000) badges.push(`<div title="Faturamento VIP: +R$ 2.000 vendidos no mês!" style="display:flex; flex-direction:column; align-items:center; background:#e9d5ff; padding:8px 10px; border-radius:8px; border:1px solid #d8b4fe; min-width:65px; box-shadow:0 2px 4px rgba(0,0,0,0.05);"><span style="font-size:1.6rem;">💎</span><span style="font-size:0.6rem; font-weight:900; color:#7e22ce; margin-top:4px;">VIP 2K+</span></div>`);
        
        // 🛡️ Conquista de Cobrança
        if(tItens >= 5 && totalFiadoMês === 0) badges.push(`<div title="Cobrador de Elite: Mais de 5 vendas e R$ 0,00 Fiados pendentes no mês!" style="display:flex; flex-direction:column; align-items:center; background:#dcfce7; padding:8px 10px; border-radius:8px; border:1px solid #86efac; min-width:65px; box-shadow:0 2px 4px rgba(0,0,0,0.05);"><span style="font-size:1.6rem;">🛡️</span><span style="font-size:0.6rem; font-weight:900; color:#166534; margin-top:4px;">0 FIADO</span></div>`);
        
        // 🌱 Conquista Inicial
        if(badges.length === 0 && tItens > 0) badges.push(`<div title="Deu o Primeiro Passo!" style="display:flex; flex-direction:column; align-items:center; background:#f3f4f6; padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; min-width:65px; box-shadow:0 2px 4px rgba(0,0,0,0.05);"><span style="font-size:1.6rem;">🌱</span><span style="font-size:0.6rem; font-weight:900; color:#4b5563; margin-top:4px;">INÍCIO</span></div>`);
        if(badges.length === 0 && tItens === 0) badges.push(`<span style="font-size:0.75rem; color:#888; font-style:italic;">Faça sua primeira venda para ganhar medalhas!</span>`);

        let htmlBadges = `
        <div class="dash-card" style="grid-column: span 2; padding: 15px; background: #fff; border-bottom: 3px solid #fde047;">
            <h3 style="color:#b45309; font-size:0.75rem; border-bottom:1px dashed #fef08a; padding-bottom:5px; margin-bottom:15px; text-align:center;">🏆 MINHAS METAS ALCANÇADAS (${fM}/${fA})</h3>
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                ${badges.join('')}
            </div>
        </div>`;

        // 🎯 MÁGICA 3: CRM / RADAR DE RECOMPRA AUTOMÁTICO
        let mapClientes = {};
        const hojeD = new Date();
        minhasVendasHist.forEach(v => {
            if(v.status === 'Presente') return;
            let cNome = String(v.cliente).trim();
            let dataV = new Date(v.dataVendaIso);
            if(!mapClientes[cNome] || dataV > mapClientes[cNome].data) {
                mapClientes[cNome] = { data: dataV, produto: v.produto }; // Guarda sempre a venda mais recente
            }
        });

        let listaCrm = [];
        for(let c in mapClientes) {
            let diffTime = Math.abs(hojeD - mapClientes[c].data);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Entra no radar clientes que compraram o último perfume entre 45 e 120 dias
            if(diffDays >= 45 && diffDays <= 120) {
                listaCrm.push({ cliente: c, dias: diffDays, produto: mapClientes[c].produto });
            }
        }
        listaCrm.sort((a,b) => b.dias - a.dias); // Ordena para os mais atrasados aparecerem primeiro

        let htmlCrm = "";
        if(listaCrm.length > 0) {
            let itensCrmHtml = listaCrm.slice(0, 5).map(c => {
                let msgZap = encodeURIComponent(`Olá ${c.cliente}, tudo bem? Aqui é da Novera Scent! ✨\n\nVi que faz uns ${c.dias} dias que você levou o perfume ${c.produto}. Ele já deve estar no finalzinho, né?\n\nQuer aproveitar para repor ou provar uma novidade? Chegou muita coisa boa!`);
                return `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #bae6fd; padding:10px 0;">
                    <div style="flex:1; min-width:0; margin-right:10px;">
                        <strong style="color:var(--brand-dark); font-size:0.85rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.cliente}</strong>
                        <span style="font-size:0.65rem; color:#0369a1;">Vendido há <b>${c.dias} dias</b> (${c.produto})</span>
                    </div>
                    <a href="https://wa.me/?text=${msgZap}" target="_blank" style="background:#22c55e; color:white; text-decoration:none; padding:8px 12px; border-radius:6px; font-size:0.75rem; font-weight:bold; box-shadow:0 2px 5px rgba(34, 197, 94, 0.3); display:flex; align-items:center; gap:5px; flex-shrink:0;">
                        <span>💬</span> Chamar
                    </a>
                </div>`;
            }).join('');
            
            htmlCrm = `
            <div class="dash-card" style="grid-column: span 2; padding: 15px; border-left: 5px solid #0ea5e9; background: #f0f9ff;">
                <h3 style="color:#0369a1; font-size:0.85rem; border-bottom:1px dashed #bae6fd; padding-bottom:5px; margin-bottom:10px;">🎯 RADAR DE RECOMPRA (DINHEIRO NA MESA)</h3>
                <p style="font-size:0.65rem; color:#0284c7; margin-top:-5px; margin-bottom:10px;">Estes clientes compraram há mais de 45 dias. O frasco deles está no fim!</p>
                ${itensCrmHtml}
            </div>`;
        }

        let prevM_int = parseInt(fM) - 1; let prevA_int = parseInt(fA);
        if(prevM_int === 0) { prevM_int = 12; prevA_int -= 1; }
        let prevM_str = String(prevM_int).padStart(2, '0');
        let pfxPrev = `${prevA_int}-${prevM_str}`;
        
        let pVendMeus = 0;
        vendasGlobal.forEach(v => {
            if (String(v.socio).toLowerCase().trim() === usuarioLogado.toLowerCase().trim() && v.dataVendaIso && v.dataVendaIso.startsWith(pfxPrev) && v.status !== 'Presente') {
                pVendMeus += parseDinheiro(v.valor_venda);
            }
        });
        
        let crescimentoIcon = '➖'; let crescimentoCor = '#888'; let crescimentoTxt = 'Igual ao mês anterior';
        if (pVendMeus > 0) {
            let perc = ((tVend - pVendMeus) / pVendMeus) * 100;
            if (perc > 0) { crescimentoIcon = '📈'; crescimentoCor = '#15803d'; crescimentoTxt = `+${perc.toFixed(1)}% vs Mês Ant.`; }
            else if (perc < 0) { crescimentoIcon = '📉'; crescimentoCor = '#b91c1c'; crescimentoTxt = `${perc.toFixed(1)}% vs Mês Ant.`; }
        } else if (tVend > 0) {
            crescimentoIcon = '🚀'; crescimentoCor = '#15803d'; crescimentoTxt = `Novo recorde!`;
        }

        let arrProd = Object.keys(mProd).map(k => ({ nome: k, qtd: mProd[k] })).sort((a, b) => b.qtd - a.qtd).slice(0, 5);
        let arrCli = Object.keys(mCli).map(k => ({ nome: k, val: mCli[k] })).sort((a, b) => b.val - a.val).slice(0, 5);

        let listaProd = arrProd.length ? arrProd.map((p, i) => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #e5e7eb; padding:5px 0;"><span style="font-size:0.8rem;">#${i+1} ${p.nome}</span><strong style="color:var(--primary-dark); font-size:0.8rem;">${p.qtd} un</strong></div>`).join('') : "<p style='color:#999; font-size:0.75rem;'>Sem dados.</p>";
        let listaCli = arrCli.length ? arrCli.map((c, i) => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #e5e7eb; padding:5px 0;"><span style="font-size:0.8rem;">#${i+1} ${c.nome}</span><strong style="color:#b45309; font-size:0.8rem;">${fmt(c.val)}</strong></div>`).join('') : "<p style='color:#999; font-size:0.75rem;'>Sem dados.</p>";

        // 🎯 Meta do mês: barra de progresso motivacional (só aparece se a Diretoria definiu meta pro vendedor)
        let htmlMeta = '';
        const meuCadastro = usuariosGlobal.find(u => String(u.usuario).toLowerCase().trim() === usuarioLogado.toLowerCase().trim());
        const minhaMeta = meuCadastro ? (parseFloat(meuCadastro.meta_mensal) || 0) : 0;
        if (minhaMeta > 0) {
            const pctMeta = Math.min(100, (tVend / minhaMeta) * 100);
            const bateu = tVend >= minhaMeta;
            const faltam = Math.max(0, minhaMeta - tVend);
            htmlMeta = `
                <div class="dash-card" style="grid-column: span 2; padding: 18px; border: 2px solid ${bateu ? '#22c55e' : '#fbbf24'}; background: ${bateu ? '#f0fdf4' : '#fffbeb'};">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h3 style="color:${bateu ? '#15803d' : '#b45309'}; font-size:0.8rem; font-weight:900; margin:0;">🎯 MINHA META DO MÊS</h3>
                        <strong style="color:${bateu ? '#15803d' : '#b45309'}; font-size:1rem;">${pctMeta.toFixed(0)}%</strong>
                    </div>
                    <div style="background:#e5e7eb; border-radius:20px; height:16px; overflow:hidden;">
                        <div style="width:${pctMeta.toFixed(1)}%; height:100%; border-radius:20px; background:${bateu ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#fbbf24,#f59e0b)'}; transition:width 0.6s ease;"></div>
                    </div>
                    <p style="font-size:0.72rem; color:${bateu ? '#15803d' : '#92400e'}; margin:8px 0 0 0; font-weight:700; text-align:center;">
                        ${bateu ? `🏆 META BATIDA! ${fmt(tVend)} de ${fmt(minhaMeta)} — você é incrível!` : `${fmt(tVend)} de ${fmt(minhaMeta)} — faltam ${fmt(faltam)}, você consegue! 🔥`}
                    </p>
                </div>`;
        }

        // 🎖️ PATENTE DE CARREIRA: baseada no acumulado da vida toda — nunca reseta, só sobe
        const carreiraTotal = minhasVendasHist.reduce((s, v) => s + (v.status !== 'Presente' ? parseDinheiro(v.valor_venda) : 0), 0);
        const PATENTES = [['🌱', 'Iniciante', 0], ['🥉', 'Bronze', 1000], ['🥈', 'Prata', 5000], ['🥇', 'Ouro', 15000], ['💎', 'Diamante', 50000]];
        let patenteIdx = 0;
        PATENTES.forEach((p, i) => { if (carreiraTotal >= p[2]) patenteIdx = i; });
        const patenteAtual = PATENTES[patenteIdx];
        const proximaPatente = PATENTES[patenteIdx + 1] || null;
        let htmlPatente = `
            <div class="dash-card" style="grid-column: span 2; padding: 15px; background: linear-gradient(135deg, #1e293b, #334155); border: none;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="color:#94a3b8; font-size:0.65rem; font-weight:800; margin:0; letter-spacing:1px;">MINHA PATENTE DE CARREIRA</h3>
                        <p style="color:#fff; font-size:1.3rem; font-weight:900; margin:4px 0 0 0;">${patenteAtual[0]} ${patenteAtual[1]}</p>
                    </div>
                    <div style="text-align:right;">
                        <span style="color:#94a3b8; font-size:0.6rem; display:block;">Total da carreira</span>
                        <span style="color:#fbbf24; font-size:1rem; font-weight:900;">${fmt(carreiraTotal)}</span>
                    </div>
                </div>
                ${proximaPatente ? `
                <div style="background:rgba(255,255,255,0.12); border-radius:20px; height:10px; overflow:hidden; margin-top:10px;">
                    <div style="width:${Math.min(100, (carreiraTotal / proximaPatente[2]) * 100).toFixed(1)}%; height:100%; background:linear-gradient(90deg,#fbbf24,#f59e0b); border-radius:20px;"></div>
                </div>
                <p style="color:#cbd5e1; font-size:0.62rem; margin:6px 0 0 0; text-align:center;">Faltam <b style="color:#fbbf24;">${fmt(Math.max(0, proximaPatente[2] - carreiraTotal))}</b> pra patente ${proximaPatente[0]} ${proximaPatente[1]}!</p>` : `
                <p style="color:#cbd5e1; font-size:0.62rem; margin:8px 0 0 0; text-align:center;">💎 Patente máxima alcançada — você é lenda! 👏</p>`}
            </div>`;

        // 🔥 SEQUÊNCIA DE DIAS VENDENDO (streak): tolera o "ainda não vendi hoje" contando até ontem
        const diasComVendaStreak = new Set(minhasVendasHist.filter(v => v.status !== 'Presente').map(v => v.dataVendaIso));
        const hojeIsoStreak = new Date().toISOString().split('T')[0];
        const vendeuHoje = diasComVendaStreak.has(hojeIsoStreak);
        let streakDias = 0;
        const cursorStreak = new Date();
        if (!vendeuHoje) cursorStreak.setDate(cursorStreak.getDate() - 1);
        while (diasComVendaStreak.has(cursorStreak.toISOString().split('T')[0])) { streakDias++; cursorStreak.setDate(cursorStreak.getDate() - 1); }
        let htmlStreak = '';
        if (streakDias >= 2) {
            htmlStreak = `
            <div class="dash-card" style="grid-column: span 2; padding: 14px; background: ${vendeuHoje ? '#fff7ed' : '#fef2f2'}; border: 2px solid ${vendeuHoje ? '#fdba74' : '#fca5a5'}; text-align:center;">
                <p style="margin:0; font-size:1rem; font-weight:900; color:${vendeuHoje ? '#c2410c' : '#b91c1c'};">🔥 ${streakDias} dia${streakDias > 1 ? 's' : ''} seguido${streakDias > 1 ? 's' : ''} vendendo!</p>
                <p style="margin:4px 0 0 0; font-size:0.68rem; color:${vendeuHoje ? '#9a3412' : '#991b1b'}; font-weight:700;">${vendeuHoje ? 'Corrente viva — continue amanhã! 💪' : '⚠️ Ainda sem venda hoje… uma vendinha salva a corrente!'}</p>
            </div>`;
        }

        // 🏛️ SALA DE TROFÉUS: tudo que já foi conquistado na carreira, gravado pra sempre
        const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const minhasConquistas = conquistasGlobal
            .filter(c => normalizarNomeBusca(c.usuario) === normalizarNomeBusca(usuarioLogado))
            .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
        let htmlSala = '';
        if (minhasConquistas.length) {
            const chips = minhasConquistas.map(c => {
                let mesTxt = '';
                if (c.mes) { const [aM, mM] = c.mes.split('-'); mesTxt = `${mesesAbrev[parseInt(mM) - 1] || ''}/${String(aM).slice(2)}`; }
                return `<div title="${c.titulo}${mesTxt ? ' — ' + mesTxt : ''}" style="display:flex; flex-direction:column; align-items:center; background:#fffbeb; padding:8px 10px; border-radius:10px; border:1px solid #fde68a; min-width:70px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <span style="font-size:1.5rem;">${c.emoji || '🏆'}</span>
                    <span style="font-size:0.55rem; font-weight:900; color:#92400e; margin-top:3px; text-align:center; line-height:1.2;">${c.titulo}</span>
                    ${mesTxt ? `<span style="font-size:0.5rem; color:#b45309; margin-top:2px;">${mesTxt}</span>` : ''}
                </div>`;
            }).join('');
            htmlSala = `
            <div class="dash-card" style="grid-column: span 2; padding: 15px; background: #fff; border-bottom: 3px solid #b45309; cursor: pointer;" onclick="abrirModalSalaTrofeus()" title="Toque para ver os detalhes de cada conquista">
                <h3 style="color:#92400e; font-size:0.75rem; border-bottom:1px dashed #fde68a; padding-bottom:5px; margin-bottom:12px; text-align:center;">🏛️ MINHA SALA DE TROFÉUS (${minhasConquistas.length})</h3>
                <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">${chips}</div>
                <p style="font-size:0.6rem; color:#b45309; margin:10px 0 0 0; text-align:center; font-style:italic;">👆 Toque para ver os detalhes de cada conquista</p>
            </div>`;
        }

        // 🔗 MEU CATÁLOGO ONLINE: quantas pessoas abriram o link que EU divulguei
        const vcMeu = estatisticasVisitasCatalogo(usuarioLogado);
        const htmlVisitasCat = `
            <div class="dash-card" style="grid-column: span 2; padding: 15px; background: #f0fdfa; border: 1px solid #99f6e4;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="color:#0f766e; font-size:0.75rem; font-weight:900; margin:0;">🔗 MEU CATÁLOGO ONLINE</h3>
                    <span style="font-size:0.6rem; color:#0d9488; font-weight:700;">${vcMeu.hoje > 0 ? `👀 ${vcMeu.hoje} hoje!` : ''}</span>
                </div>
                <div style="display:flex; gap:8px; margin-top:10px; text-align:center;">
                    <div style="flex:1; background:#fff; border-radius:10px; padding:8px;"><span style="font-size:1.2rem; font-weight:900; color:#0f766e; display:block;">${vcMeu.sete}</span><span style="font-size:0.58rem; color:#888;">visitas · 7d</span></div>
                    <div style="flex:1; background:#fff; border-radius:10px; padding:8px;"><span style="font-size:1.2rem; font-weight:900; color:#0f766e; display:block;">${vcMeu.total}</span><span style="font-size:0.58rem; color:#888;">visitas · total</span></div>
                    <div style="flex:1; background:#fff; border-radius:10px; padding:8px;"><span style="font-size:1.2rem; font-weight:900; color:#c2410c; display:block;">🛒 ${vcMeu.ped7}</span><span style="font-size:0.58rem; color:#888;">pedidos · 7d</span></div>
                </div>
                <p style="font-size:0.62rem; color:#0d9488; margin:8px 0 0 0; text-align:center;">${vcMeu.total === 0 ? 'Gere seu link em Estoque → Catálogo e divulgue — cada visita é um cliente olhando a vitrine! 🚀' : 'Cada visita é um cliente na sua vitrine. Continue divulgando! 💪'}</p>
            </div>`;

        container.innerHTML = `
            <div class="dash-grid">
                <div class="dash-card highlight" style="grid-column: span 2; padding: 20px; text-align: center; border-radius: 12px; background: linear-gradient(135deg, #0369a1, #0284c7);">
                    <h3 style="color: #e0f2fe; font-size: 0.8rem; font-weight: 700; margin: 0 0 10px 0;">MINHAS VENDAS NO PERÍODO</h3>
                    <p class="valor" style="font-size: 2.2rem; color: #fff; margin: 0;">${fmt(tVend)}</p>
                    <p style="font-size: 0.75rem; color: #bae6fd; margin: 5px 0 0 0;">${tItens} produtos vendidos</p>
                    <div style="margin-top: 10px; background: rgba(255,255,255,0.1); display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; color: #fff; font-weight: bold;">
                        ${crescimentoIcon} ${crescimentoTxt} (Anterior: ${fmt(pVendMeus)})
                    </div>
                </div>
                ${htmlMeta}
                <div class="dash-card" style="padding: 15px; border-left: 5px solid #2e7d32;">
                    <h3 style="color:#666; font-size:0.7rem; margin:0 0 5px 0;">COMISSÃO REPASSADA (PAGA)</h3>
                    <p style="font-size:1.4rem; font-weight:900; color:#2e7d32; margin:0;">${fmt(comAprovada)}</p>
                    <p style="font-size:0.6rem; color:#888; margin-top:3px;">Já acertado c/ a empresa</p>
                </div>
                <div class="dash-card" style="padding: 15px; border-left: 5px solid #f59e0b;">
                    <h3 style="color:#666; font-size:0.7rem; margin:0 0 5px 0;">COMISSÃO PENDENTE</h3>
                    <p style="font-size:1.4rem; font-weight:900; color:#b45309; margin:0;">${fmt(comPendente)}</p>
                    <p style="font-size:0.6rem; color:#888; margin-top:3px;">Aguardando clientes/acerto</p>
                </div>
                
                ${htmlProjecao}
                ${htmlStreak}
                ${htmlBadges}
                ${htmlSala}
                ${htmlPatente}
                ${htmlRanking}
                ${htmlVisitasCat}
                ${htmlCrm}
                
                <div class="dash-card" style="grid-column: span 2; padding: 15px;">
                    <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">📈 MEU DESEMPENHO DIÁRIO 👆</h3>
                    <p style="font-size:0.6rem; color:#888; margin-top:-5px; margin-bottom:10px;">(Clique nos pontos para detalhes)</p>
                    <div style="position: relative; height: 200px; width: 100%;">
                        <canvas id="chartFatDiarioVendedor"></canvas>
                    </div>
                </div>

                <div class="dash-card" style="padding:15px;">
                    <h3 style="color:var(--primary-dark); font-size:0.75rem; border-bottom:1px solid #E8DDE1; padding-bottom:5px; margin-bottom:10px;">⭐ MEUS TOP 5 PRODUTOS</h3>
                    ${listaProd}
                </div>
                <div class="dash-card" style="padding:15px;">
                    <h3 style="color:#b45309; font-size:0.75rem; border-bottom:1px solid #fde047; padding-bottom:5px; margin-bottom:10px;">👑 MEUS TOP 5 CLIENTES</h3>
                    ${listaCli}
                </div>
            </div>`;

        if (typeof Chart !== 'undefined') {
            if (window.gFatDiarioVend) window.gFatDiarioVend.destroy();
            
            const exibirDetalhesGraficoVend = (titulo, arrayDados) => {
                let html = arrayDados.map(item => `
                    <div style="border-bottom:1px dashed #e5e7eb; padding:10px 0;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <b style="color:var(--brand-dark);">${item.qtd}x ${item.produto}</b>
                            <b style="color:#15803d;">${safeFmt(item.valor_venda)}</b>
                        </div>
                        <div style="font-size:0.7rem; color:#64748b;">👤 Cli: ${item.cliente} | 📊 ${item.status}</div>
                    </div>`).join('');
                document.getElementById('titulo-detalhes-chart').innerText = titulo;
                document.getElementById('conteudo-detalhes-chart').innerHTML = html || '<p>Sem dados registrados.</p>';
                document.getElementById('modal-detalhes-chart').style.display = 'flex';
            };

            const ctxFatVend = document.getElementById('chartFatDiarioVendedor').getContext('2d');
            let diasOrdVend = Object.keys(faturamentoPorDiaMeus).sort();
            let valDiariosVend = diasOrdVend.map(d => faturamentoPorDiaMeus[d]);
            
            window.gFatDiarioVend = new Chart(ctxFatVend, {
                type: 'line',
                data: { labels: diasOrdVend.map(d => `Dia ${d}`), datasets: [{ label: 'Faturamento', data: valDiariosVend, borderColor: '#0369a1', backgroundColor: 'rgba(3, 105, 161, 0.2)', fill: true, tension: 0.4 }] },
                options: { 
                    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } },
                    onClick: (e, activeEls) => {
                        if(activeEls.length > 0) {
                            const diaSelect = diasOrdVend[activeEls[0].index];
                            let venDoDia = minhasVendas.filter(v => v.dataVendaIso && v.dataVendaIso.split('-')[2] == diaSelect && v.status !== 'Presente');
                            exibirDetalhesGraficoVend(`Minhas Vendas (Dia ${diaSelect})`, venDoDia);
                        }
                    }
                }
            });
        }
        return; 
    }

    // ============================================
    // VISÃO DO ADMIN (War Room / MESA DE DIRETORIA)
    // ============================================
    
    const gDashGlobal = gSocioGlobal.filter(g => pfx ? (g.dataIso && g.dataIso.startsWith(pfx)) : true);
    
    let tRec = 0, tPend = 0, tGas = 0, tLucroTotal = 0, tVendasTotais = 0, qtdVendasReais = 0;
    let tCustoTotal = 0, tBonusPago = 0;
    let mProd = {}, mCli = {}; 
    let pedidosIdSet = new Set(); 

    let faturamentoPorDia = {};
    let recebimentosPorDia = {}; 
    let mixProdutos = {};
    let mixProdutosDetalhes = {}; 
    let devedoresFiltrados = {}; 

    vDashGlobal.forEach(v => {
        const val = parseDinheiro(v.valor_venda); const luc = parseDinheiro(v.lucro); const q = parseInt(v.qtd) || 1;
        if (v.status === 'Pago') tRec += val; else tPend += val;
        tLucroTotal += luc;
        tVendasTotais += val;
        tCustoTotal += parseDinheiro(v.custo_total);
        const bonusPctVenda = parseFloat(v.bonus_aplicado) || 0;
        if (bonusPctVenda > 0) tBonusPago += (val * bonusPctVenda) / 100;

        if (v.status === 'Pendente' || v.status === 'Parcelado') {
            let clienteLimpo = String(v.cliente).trim();
            if (!devedoresFiltrados[clienteLimpo]) devedoresFiltrados[clienteLimpo] = 0;
            devedoresFiltrados[clienteLimpo] += val;
        }

        if (v.produto) mProd[v.produto] = (mProd[v.produto] || 0) + q; 
        if (v.cliente) mCli[v.cliente] = (mCli[v.cliente] || 0) + val; 

        if (v.status !== 'Presente') {
            pedidosIdSet.add(v.dataVendaIso + v.cliente);
            qtdVendasReais++;
            
            let dia = v.dataVendaIso ? v.dataVendaIso.split('-')[2] : '00';
            if(!faturamentoPorDia[dia]) faturamentoPorDia[dia] = 0;
            faturamentoPorDia[dia] += val;

            let prodRef = estoqueAgrupado[padronizarTexto(v.produto)];
            let catMix = "Outros";
            if (prodRef) {
                let tipoLimpo = String(prodRef.tipo).trim();
                let genLimpo = String(prodRef.genero).trim();
                if (tipoLimpo.toLowerCase().includes("perfume")) catMix = `Perfume ${genLimpo}`;
                else catMix = tipoLimpo;
            }
            if(!mixProdutos[catMix]) { mixProdutos[catMix] = 0; mixProdutosDetalhes[catMix] = []; }
            mixProdutos[catMix] += val;
            mixProdutosDetalhes[catMix].push(v);
        }
    }); 

    vSocioGlobal.forEach(v => {
        if (v.status === 'Pago' && v.dataPgtoDisplay) {
            let parts = v.dataPgtoDisplay.split('/');
            if (parts.length === 3) {
                let dDia = parts[0];
                let dMes = parts[1];
                let dAno = parts[2];
                if (dMes === fM && dAno === fA) {
                    if (!recebimentosPorDia[dDia]) recebimentosPorDia[dDia] = 0;
                    recebimentosPorDia[dDia] += parseDinheiro(v.valor_venda);
                }
            }
        }
    });
    
    gDashGlobal.forEach(g => tGas += parseDinheiro(g.total)); 
    const lReal = tRec - tGas; 
    let estItens = 0, estValor = 0; 
    estoqueGlobal.forEach(e => { let q = parseFloat(e.qtd) || 0; if (q > 0) { estItens += q; estValor += (q * parseDinheiro(e.preco)); } }); 
    
    const patrimonio = lReal + tPend + estValor; 
    const ticketMedio = pedidosIdSet.size > 0 ? (tVendasTotais / pedidosIdSet.size) : 0;

    let histVendas = new Array(12).fill(0), histRec = new Array(12).fill(0), histGastos = new Array(12).fill(0);
    vSocioGlobal.forEach(v => {
        if(v.dataVendaIso && v.dataVendaIso.startsWith(fA) && v.status !== 'Presente') {
            let mIndex = parseInt(v.dataVendaIso.split('-')[1]) - 1;
            let val = parseDinheiro(v.valor_venda);
            histVendas[mIndex] += val;
            if(v.status === 'Pago') histRec[mIndex] += val;
        }
    });
    gSocioGlobal.forEach(g => {
        if(g.dataIso && g.dataIso.startsWith(fA)) {
            let mIndex = parseInt(g.dataIso.split('-')[1]) - 1;
            histGastos[mIndex] += parseDinheiro(g.total);
        }
    });

    let prevM_int = parseInt(fM) - 1; let prevA_int = parseInt(fA);
    if(prevM_int === 0) { prevM_int = 12; prevA_int -= 1; }
    let prevM_str = String(prevM_int).padStart(2, '0');
    let pfxPrev = `${prevA_int}-${prevM_str}`;
    let cVen = 0, cRec = 0, cGas = 0, cLuc = 0;
    let pVen = 0, pRec = 0, pGas = 0, pLuc = 0;

    vSocioGlobal.forEach(v => {
        let val = parseDinheiro(v.valor_venda); let luc = parseDinheiro(v.lucro);
        if(v.dataVendaIso && v.dataVendaIso.startsWith(pfx) && v.status !== 'Presente') { cVen += val; cLuc += luc; if(v.status === 'Pago') cRec += val; }
        if(v.dataVendaIso && v.dataVendaIso.startsWith(pfxPrev) && v.status !== 'Presente') { pVen += val; pLuc += luc; if(v.status === 'Pago') pRec += val; }
    });
    gSocioGlobal.forEach(g => { let val = parseDinheiro(g.total); if(g.dataIso && g.dataIso.startsWith(pfx)) cGas += val; if(g.dataIso && g.dataIso.startsWith(pfxPrev)) pGas += val; });

    let crescimentoAdminIcon = '➖'; let crescimentoAdminTxt = 'Igual ao período anterior';
    if (pVen > 0) {
        let perc = ((tVendasTotais - pVen) / pVen) * 100;
        if (perc > 0) { crescimentoAdminIcon = '📈'; crescimentoAdminTxt = `+${perc.toFixed(1)}% vs Ant.`; }
        else if (perc < 0) { crescimentoAdminIcon = '📉'; crescimentoAdminTxt = `${perc.toFixed(1)}% vs Ant.`; }
    } else if (tVendasTotais > 0) {
        crescimentoAdminIcon = '🚀'; crescimentoAdminTxt = `Novo recorde!`;
    }

    let arrProd = Object.keys(mProd).map(k => ({ nome: k, qtd: mProd[k] })).sort((a, b) => b.qtd - a.qtd).slice(0, 5);
    let arrCli = Object.keys(mCli).map(k => ({ nome: k, val: mCli[k] })).sort((a, b) => b.val - a.val).slice(0, 5);
    let topDevedores = Object.keys(devedoresFiltrados).map(k => ({ nome: k, divida: devedoresFiltrados[k] })).sort((a, b) => b.divida - a.divida).slice(0, 5);

    // 🐢 Produtos COM estoque que menos saíram no período (inclui os que venderam ZERO — os piores ficam no topo)
    let mProdPad = {};
    Object.keys(mProd).forEach(k => { const kp = padronizarTexto(k); mProdPad[kp] = (mProdPad[kp] || 0) + mProd[k]; });
    let arrEncalhados = Object.keys(estoqueAgrupado)
        .map(k => ({ nome: estoqueAgrupado[k].nome, estoque: estoqueAgrupado[k].totalQtd || 0, vendido: mProdPad[k] || 0 }))
        .filter(p => p.estoque > 0)
        .sort((a, b) => (a.vendido - b.vendido) || (b.estoque - a.estoque))
        .slice(0, 5);
    // 👻 Clientes que menos compraram no período (o inverso do Top 5)
    let arrCliFracos = Object.keys(mCli).map(k => ({ nome: k, val: mCli[k] })).sort((a, b) => a.val - b.val).slice(0, 5);

    // ⏳ Previsão de ruptura: estoque atual ÷ ritmo de venda dos últimos 30 dias (independe do filtro de mês).
    // Essencial porque a maceração demora: saber que vai acabar é útil ANTES de acabar o tempo de produzir.
    const corte30 = new Date(); corte30.setDate(corte30.getDate() - 30);
    const iso30 = corte30.toISOString().split('T')[0];
    const vendidos30 = {};
    vendasGlobal.forEach(v => {
        if (v.status !== 'Presente' && v.dataVendaIso && v.dataVendaIso >= iso30 && v.produto) {
            const k30 = padronizarTexto(v.produto);
            vendidos30[k30] = (vendidos30[k30] || 0) + (parseInt(v.qtd) || 1);
        }
    });
    let arrRuptura = Object.keys(estoqueAgrupado)
        .map(k => {
            const e = estoqueAgrupado[k];
            const vel = (vendidos30[k] || 0) / 30;
            return { nome: e.nome, estoque: e.totalQtd || 0, vel: vel, dias: vel > 0 ? Math.floor((e.totalQtd || 0) / vel) : null };
        })
        .filter(p => p.estoque > 0 && p.dias !== null)
        .sort((a, b) => a.dias - b.dias)
        .slice(0, 6);

    // 🕵️ Clientes Sumidos: já compraram alguma vez, mas estão há 45+ dias sem comprar nada.
    // Usa o histórico COMPLETO (ignora o filtro de mês, senão todo mundo fora do mês viraria "sumido"), mas respeita o filtro de Vendedor.
    const DIAS_CLIENTE_SUMIDO = 45;
    let mapaUltimaCompra = {};
    vSocioGlobal.forEach(v => {
        if (!v.cliente || !v.dataVendaIso) return;
        const nomeCli = String(v.cliente).trim();
        if (!nomeCli) return;
        if (!mapaUltimaCompra[nomeCli]) mapaUltimaCompra[nomeCli] = { ultima: v.dataVendaIso, total: 0 };
        if (v.dataVendaIso > mapaUltimaCompra[nomeCli].ultima) mapaUltimaCompra[nomeCli].ultima = v.dataVendaIso;
        mapaUltimaCompra[nomeCli].total += parseDinheiro(v.valor_venda);
    });
    let arrSumidos = Object.keys(mapaUltimaCompra)
        .map(k => ({ nome: k, dias: diasParadoDesde(mapaUltimaCompra[k].ultima), total: mapaUltimaCompra[k].total }))
        .filter(c => c.dias !== null && c.dias >= DIAS_CLIENTE_SUMIDO)
        .sort((a, b) => b.total - a.total); // quem mais gastava e sumiu aparece primeiro: maior potencial de reconquista
    const totalSumidos = arrSumidos.length;
    arrSumidos = arrSumidos.slice(0, 8);
    const tempoSumido = (dias) => dias < 60 ? `${dias} dias` : `${Math.floor(dias / 30)} meses`;

    let listaProd = arrProd.length ? arrProd.map((p, i) => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #e5e7eb; padding:5px 0;"><span style="font-size:0.8rem;">#${i+1} ${p.nome}</span><strong style="color:var(--primary-dark); font-size:0.8rem;">${p.qtd} un</strong></div>`).join('') : "<p style='color:#999; font-size:0.75rem;'>Sem dados no período.</p>";
    let listaCli = arrCli.length ? arrCli.map((c, i) => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #e5e7eb; padding:5px 0;"><span style="font-size:0.8rem;">#${i+1} ${c.nome}</span><strong style="color:#b45309; font-size:0.8rem;">${fmt(c.val)}</strong></div>`).join('') : "<p style='color:#999; font-size:0.75rem;'>Sem dados no período.</p>";
    let listaEncalhados = arrEncalhados.length ? arrEncalhados.map((p, i) => `
        <div style="border-bottom:1px dashed #e5e7eb; padding:6px 0;">
            <div style="font-size:0.8rem; color:var(--brand-dark);">#${i+1} ${p.nome}</div>
            <div style="font-size:0.72rem; color:#b91c1c; font-weight:800; margin-top:2px;">${p.vendido} un vendidas <span style="color:#999; font-weight:600;">(${p.estoque} sobrando)</span></div>
        </div>`).join('') : "<p style='color:#999; font-size:0.75rem;'>Nenhum produto em estoque.</p>";
    let listaCliFracos = arrCliFracos.length ? arrCliFracos.map((c, i) => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #e5e7eb; padding:5px 0;"><span style="font-size:0.8rem;">#${i+1} ${c.nome}</span><strong style="color:#6b7280; font-size:0.8rem;">${fmt(c.val)}</strong></div>`).join('') : "<p style='color:#999; font-size:0.75rem;'>Sem dados no período.</p>";
    let listaRuptura = arrRuptura.length ? arrRuptura.map(p => {
        const corR = p.dias <= 20 ? '#b91c1c' : p.dias <= 35 ? '#b45309' : '#15803d';
        const iconeR = p.dias <= 20 ? '🚨' : p.dias <= 35 ? '⚠️' : '🟢';
        return `<div style="border-bottom:1px dashed #fde68a; padding:6px 0;">
            <div style="display:flex; justify-content:space-between; gap:8px;">
                <span style="font-size:0.8rem; min-width:0; overflow-wrap:break-word;">${iconeR} ${p.nome}</span>
                <strong style="color:${corR}; font-size:0.85rem; white-space:nowrap;">acaba em ~${p.dias} dia${p.dias === 1 ? '' : 's'}</strong>
            </div>
            <span style="font-size:0.65rem; color:#a16207;">${p.estoque} un em estoque · vende ${p.vel.toFixed(1).replace('.', ',')} por dia</span>
        </div>`;
    }).join('') : "<p style='color:#999; font-size:0.75rem;'>Nenhum produto com giro nos últimos 30 dias pra prever.</p>";

    let listaSumidos = arrSumidos.length ? arrSumidos.map((c, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; border-bottom:1px dashed #ddd6fe; padding:7px 0;">
            <span style="font-size:0.82rem; font-weight:700; color:#4c1d95; min-width:0; overflow-wrap:break-word;">#${i+1} ${c.nome}</span>
            <span style="text-align:right; white-space:nowrap;">
                <strong style="color:#7c3aed; font-size:0.8rem; display:block;">há ${tempoSumido(c.dias)}</strong>
                <span style="color:#999; font-size:0.65rem;">já gastou ${fmt(c.total)}</span>
            </span>
        </div>`).join('') : "<p style='color:#15803d; font-size:0.8rem; font-weight:bold; margin-top:10px;'>Nenhum cliente sumido — todo mundo comprou nos últimos 45 dias! 🎉</p>";
    
    let listaDevedores = topDevedores.length ? topDevedores.map((d, i) => `
        <div onclick="switchTab('vendas'); toggleVendasTab('lotes'); document.getElementById('cobranca-cliente').value = '${d.nome}'; prepararCobranca();" 
             style="display:flex; justify-content:space-between; border-bottom:1px dashed #fca5a5; padding:8px 5px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='transparent'">
            <span style="font-size:0.85rem; color:#7f1d1d; font-weight:700;">#${i+1} 🔗 ${d.nome}</span>
            <strong style="color:#b91c1c; font-size:0.9rem;">${fmt(d.divida)}</strong>
        </div>`).join('') : "<p style='color:#15803d; font-size:0.8rem; font-weight:bold; margin-top:10px;'>Nenhum fiado gerado neste período! 🎉</p>";

    // 🌡️ TERMÔMETRO DE PREÇO: cruza recorrência, encomendas, rupturas e ticket médio pra dizer
    // se a base de clientes aguenta um aumento. Análise do momento atual (independe do filtro de mês).
    const hojeTermo = new Date();
    const isoHojeT = hojeTermo.toISOString().split('T')[0];
    const mesAtualT = isoHojeT.substring(0, 7);
    const mesAnteriorT = (() => { const d = new Date(hojeTermo); d.setDate(0); return d.toISOString().substring(0, 7); })();
    const corte90T = (() => { const d = new Date(hojeTermo); d.setDate(d.getDate() - 90); return d.toISOString().split('T')[0]; })();

    const vendasReaisT = vendasGlobal.filter(v => v.status !== 'Presente' && v.cliente && v.dataVendaIso);
    const porClienteT = {};
    vendasReaisT.forEach(v => {
        const c = normalizarNomeBusca(v.cliente);
        if (!porClienteT[c]) porClienteT[c] = new Set();
        porClienteT[c].add(v.dataVendaIso);
    });
    const clientesTotaisT = Object.keys(porClienteT).length;
    const clientesRecorrentesT = Object.values(porClienteT).filter(dias => dias.size >= 2).length;
    const pctRecorrentes = clientesTotaisT ? (clientesRecorrentesT / clientesTotaisT) * 100 : 0;

    let receita90Total = 0, receita90Recorrentes = 0;
    vendasReaisT.forEach(v => {
        if (v.dataVendaIso >= corte90T) {
            const val = parseDinheiro(v.valor_venda);
            receita90Total += val;
            if (porClienteT[normalizarNomeBusca(v.cliente)].size >= 2) receita90Recorrentes += val;
        }
    });
    const pctReceitaRecorrente = receita90Total ? (receita90Recorrentes / receita90Total) * 100 : 0;

    const encMesT = encomendasGlobal.filter(e => e.dataPedido && String(e.dataPedido).startsWith(mesAtualT)).length;
    const vendeuNoMesSetT = new Set(vendasReaisT.filter(v => v.dataVendaIso.startsWith(mesAtualT)).map(v => padronizarTexto(v.produto)));
    const rupturasMesT = Object.keys(estoqueAgrupado).filter(k => (estoqueAgrupado[k].totalQtd || 0) <= 0 && vendeuNoMesSetT.has(k)).length;

    const calcPedidosT = (pfxMes) => {
        const doMes = vendasReaisT.filter(v => v.dataVendaIso.startsWith(pfxMes));
        const pedidos = new Set(doMes.map(v => v.dataVendaIso + '|' + normalizarNomeBusca(v.cliente)));
        const valor = doMes.reduce((s, v) => s + parseDinheiro(v.valor_venda), 0);
        return pedidos.size ? valor / pedidos.size : 0;
    };
    const ticketAtualT = calcPedidosT(mesAtualT), ticketAntT = calcPedidosT(mesAnteriorT);

    let pontosTermo = 0; const sinaisTermo = [];
    if (pctRecorrentes >= 40) { pontosTermo += 2; sinaisTermo.push(`🟢 <b>${pctRecorrentes.toFixed(0)}%</b> dos ${clientesTotaisT} clientes voltam a comprar — fidelidade forte`); }
    else if (pctRecorrentes >= 25) { pontosTermo += 1; sinaisTermo.push(`🟡 <b>${pctRecorrentes.toFixed(0)}%</b> dos ${clientesTotaisT} clientes voltam a comprar — fidelidade média`); }
    else sinaisTermo.push(`🔴 Só <b>${pctRecorrentes.toFixed(0)}%</b> dos clientes recompram — fortaleça a base antes de mexer no preço`);
    if (pctReceitaRecorrente >= 50) { pontosTermo += 1; sinaisTermo.push(`🟢 <b>${pctReceitaRecorrente.toFixed(0)}%</b> do faturamento dos últimos 90 dias vem de quem volta — dependência saudável da Novera`); }
    else sinaisTermo.push(`🟡 <b>${pctReceitaRecorrente.toFixed(0)}%</b> do faturamento dos últimos 90 dias vem de quem volta`);
    if (encMesT >= 5) { pontosTermo += 2; sinaisTermo.push(`🟢 <b>${encMesT}</b> encomenda(s) este mês — gente aceitando ESPERAR pra comprar: demanda maior que a oferta`); }
    else if (encMesT >= 2) { pontosTermo += 1; sinaisTermo.push(`🟡 <b>${encMesT}</b> encomenda(s) este mês — demanda aquecendo`); }
    else sinaisTermo.push(`⚪ ${encMesT} encomenda(s) este mês`);
    if (rupturasMesT >= 3) { pontosTermo += 1; sinaisTermo.push(`🟢 <b>${rupturasMesT}</b> produto(s) venderam até ZERAR este mês — estavam baratos pra procura que têm`); }
    else if (rupturasMesT > 0) sinaisTermo.push(`🟡 ${rupturasMesT} produto(s) zeraram este mês`);
    if (ticketAntT > 0 && ticketAtualT >= ticketAntT) { pontosTermo += 1; sinaisTermo.push(`🟢 Ticket médio subindo: ${fmt(ticketAntT)} → <b>${fmt(ticketAtualT)}</b> — pouca resistência a gastar`); }
    else if (ticketAntT > 0) sinaisTermo.push(`🟡 Ticket médio: ${fmt(ticketAntT)} → ${fmt(ticketAtualT)}`);

    let vereditoTermo, corTermo, fundoTermo;
    if (pontosTermo >= 5) { vereditoTermo = '🟢 MOMENTO FAVORÁVEL: sua base aguenta um teste de aumento. Comece com +R$ 5 a 10 nos campeões (os que zeraram ou têm encomenda), conte a história da qualidade (concentração premium + 20 dias de maceração) e acompanhe a recompra aqui por 60 dias.'; corTermo = '#15803d'; fundoTermo = '#f0fdf4'; }
    else if (pontosTermo >= 3) { vereditoTermo = '🟡 QUASE LÁ: já existem sinais bons. Teste aumento SÓ nos produtos que zeraram ou têm encomenda, e trabalhe a recorrência dos demais (radar de recompra, aniversários, clientes sumidos).'; corTermo = '#b45309'; fundoTermo = '#fffbeb'; }
    else { vereditoTermo = '🔴 SEGURE O PREÇO: primeiro fortaleça a recorrência (radar de recompra, aniversários, reconquista dos sumidos) — e volte aqui no mês que vem.'; corTermo = '#b91c1c'; fundoTermo = '#fef2f2'; }

    const htmlTermometro = `
        <div class="dash-card" style="grid-column: span 2; padding: 18px; border: 2px solid ${corTermo}; background: ${fundoTermo};">
            <h3 style="color:${corTermo}; font-size:0.9rem; font-weight:900; text-align:center; margin:0 0 4px 0;">🌡️ TERMÔMETRO DE PREÇO</h3>
            <p style="font-size:0.62rem; color:#888; text-align:center; margin:0 0 12px 0;">A base aguenta um aumento? Análise de agora — independe do filtro de mês</p>
            <div style="background:#fff; border:1px solid ${corTermo}; border-radius:10px; padding:12px 14px; font-size:0.78rem; font-weight:800; color:${corTermo}; line-height:1.5; margin-bottom:12px;">${vereditoTermo}</div>
            <div style="font-size:0.72rem; color:#4A4A4A; line-height:2;">${sinaisTermo.map(s => `• ${s}`).join('<br>')}</div>
            <p style="font-size:0.6rem; color:#999; margin:10px 0 0 0; font-style:italic;">Depois de aumentar, a métrica-juíza: as unidades caíram menos do que a margem subiu? Acompanhe aqui por 60 dias.</p>
        </div>`;

    const corLucro = lReal < 0 ? "#b91c1c" : "#15803d";
    const corLucroTotal = tLucroTotal < 0 ? "#b91c1c" : "#7c3aed";
    const margemMedia = tCustoTotal > 0 ? (tLucroTotal / tCustoTotal) * 100 : 0;

    // 🔮 Lucro Projetado do Mês (mesma lógica de ritmo já usada na visão do vendedor, aplicada ao lucro da empresa toda)
    let htmlLucroProjetadoAdmin = "";
    const dataHojeProjAdmin = new Date();
    const eMesAtualAdmin = (parseInt(fM) === dataHojeProjAdmin.getMonth() + 1 && parseInt(fA) === dataHojeProjAdmin.getFullYear());
    if (eMesAtualAdmin) {
        const diasNoMesAdmin = new Date(parseInt(fA), parseInt(fM), 0).getDate();
        const diasPassadosAdmin = dataHojeProjAdmin.getDate();
        let projecaoLucroAdmin = (tLucroTotal / diasPassadosAdmin) * diasNoMesAdmin;
        if (tLucroTotal >= 0 && projecaoLucroAdmin < tLucroTotal) projecaoLucroAdmin = tLucroTotal;
        const corProjAdmin = projecaoLucroAdmin < 0 ? "#b91c1c" : "#15803d";

        htmlLucroProjetadoAdmin = `
        <div class="dash-card" style="grid-column: span 2; padding: 20px; border: 1px solid #c4b5fd; background: #faf5ff;">
            <h3 style="color:#7e22ce; font-size:0.85rem; font-weight:900; text-align:center; margin:0 0 15px 0;">🔮 LUCRO PROJETADO DO MÊS</h3>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="text-align:left;">
                    <span style="font-size:0.65rem; color:#9333ea; font-weight:bold; display:block;">Já Confirmado (${diasPassadosAdmin}/${diasNoMesAdmin} dias)</span>
                    <span style="font-size:1.4rem; color:#7e22ce; font-weight:900;">${fmt(tLucroTotal)}</span>
                </div>
                <div style="font-size:1.5rem; color:#d8b4fe;">👉</div>
                <div style="text-align:right;">
                    <span style="font-size:0.65rem; color:#666; font-weight:bold; display:block;">Se Mantiver o Ritmo</span>
                    <span style="font-size:1.4rem; color:${corProjAdmin}; font-weight:900;">${fmt(projecaoLucroAdmin)}</span>
                </div>
            </div>
            <p style="font-size:0.6rem; color:#a855f7; text-align:center; margin:10px 0 0 0; font-style:italic;">Projeção linear com base no ritmo de vendas, custo e comissão até aqui.</p>
        </div>`;
    }

    // 🔗 CATÁLOGO ONLINE (visão da Diretoria): visitas por vendedor pra medir quem divulga e o alcance geral
    let htmlVisitasCatAdmin = '';
    {
        const vcGeral = estatisticasVisitasCatalogo(null);
        const porVendedorVc = {};
        visitasCatalogoGlobal.forEach(vi => {
            const nomeVi = String(vi.vendedor || '(link geral)').trim();
            if (!porVendedorVc[nomeVi]) porVendedorVc[nomeVi] = true;
        });
        const linhasVc = Object.keys(porVendedorVc)
            .map(nomeVi => ({ nome: nomeVi, ...estatisticasVisitasCatalogo(nomeVi) }))
            .sort((a, b) => b.sete - a.sete || b.total - a.total)
            .map(vLinha => `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #ccfbf1; padding:6px 0;">
                <span style="font-size:0.78rem; font-weight:700; color:#134e4a;">${vLinha.nome === '(link geral)' ? '🌐 Link geral (sem vendedor)' : '👤 ' + vLinha.nome}${vLinha.hoje > 0 ? ` <span style="font-size:0.58rem; color:#0d9488;">· ${vLinha.hoje} hoje</span>` : ''}</span>
                <span style="font-size:0.72rem; color:#0f766e;"><b>${vLinha.sete}</b> em 7d · ${vLinha.total} total${vLinha.ped7 > 0 ? ` · <b style="color:#c2410c;">🛒 ${vLinha.ped7}</b>` : ''}</span>
            </div>`).join('');
        htmlVisitasCatAdmin = `
            <div class="dash-card" style="grid-column: span 2; padding: 15px; background: #f0fdfa; border: 1px solid #99f6e4;">
                <div style="display:flex; justify-content:space-between; align-items:baseline; border-bottom:1px dashed #99f6e4; padding-bottom:6px; margin-bottom:8px;">
                    <h3 style="color:#0f766e; font-size:0.8rem; font-weight:900; margin:0;">🔗 CATÁLOGO ONLINE — ALCANCE DA EQUIPE</h3>
                    <span style="font-size:0.7rem; color:#0d9488; font-weight:800;">${vcGeral.sete} visitas · 7d</span>
                </div>
                ${linhasVc || `<p style="font-size:0.72rem; color:#5eead4; text-align:center; margin:8px 0;">Nenhuma visita registrada ainda — peça pra equipe divulgar os links! 📣</p>`}
                ${linhasVc ? `<p style="font-size:0.6rem; color:#0d9488; margin:8px 0 0 0; text-align:center; font-style:italic;">🔍 Funil 7 dias: ${vcGeral.sete} visitas → 🛒 ${vcGeral.ped7} pedidos${vcGeral.sete > 0 ? ` (${((vcGeral.ped7 / vcGeral.sete) * 100).toFixed(0)}% de conversão)` : ''} · Total histórico: ${vcGeral.total} visitas</p>` : ''}
            </div>`;
    }

    container.innerHTML = `
        <div class="dash-grid">
            <div class="dash-card highlight" style="grid-column: span 2; padding: 20px; text-align: center; border-radius: 12px;">
                <h3 style="color: #e8dde1; font-size: 0.8rem; font-weight: 700; margin: 0 0 10px 0;">👑 PATRIMÔNIO NOVERA</h3>
                <p class="valor" style="font-size: 2.2rem; color: #fff; margin: 0;">${fmt(patrimonio)}</p>
                <p style="font-size: 0.7rem; color: #e8dde1; margin: 5px 0 0 0; opacity: 0.8;">Caixa + Estoque Físico + A Receber</p>
            </div>
            
            <div class="dash-card" style="grid-column: span 2; padding: 15px; border-left: 5px solid ${corLucro}; background: #fafafa;">
                <h3 style="color:#666; font-size:0.75rem; margin:0 0 5px 0;">DINHEIRO LIMPO (CAIXA REAL)</h3>
                <p style="font-size:1.8rem; font-weight:900; color:${corLucro}; margin:0;" id="d-lucro-real">${fmt(lReal)}</p>
                <p style="font-size:0.65rem; color:#888; margin-top:3px;">Entradas Pagas - Gastos Totais da Empresa</p>
            </div>

            <div class="dash-card" style="grid-column: span 2; padding: 15px; border-left: 5px solid ${corLucroTotal}; background: #fafafa;">
                <h3 style="color:#666; font-size:0.75rem; margin:0 0 5px 0;">LUCRO LÍQUIDO (MARGEM DO PERÍODO)</h3>
                <p style="font-size:1.8rem; font-weight:900; color:${corLucroTotal}; margin:0;">${fmt(tLucroTotal)}</p>
                <p style="font-size:0.65rem; color:#888; margin-top:3px;">Venda − Custo − Comissão, já incluindo Fiado ainda não pago</p>
            </div>

            <div class="dash-card" style="padding: 15px; border-left: 5px solid #7c3aed; background: #fafafa;">
                <h3 style="color:#666; font-size:0.65rem; margin:0 0 5px 0;">MARGEM MÉDIA DO PERÍODO</h3>
                <p style="font-size:1.2rem; font-weight:900; color:#7c3aed; margin:0;">${margemMedia.toFixed(1)}%</p>
                <p style="font-size:0.6rem; color:#888; margin-top:3px;">Lucro sobre o custo dos produtos</p>
            </div>
            <div class="dash-card" style="padding: 15px; border-left: 5px solid #c2410c; background: #fafafa;">
                <h3 style="color:#666; font-size:0.65rem; margin:0 0 5px 0;">🔥 BÔNUS DE COMISSÃO PAGO</h3>
                <p style="font-size:1.2rem; font-weight:900; color:#c2410c; margin:0;">${fmt(tBonusPago)}</p>
                <p style="font-size:0.6rem; color:#888; margin-top:3px;">Custo do incentivo de Estoque Parado no período</p>
            </div>

            ${htmlVisitasCatAdmin}

            <div class="dash-card" style="grid-column: span 2; padding: 15px; display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0;">
                <div>
                    <h3 style="color:#166534; font-size:0.75rem; margin:0 0 5px 0;">📦 ESTOQUE ATUAL FÍSICO</h3>
                    <p style="font-size:1.2rem; font-weight:900; color:#166534; margin:0;" id="d-estoque-itens">${estItens} un</p>
                </div>
                <div style="text-align:right;">
                    <h3 style="color:#166534; font-size:0.75rem; margin:0 0 5px 0;">VALOR VAREJO DO ESTOQUE</h3>
                    <p style="font-size:1.2rem; font-weight:900; color:#166534; margin:0;" id="d-estoque-valor">${fmt(estValor)}</p>
                </div>
            </div>

            <div class="dash-card highlight" style="grid-column: span 2; padding: 20px; text-align: center; border-radius: 12px; background: linear-gradient(135deg, #0369a1, #0284c7);">
                <h3 style="color: #e0f2fe; font-size: 0.8rem; font-weight: 700; margin: 0 0 10px 0;">TOTAL VENDIDO NO PERÍODO</h3>
                <p class="valor" style="font-size: 2.2rem; color: #fff; margin: 0;">${fmt(tVendasTotais)}</p>
                <p style="font-size: 0.75rem; color: #bae6fd; margin: 5px 0 0 0;">(Soma de Entradas + A Receber)</p>
                <div style="margin-top: 10px; background: rgba(255,255,255,0.1); display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; color: #fff; font-weight: bold;">
                    ${crescimentoAdminIcon} ${crescimentoAdminTxt} (Anterior: ${fmt(pVen)})
                </div>
            </div>

            ${htmlLucroProjetadoAdmin}

            <div class="dash-card" style="padding: 15px; border-left: 5px solid #2e7d32;">
                <h3 style="color:#666; font-size:0.65rem; margin:0 0 5px 0;">ENTRADAS (PAGAS)</h3>
                <p style="font-size:1.2rem; font-weight:900; color:#2e7d32; margin:0;" id="d-receitas">${fmt(tRec)}</p>
            </div>
            <div class="dash-card" style="padding: 15px; border-left: 5px solid #c62828;">
                <h3 style="color:#666; font-size:0.65rem; margin:0 0 5px 0;">SAÍDAS (GASTOS)</h3>
                <p style="font-size:1.2rem; font-weight:900; color:#c62828; margin:0;" id="d-gastos">${fmt(tGas)}</p>
            </div>
            <div class="dash-card" style="padding: 15px; border-left: 5px solid #f59e0b;">
                <h3 style="color:#666; font-size:0.65rem; margin:0 0 5px 0;">A RECEBER (FIADO)</h3>
                <p style="font-size:1.2rem; font-weight:900; color:#b45309; margin:0;" id="d-receber">${fmt(tPend)}</p>
            </div>
            <div class="dash-card" style="padding: 15px; border-left: 5px solid #0284c7; background: #f0f9ff;">
                <h3 style="color:#0369a1; font-size:0.65rem; margin:0 0 5px 0;">TICKET MÉDIO</h3>
                <p style="font-size:1.2rem; font-weight:900; color:#0284c7; margin:0;">${fmt(ticketMedio)}</p>
                <p style="font-size:0.6rem; color:#0284c7; margin-top:3px; opacity:0.8;">Baseado em ${pedidosIdSet.size} pedidos</p>
            </div>

            ${htmlRanking}

            <div class="dash-card" style="grid-column: span 2; padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">⚖️ COMPARATIVO (${fM}/${fA} vs ${prevM_str}/${prevA_int})</h3>
                <div style="position: relative; height: 230px; width: 100%;">
                    <canvas id="chartCompMes"></canvas>
                </div>
            </div>
            
            <div class="dash-card" style="grid-column: span 2; padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">📅 HISTÓRICO ANUAL (${fA})</h3>
                <div style="position: relative; height: 250px; width: 100%;">
                    <canvas id="chartHistAnual"></canvas>
                </div>
            </div>

            <div class="dash-card" style="grid-column: span 2; padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">📈 CURVA DE FATURAMENTO DIÁRIO 👆</h3>
                <p style="font-size:0.6rem; color:#888; margin-top:-5px; margin-bottom:10px;">(Vendas realizadas no dia, pago ou fiado)</p>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chartFatDiario"></canvas>
                </div>
            </div>

            <div class="dash-card" style="grid-column: span 2; padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">📉 CURVA DE RECEBIMENTOS DIÁRIOS 👆</h3>
                <p style="font-size:0.6rem; color:#15803d; font-weight:bold; margin-top:-5px; margin-bottom:10px;">(Dinheiro que efetivamente entrou no Caixa a cada dia)</p>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chartRecDiario"></canvas>
                </div>
            </div>

            <div class="dash-card" style="padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">🏅 FORÇA DE VENDAS 👆</h3>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chartForcaVendas"></canvas>
                </div>
            </div>
            <div class="dash-card" style="padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">🍩 MIX DE PRODUTOS 👆</h3>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chartMixProd"></canvas>
                </div>
            </div>

            <div class="dash-card" style="grid-column: span 2; padding:15px; background:#fef2f2; border:1px solid #fecaca;">
                <h3 style="color:#b91c1c; font-size:0.8rem; border-bottom:1px solid #fca5a5; padding-bottom:5px; margin-bottom:10px;">🚨 TOP 5 DEVEDORES DO PERÍODO 👆</h3>
                <p style="font-size:0.6rem; color:#b91c1c; margin-top:-5px; margin-bottom:10px;">(Clique no nome para ir cobrar)</p>
                <div style="margin-bottom: 15px;">${listaDevedores}</div>
            </div>

            <div class="dash-card" style="padding:15px;">
                <h3 style="color:var(--primary-dark); font-size:0.75rem; border-bottom:1px solid #E8DDE1; padding-bottom:5px; margin-bottom:10px;">⭐ TOP 5 PRODUTOS</h3>
                <div id="d-ranking-produtos">${listaProd}</div>
            </div>
            <div class="dash-card" style="padding:15px;">
                <h3 style="color:#b45309; font-size:0.75rem; border-bottom:1px solid #fde047; padding-bottom:5px; margin-bottom:10px;">👑 TOP 5 CLIENTES</h3>
                <div id="d-ranking-clientes">${listaCli}</div>
            </div>

            <div class="dash-card" style="padding:15px;">
                <h3 style="color:#b91c1c; font-size:0.75rem; border-bottom:1px solid #fecaca; padding-bottom:5px; margin-bottom:10px;">🐢 5 QUE MENOS SAEM (C/ ESTOQUE)</h3>
                <div id="d-ranking-encalhados">${listaEncalhados}</div>
                <p style="font-size:0.6rem; color:#999; margin:8px 0 0 0; font-style:italic;">Vendas no período × quanto sobra no estoque.</p>
            </div>
            <div class="dash-card" style="padding:15px;">
                <h3 style="color:#6b7280; font-size:0.75rem; border-bottom:1px solid #e5e7eb; padding-bottom:5px; margin-bottom:10px;">👻 5 CLIENTES QUE MENOS COMPRAM</h3>
                <div id="d-ranking-clientes-fracos">${listaCliFracos}</div>
                <p style="font-size:0.6rem; color:#999; margin:8px 0 0 0; font-style:italic;">Entre quem comprou algo no período.</p>
            </div>

            <div class="dash-card" style="grid-column: span 2; padding:15px; background:#fffbeb; border:1px solid #fde68a;">
                <h3 style="color:#b45309; font-size:0.8rem; border-bottom:1px solid #fde68a; padding-bottom:5px; margin-bottom:10px;">⏳ PREVISÃO DE RUPTURA (RITMO DOS ÚLTIMOS 30 DIAS)</h3>
                <div id="d-ranking-ruptura">${listaRuptura}</div>
                <p style="font-size:0.6rem; color:#b45309; margin:8px 0 0 0; font-style:italic;">🚨 = menos de 20 dias. Lembre do tempo de maceração: o momento de produzir é AGORA, não quando zerar!</p>
            </div>

            <div class="dash-card" style="grid-column: span 2; padding:15px; background:#faf5ff; border:1px solid #ddd6fe;">
                <h3 style="color:#7c3aed; font-size:0.8rem; border-bottom:1px solid #ddd6fe; padding-bottom:5px; margin-bottom:10px;">🕵️ CLIENTES SUMIDOS (45+ DIAS SEM COMPRAR)${totalSumidos > 8 ? ` — ${totalSumidos} NO TOTAL` : ''}</h3>
                <div id="d-ranking-sumidos">${listaSumidos}</div>
                <p style="font-size:0.6rem; color:#a78bfa; margin:8px 0 0 0; font-style:italic;">Quem mais gastava aparece primeiro — são os melhores para chamar de volta. Vale para o histórico todo, independente do mês filtrado.</p>
            </div>

            ${htmlTermometro}

            <div class="dash-card" style="padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">📈 CAIXA VS GASTOS 👆</h3>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chartReceitasGastos"></canvas>
                </div>
            </div>
            <div class="dash-card" style="padding: 15px;">
                <h3 style="color:#666; font-size:0.75rem; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:10px;">📊 STATUS VENDAS 👆</h3>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chartStatusVendas"></canvas>
                </div>
            </div>
            
            <div id="d-patrimonio" style="display:none;">${fmt(patrimonio)}</div>
            <div id="d-lucro-projetado" style="display:none;">${fmt(tLucroTotal)}</div>
        </div>
    `;

    if (typeof Chart !== 'undefined') { 
        if (window.gFatDiario) window.gFatDiario.destroy();
        if (window.gRecDiario) window.gRecDiario.destroy(); 
        if (window.gForcaVendas) window.gForcaVendas.destroy();
        if (window.gMixProd) window.gMixProd.destroy();
        if (window.gReceitasGastos) window.gReceitasGastos.destroy();
        if (window.gStatusVendas) window.gStatusVendas.destroy();
        if (window.gHistAnual) window.gHistAnual.destroy();
        if (window.gCompMes) window.gCompMes.destroy();
        
        const exibirDetalhesGrafico = (titulo, arrayDados, tipoModal = 'vendas') => {
            let html = arrayDados.map(item => {
                if(tipoModal === 'vendas') {
                    return `
                    <div style="border-bottom:1px dashed #e5e7eb; padding:10px 0;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <b style="color:var(--brand-dark);">${item.qtd}x ${item.produto}</b>
                            <b style="color:#15803d;">${safeFmt(item.valor_venda)}</b>
                        </div>
                        <div style="font-size:0.7rem; color:#64748b;">👤 Cli: ${item.cliente} | 👔 Vend: ${item.socio} | 📊 ${item.status}</div>
                    </div>`;
                } else {
                    return `
                    <div style="border-bottom:1px dashed #e5e7eb; padding:10px 0;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <b style="color:var(--brand-dark);">${item.item}</b>
                            <b style="color:#b91c1c;">${safeFmt(item.total)}</b>
                        </div>
                        <div style="font-size:0.7rem; color:#64748b;">📍 Loc: ${item.local} | 👤 Por: ${item.socio} | 📅 ${item.dataDisplay || item.dataIso}</div>
                    </div>`;
                }
            }).join('');
            document.getElementById('titulo-detalhes-chart').innerText = titulo;
            document.getElementById('conteudo-detalhes-chart').innerHTML = html || '<p>Sem dados registrados.</p>';
            document.getElementById('modal-detalhes-chart').style.display = 'flex';
        };

        const ctxHist = document.getElementById('chartHistAnual').getContext('2d');
        window.gHistAnual = new Chart(ctxHist, {
            type: 'line',
            data: { 
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], 
                datasets: [
                    { label: 'Vendido (Geral)', data: histVendas, borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)', fill: true, tension: 0.3 },
                    { label: 'Recebido (Caixa)', data: histRec, borderColor: '#15803d', backgroundColor: 'rgba(21, 128, 61, 0.1)', fill: true, tension: 0.3 },
                    { label: 'Gastos', data: histGastos, borderColor: '#b91c1c', backgroundColor: 'rgba(185, 28, 28, 0.1)', fill: true, tension: 0.3 }
                ] 
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }, scales: { y: { beginAtZero: true } } }
        });

        const ctxComp = document.getElementById('chartCompMes').getContext('2d');
        window.gCompMes = new Chart(ctxComp, {
            type: 'bar',
            data: { 
                labels: ['Vendas (Totais)', 'Entrou (Caixa)', 'Gastos', 'Lucro Projetado'], 
                datasets: [
                    { label: `Anterior (${prevM_str}/${prevA_int})`, data: [pVen, pRec, pGas, pLuc], backgroundColor: '#94a3b8', borderRadius: 4 },
                    { label: `Atual (${fM}/${fA})`, data: [cVen, cRec, cGas, cLuc], backgroundColor: '#b45309', borderRadius: 4 }
                ] 
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12 } } } }
        });

        const ctxFat = document.getElementById('chartFatDiario').getContext('2d');
        let diasOrdenados = Object.keys(faturamentoPorDia).sort();
        let valoresDiarios = diasOrdenados.map(d => faturamentoPorDia[d]);
        window.gFatDiario = new Chart(ctxFat, {
            type: 'line',
            data: { labels: diasOrdenados.map(d => `Dia ${d}`), datasets: [{ label: 'Faturamento', data: valoresDiarios, borderColor: '#0369a1', backgroundColor: 'rgba(3, 105, 161, 0.2)', fill: true, tension: 0.4 }] },
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } },
                onClick: (e, activeEls) => {
                    if(activeEls.length > 0) {
                        const diaSelect = diasOrdenados[activeEls[0].index];
                        let venDoDia = vDashGlobal.filter(v => v.dataVendaIso && v.dataVendaIso.split('-')[2] == diaSelect && v.status !== 'Presente');
                        exibirDetalhesGrafico(`Faturamento do Dia ${diaSelect}`, venDoDia, 'vendas');
                    }
                }
            }
        });

        const ctxRec = document.getElementById('chartRecDiario').getContext('2d');
        let diasRecOrd = Object.keys(recebimentosPorDia).sort();
        let valRecDiarios = diasRecOrd.map(d => recebimentosPorDia[d]);
        window.gRecDiario = new Chart(ctxRec, {
            type: 'line',
            data: { labels: diasRecOrd.map(d => `Dia ${d}`), datasets: [{ label: 'Recebido', data: valRecDiarios, borderColor: '#15803d', backgroundColor: 'rgba(21, 128, 61, 0.2)', fill: true, tension: 0.4 }] },
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } },
                onClick: (e, activeEls) => {
                    if(activeEls.length > 0) {
                        const diaSelect = diasRecOrd[activeEls[0].index];
                        let recDoDia = vSocioGlobal.filter(v => v.status === 'Pago' && v.dataPgtoDisplay && v.dataPgtoDisplay.startsWith(`${diaSelect}/${fM}/${fA}`));
                        exibirDetalhesGrafico(`Recebimentos do Dia ${diaSelect}`, recDoDia, 'vendas');
                    }
                }
            }
        });

        const ctxForca = document.getElementById('chartForcaVendas').getContext('2d');
        window.gForcaVendas = new Chart(ctxForca, {
            type: 'bar',
            data: { labels: rankingArr.map(r => r.nome), datasets: [{ label: 'Total Vendido', data: rankingArr.map(r => r.total), backgroundColor: '#b45309', borderRadius: 4 }] },
            options: { 
                indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                onClick: (e, activeEls) => {
                    if(activeEls.length > 0) {
                        const vendedorSel = rankingArr[activeEls[0].index].nome;
                        let venVend = vDashGlobal.filter(v => String(v.socio).trim() === vendedorSel && v.status !== 'Presente');
                        exibirDetalhesGrafico(`Vendas: ${vendedorSel}`, venVend, 'vendas');
                    }
                }
            }
        });

        const ctxMix = document.getElementById('chartMixProd').getContext('2d');
        const chavesMix = Object.keys(mixProdutos);
        window.gMixProd = new Chart(ctxMix, {
            type: 'doughnut',
            data: { labels: chavesMix, datasets: [{ data: Object.values(mixProdutos), backgroundColor: ['#be185d', '#0369a1', '#166534', '#b45309', '#7c3aed', '#4b5563', '#1e40af'], borderWidth: 0 }] },
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 9 } } } },
                onClick: (e, activeEls) => {
                    if(activeEls.length > 0) {
                        const catSel = chavesMix[activeEls[0].index];
                        exibirDetalhesGrafico(`Saídas de ${catSel}`, mixProdutosDetalhes[catSel], 'vendas');
                    }
                }
            }
        });

        const ctxRG = document.getElementById('chartReceitasGastos').getContext('2d'); 
        window.gReceitasGastos = new Chart(ctxRG, { 
            type: 'bar', 
            data: { labels: ['Caixa Real', 'Gastos'], datasets: [{ label: 'Valor', data: [tRec, tGas], backgroundColor: ['#15803d', '#b91c1c'], borderRadius: 6 }] }, 
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                onClick: (e, activeEls) => {
                    if(activeEls.length > 0) {
                        if(activeEls[0].index === 0) {
                            let vPagas = vDashGlobal.filter(v => v.status === 'Pago');
                            exibirDetalhesGrafico(`Entradas Reais (Pagas)`, vPagas, 'vendas');
                        } else {
                            exibirDetalhesGrafico(`Histórico de Gastos`, gDashGlobal, 'gastos');
                        }
                    }
                }
            } 
        }); 
        
        const ctxSt = document.getElementById('chartStatusVendas').getContext('2d'); 
        window.gStatusVendas = new Chart(ctxSt, { 
            type: 'doughnut', 
            data: { labels: ['Pago', 'Fiado'], datasets: [{ data: [tRec, tPend], backgroundColor: ['#15803d', '#f59e0b'], borderWidth: 0 }] }, 
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
                onClick: (e, activeEls) => {
                    if(activeEls.length > 0) {
                        if(activeEls[0].index === 0) { 
                            let vPagas = vDashGlobal.filter(v => v.status === 'Pago');
                            exibirDetalhesGrafico(`Pedidos Pagos`, vPagas, 'vendas');
                        } else { 
                            let vFiado = vDashGlobal.filter(v => v.status === 'Pendente' || v.status === 'Parcelado');
                            exibirDetalhesGrafico(`Pedidos no Fiado`, vFiado, 'vendas');
                        }
                    }
                }
            } 
        }); 
    }
}

// 🖨️ CAIXINHAS 3D — três jeitos de lançar: −/+ (fino), ✔ (completa o lote) e toque no número (digita exato)
function enviarCaixasProducao(p, corpo) {
    fetch(API_NOVERA, { method: 'POST', headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: 'atualizar_caixas_producao', linha: p.linha, ...corpo }) })
        .then(r => r.json())
        .then(res => {
            // Se o banco tiver um número diferente (ex: dois aparelhos mexendo), a verdade do banco vence
            if (res && res.sucesso && typeof res.caixas === 'number' && res.caixas !== (parseInt(p.caixas_prontas) || 0)) {
                p.caixas_prontas = res.caixas;
                renderizarProducao();
            }
        })
        .catch(() => { /* sem stress: a próxima sincronização acerta o número */ });
}

function ajustarCaixasProducao(linha, delta) {
    const p = producaoGlobal.find(x => x.linha == linha);
    if (!p) return;
    const atual = parseInt(p.caixas_prontas) || 0;
    if (delta < 0 && atual <= 0) return;
    p.caixas_prontas = Math.max(0, atual + delta);
    renderizarProducao();
    enviarCaixasProducao(p, { delta: delta });
}

function definirCaixasProducao(linha, valor) {
    const p = producaoGlobal.find(x => x.linha == linha);
    if (!p) return;
    p.caixas_prontas = Math.max(0, parseInt(valor) || 0);
    renderizarProducao();
    enviarCaixasProducao(p, { definir: p.caixas_prontas });
}

async function digitarCaixasProducao(linha) {
    const p = producaoGlobal.find(x => x.linha == linha);
    if (!p) return;
    const resposta = await pedirNomeDocumento(String(parseInt(p.caixas_prontas) || 0), `🖨️ Quantas caixinhas prontas de ${p.nome_produto}?`);
    if (resposta === null) return;
    const n = parseInt(String(resposta).replace(/\D/g, ''));
    if (isNaN(n)) return mostrarAlerta("Aviso", "Digite só o número de caixinhas. Ex: 15", "warning");
    definirCaixasProducao(linha, n);
}

// ==========================================
// ✨ FICHA OLFATIVA COM IA (Gemini)
// A IA sugere dentro de um molde rígido (JSON, tamanhos limitados, tom de perfumaria,
// sem alegação medicinal) e o Admin revisa/edita antes de salvar. Enriquece o catálogo PDF.
// ==========================================
function lerFichaDoRotulo(r) {
    try { const f = JSON.parse(r.ficha || 'null'); return (f && typeof f === 'object') ? f : null; } catch (e) { return null; }
}

async function gerarFichaComIA(essencia, genero) {
    const chave = localStorage.getItem('novera_ai_key');
    if (!chave) { const e = new Error('SEM_CHAVE'); e.semChave = true; throw e; }
    const prompt = `Você é um redator de alta perfumaria brasileiro. Crie a ficha olfativa de um perfume artesanal inspirado em "${essencia}" (gênero olfativo: ${genero || 'Unissex'}).
Responda APENAS um JSON válido, sem markdown, exatamente neste formato:
{"descricao":"1 a 2 frases sedutoras, máximo 160 caracteres","notas_saida":"2 a 3 notas separadas por vírgula","notas_coracao":"2 a 3 notas separadas por vírgula","notas_fundo":"2 a 3 notas separadas por vírgula","familia":"1 a 2 famílias olfativas separadas por ' · ', escolhidas SOMENTE entre: Amadeirado, Cítrico, Doce, Floral, Frutal, Oriental, Fresco, Aromático, Especiado","ocasioes":"2 a 4 ocasiões de uso separadas por ' · ', máximo 90 caracteres","dica":"1 frase de dica de aplicação, máximo 120 caracteres","ingredientes":"lista curta e genérica de ingredientes cosméticos, máximo 140 caracteres"}
Regras: português do Brasil; tom elegante e comercial; notas coerentes com o perfil olfativo do perfume que inspirou; NÃO cite o nome da marca original na descrição; NÃO faça alegações medicinais.
IMPORTANTE sobre as ocasiões: use situações REAIS e populares do dia a dia do brasileiro, concretas e diretas (exemplos bons: Trabalho, Dia a dia, Balada, Encontro, Igreja, Festa de família, Fim de semana, Academia, Sair à noite). PROIBIDO usar clichês chiques como "eventos de gala", "noites sofisticadas", "jantares elegantes", "encontros marcantes" — a cliente precisa se enxergar na ocasião.`;

    const modelos = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let ultimoErro = null;
    for (const modelo of modelos) {
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${chave}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, responseMimeType: 'application/json' } })
            });
            if (resp.status === 404) continue; // modelo indisponível nessa conta: tenta o próximo
            const dados = await resp.json();
            if (!resp.ok) { ultimoErro = new Error((dados.error && dados.error.message) || `HTTP ${resp.status}`); continue; }
            const texto = dados.candidates && dados.candidates[0] && dados.candidates[0].content && dados.candidates[0].content.parts[0].text;
            const ficha = JSON.parse(String(texto).replace(/```json|```/g, '').trim());
            if (!ficha.descricao) throw new Error('Resposta sem descrição');
            return ficha;
        } catch (e) { ultimoErro = e; }
    }
    throw ultimoErro || new Error('Falha na IA');
}

function abrirFichaOlfativa(linha) {
    const r = rotulosGlobal.find(x => x.linha == linha);
    if (!r) return;
    document.getElementById('fo-linha').value = linha;
    document.getElementById('fo-titulo').innerText = `${r.codigo || ''} — Inspiração: ${r.essencia} (${r.genero || 'Unissex'})`;
    const f = lerFichaDoRotulo(r) || {};
    document.getElementById('fo-descricao').value = f.descricao || '';
    document.getElementById('fo-saida').value = f.notas_saida || '';
    document.getElementById('fo-coracao').value = f.notas_coracao || '';
    document.getElementById('fo-fundo').value = f.notas_fundo || '';
    document.getElementById('fo-familia').value = f.familia || '';
    document.getElementById('fo-ocasioes').value = f.ocasioes || '';
    document.getElementById('fo-dica').value = f.dica || '';
    document.getElementById('fo-ingredientes').value = f.ingredientes || '';
    document.getElementById('modal-ficha-olfativa').style.display = 'flex';
}

async function gerarFichaIAModal() {
    const linha = document.getElementById('fo-linha').value;
    const r = rotulosGlobal.find(x => x.linha == linha);
    if (!r) return;
    const btn = document.getElementById('btn-gerar-ficha-ia');
    btn.disabled = true; btn.innerText = '✨ Criando a ficha... (uns segundinhos)';
    try {
        const f = await gerarFichaComIA(r.essencia, r.genero);
        document.getElementById('fo-descricao').value = f.descricao || '';
        document.getElementById('fo-saida').value = f.notas_saida || '';
        document.getElementById('fo-coracao').value = f.notas_coracao || '';
        document.getElementById('fo-fundo').value = f.notas_fundo || '';
        document.getElementById('fo-familia').value = f.familia || '';
        document.getElementById('fo-ocasioes').value = f.ocasioes || '';
        document.getElementById('fo-dica').value = f.dica || '';
        document.getElementById('fo-ingredientes').value = f.ingredientes || '';
    } catch (e) {
        if (e.semChave) mostrarAlerta("Falta a chave da IA", "Crie sua chave gratuita em aistudio.google.com/apikey e cole no campo 'Chave Gemini API' (⚙️ Ajustes).", "warning");
        else mostrarAlerta("Erro na IA", e.message || "Falha ao gerar. Tente de novo.", "error");
    } finally {
        btn.disabled = false; btn.innerText = '✨ Gerar com IA (você revisa antes de salvar)';
    }
}

function salvarFichaOlfativa() {
    const linha = document.getElementById('fo-linha').value;
    const r = rotulosGlobal.find(x => x.linha == linha);
    if (!r) return;
    const ficha = {
        descricao: document.getElementById('fo-descricao').value.trim(),
        notas_saida: document.getElementById('fo-saida').value.trim(),
        notas_coracao: document.getElementById('fo-coracao').value.trim(),
        notas_fundo: document.getElementById('fo-fundo').value.trim(),
        familia: document.getElementById('fo-familia').value.trim(),
        ocasioes: document.getElementById('fo-ocasioes').value.trim(),
        dica: document.getElementById('fo-dica').value.trim(),
        ingredientes: document.getElementById('fo-ingredientes').value.trim()
    };
    mostrarLoading("Salvando ficha...");
    fetch(API_NOVERA, { method: 'POST', headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: 'salvar_ficha_rotulo', linha: linha, ficha: JSON.stringify(ficha), log_detalhe: `✨ Ficha olfativa de [${r.codigo}] ${r.essencia}` }) })
        .then(res => res.json())
        .then(res => {
            if (res.sucesso) {
                r.ficha = JSON.stringify(ficha); // atualiza local na hora
                renderizarRotulos();
                document.getElementById('modal-ficha-olfativa').style.display = 'none';
                mostrarAlerta("Salvo!", "Ficha olfativa guardada. Ela já entra no próximo catálogo PDF!", "success");
            } else mostrarAlerta("Erro", res.erro || "Falha ao salvar.", "error");
        })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
}

// Gera em série todas as fichas que ainda não existem (com pausa entre chamadas pra respeitar a IA)
async function gerarFichasEmFalta() {
    const semFicha = rotulosGlobal.filter(r => !lerFichaDoRotulo(r));
    if (!semFicha.length) return mostrarAlerta("Tudo pronto!", "Todas as essências já têm ficha olfativa. ✨", "success");
    if (!localStorage.getItem('novera_ai_key')) return mostrarAlerta("Falta a chave da IA", "Crie sua chave gratuita em aistudio.google.com/apikey e cole no campo 'Chave Gemini API' (⚙️ Ajustes).", "warning");

    abrirConfirmacao("Gerar Fichas com IA?", `${semFicha.length} essência(s) sem ficha. A IA vai criar uma por uma (~${Math.ceil(semFicha.length * 3 / 60) || 1} min). Você pode revisar cada uma depois no botão ✨.`, "✨", "#4285f4", "#2b5cb8", "✨ Gerar Todas", async () => {
        let feitas = 0; const falhas = [];
        for (let i = 0; i < semFicha.length; i++) {
            const r = semFicha[i];
            mostrarLoading(`✨ Criando ficha ${i + 1} de ${semFicha.length}: ${r.essencia}...`);
            try {
                const f = await gerarFichaComIA(r.essencia, r.genero);
                const fichaStr = JSON.stringify(f);
                const resp = await fetch(API_NOVERA, { method: 'POST', headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: 'salvar_ficha_rotulo', linha: r.linha, ficha: fichaStr, log_detalhe: `✨ Ficha olfativa (IA em lote) de [${r.codigo}] ${r.essencia}` }) }).then(x => x.json());
                if (resp.sucesso) { r.ficha = fichaStr; feitas++; } else falhas.push(r.essencia);
            } catch (e) { falhas.push(r.essencia); }
            await new Promise(res => setTimeout(res, 1500)); // respiro entre chamadas (limite da IA gratuita)
        }
        ocultarLoading();
        renderizarRotulos();
        const txtFalhas = falhas.length ? ` ⚠️ Falharam ${falhas.length}: ${falhas.slice(0, 4).join(', ')}${falhas.length > 4 ? '...' : ''} — tente essas de novo individualmente.` : '';
        mostrarAlerta(feitas ? "Fichas prontas! ✨" : "Ops", `${feitas} ficha(s) criada(s).${txtFalhas}`, feitas ? "success" : "error");
    });
}

function abrirModalRelatorios() { document.getElementById('modal-relatorios').style.display = 'flex'; }
function exportarExcel() { const dMes = document.getElementById('d-filtro-mes').value; const dAno = document.getElementById('d-filtro-ano').value; let pfx = dAno && dMes ? `${dAno}-${dMes}` : dAno; const vDash = vendasGlobal.filter(v => pfx ? (v.dataVendaIso && v.dataVendaIso.startsWith(pfx)) : true); if (vDash.length === 0) return mostrarAlerta("Aviso", "Nenhuma venda neste período.", "warning"); let csvContent = "data:text/csv;charset=utf-8,Data,Cliente,Produto,Socio,Quantidade,Valor,Status,Custo Und,Custo Total,Lucro,Markup,Data Pagamento,Observacao\n"; vDash.forEach(v => { let obsLimpa = v.observacao ? v.observacao.replace(/\n/g, ' ').replace(/"/g, '""') : ''; let row = [v.dataVendaDisplay, `"${v.cliente}"`, `"${v.produto}"`, v.socio, v.qtd, `"${v.valor_venda}"`, v.status, `"${v.custo_und}"`, `"${v.custo_total}"`, `"${v.lucro}"`, `"${v.markup}"`, v.dataPgtoDisplay || "", `"${obsLimpa}"`]; csvContent += row.join(",") + "\n"; }); const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `Vendas_Novera_${pfx || 'Tudo'}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); }
function copiarFechamento() { const dMesSel = document.getElementById('d-filtro-mes'); const dMesText = dMesSel.options[dMesSel.selectedIndex].text; const dAno = document.getElementById('d-filtro-ano').value || 'Todo o Período'; let lReal = document.getElementById('d-lucro-real').innerText; let entradas = document.getElementById('d-receitas').innerText; let saidas = document.getElementById('d-gastos').innerText; let aReceber = document.getElementById('d-receber').innerText; let patrimonio = document.getElementById('d-patrimonio').innerText; let txt = `📊 *FECHAMENTO NOVERA SCENT* 📊\n🗓️ Período: ${dMesText} ${dAno}\n\n👑 *Patrimônio Total:* ${patrimonio}\n\n📈 *Entradas (Pagas):* ${entradas}\n📉 *Saídas (Gastos):* ${saidas}\n⏳ *A Receber (Fiado):* ${aReceber}\n💰 *Caixa Líquido:* ${lReal}\n\n🤝 *Divisão de Lucros Projetada:*\n`; const fM = document.getElementById('d-filtro-mes').value; const fA = document.getElementById('d-filtro-ano').value; let pfx = fA && fM ? `${fA}-${fM}` : fA; const vDash = vendasGlobal.filter(v => pfx ? (v.dataVendaIso && v.dataVendaIso.startsWith(pfx)) : true); let mSoc = {}; vDash.forEach(v => { const luc = parseDinheiro(v.lucro); if (v.socio) mSoc[v.socio] = (mSoc[v.socio] || 0) + luc; }); let sociosText = ""; for (let s in mSoc) { sociosText += `▪️ ${s}: ${fmt(mSoc[s])}\n`; } txt += sociosText || "Nenhum lucro.\n"; txt += `\n✨ _Bora pra cima!_ 🚀`; copiarTextoSeguro(txt).then(() => { mostrarAlerta("Copiado!", "Resumo do fechamento copiado.", "success"); }).catch(err => { mostrarAlerta("Erro", "Falha ao copiar texto.", "error"); }); }

// 🏆 FESTA DE CONQUISTA: quando um troféu NOVO chega na sincronização, abre o modal bonitão.
// A memória de "já vi" fica no aparelho — na primeira vez, marca tudo como visto sem festa
// (senão choveria troféu retroativo na cara da vendedora rsrs).
function verificarNovasConquistasUI() {
    if (!usuarioLogado || !Array.isArray(conquistasGlobal)) return;
    const minhas = conquistasGlobal.filter(c => normalizarNomeBusca(c.usuario) === normalizarNomeBusca(usuarioLogado));
    if (!minhas.length) return;
    const chaveLS = 'novera_conquistas_vistas_' + usuarioLogado.toLowerCase().trim();
    const chaveDe = (c) => `${c.badgeId}|${c.mes || ''}`;
    let vistas = null;
    try { vistas = JSON.parse(localStorage.getItem(chaveLS) || 'null'); } catch (e) { }
    if (!Array.isArray(vistas)) {
        localStorage.setItem(chaveLS, JSON.stringify(minhas.map(chaveDe)));
        return;
    }
    const setVistas = new Set(vistas);
    const novas = minhas.filter(c => !setVistas.has(chaveDe(c)));
    if (!novas.length) return;
    novas.forEach(c => setVistas.add(chaveDe(c)));
    localStorage.setItem(chaveLS, JSON.stringify([...setVistas]));
    mostrarFestaConquista(novas);
}

function mostrarFestaConquista(novas) {
    const antigo = document.getElementById('modal-festa-conquista');
    if (antigo) antigo.remove();
    const chips = novas.map(c => `
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:10px 14px; margin:6px 0; display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.9rem; flex-shrink:0;">${c.emoji || '🏆'}</span>
            <span style="font-weight:800; color:#92400e; font-size:0.85rem; text-align:left;">${c.titulo}</span>
        </div>`).join('');
    const overlay = document.createElement('div');
    overlay.id = 'modal-festa-conquista';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(24,16,32,0.82); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fadeIn 0.3s ease;';
    overlay.innerHTML = `
        <div style="background:linear-gradient(160deg, #ffffff, #fdf5f7); border-radius:24px; max-width:360px; width:100%; padding:28px 22px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.45); font-family:'Montserrat', sans-serif; border:2px solid #fde68a;">
            <div style="font-size:1.4rem; letter-spacing:6px;">🎊 ✨ 🎊</div>
            <div class="fogo-pulso" style="font-size:4rem; display:inline-block; margin:4px 0;">🏆</div>
            <h3 style="margin:6px 0 2px 0; color:#b45309; font-size:1.2rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Conquista Desbloqueada!</h3>
            <p style="margin:0 0 14px 0; color:#966178; font-size:0.8rem; font-weight:700;">Parabéns, ${usuarioLogado}! 👏</p>
            ${chips}
            <p style="margin:12px 0 16px 0; color:#999; font-size:0.7rem; font-style:italic;">Guardado pra sempre na sua 🏛️ Sala de Troféus.</p>
            <button style="width:100%; background:linear-gradient(90deg,#f59e0b,#b45309); color:#fff; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:0.9rem; cursor:pointer; font-family:'Montserrat', sans-serif; text-transform:uppercase; letter-spacing:1px; box-shadow:0 6px 18px rgba(245,158,11,0.4);" onclick="document.getElementById('modal-festa-conquista').remove()">Bora vender mais! 🚀</button>
        </div>`;
    document.body.appendChild(overlay);
}

// 📖 O "porquê" de cada troféu — o critério que a vendedora cumpriu pra ganhar
function descricaoConquista(badgeId) {
    const mapa = {
        itens10: 'Vendeu 10 ou mais itens dentro de um mesmo mês.',
        itens20: 'Vendeu 20 ou mais itens dentro de um mesmo mês. Ritmo acelerado!',
        itens50: 'Vendeu 50 ou mais itens num único mês. Máquina de vendas!',
        vip2k: 'Faturou R$ 2.000 ou mais em vendas dentro de um mesmo mês.',
        streak3: 'Vendeu por 3 dias seguidos, sem quebrar a corrente.',
        streak7: 'Vendeu por 7 dias seguidos. Uma semana inteira de fogo!',
        streak15: 'Vendeu por 15 dias seguidos. Constância de campeã!',
        streak30: 'Vendeu por 30 dias seguidos. Um mês inteiro sem falhar!',
        patente_bronze: 'Alcançou R$ 1.000 vendidos no total da carreira.',
        patente_prata: 'Alcançou R$ 5.000 vendidos no total da carreira.',
        patente_ouro: 'Alcançou R$ 15.000 vendidos no total da carreira.',
        patente_diamante: 'Alcançou R$ 50.000 vendidos no total da carreira. Lenda!',
        coroa_ouro: 'Foi quem mais vendeu na equipe no mês. A número 1! 👑',
        coroa_prata: 'Ficou em 2º lugar em vendas na equipe no mês.',
        coroa_bronze: 'Ficou em 3º lugar em vendas na equipe no mês.',
        mes_sem_fiado: 'Fechou o mês com 5+ vendas e todas recebidas — zero fiado pendente.'
    };
    return mapa[badgeId] || 'Conquista especial da Novera.';
}

// 🏛️ Museu da carreira: modal com a lista detalhada de todos os troféus (o porquê, o dia, o mês)
function abrirModalSalaTrofeus() {
    const antigo = document.getElementById('modal-sala-trofeus');
    if (antigo) antigo.remove();
    const mesesAbrevM = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const minhas = conquistasGlobal
        .filter(c => normalizarNomeBusca(c.usuario) === normalizarNomeBusca(usuarioLogado))
        .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
    if (!minhas.length) return;

    const linhas = minhas.map(c => {
        let quandoTxt = '';
        if (c.data) {
            const [dParte, hParte] = String(c.data).split(' ');
            const pedacos = (dParte || '').split('-');
            if (pedacos.length === 3) quandoTxt = `${pedacos[2]}/${pedacos[1]}/${pedacos[0]}${hParte ? ` às ${hParte.substring(0, 5)}` : ''}`;
        }
        let mesChip = '';
        if (c.mes) {
            const [aM, mM] = c.mes.split('-');
            mesChip = `<span style="background:#fde68a; color:#92400e; padding:2px 8px; border-radius:10px; font-size:0.58rem; font-weight:900;">${mesesAbrevM[parseInt(mM) - 1] || ''}/${String(aM).slice(2)}</span>`;
        } else {
            mesChip = `<span style="background:#e9d5ff; color:#7e22ce; padding:2px 8px; border-radius:10px; font-size:0.58rem; font-weight:900;">CARREIRA</span>`;
        }
        return `
        <div style="display:flex; gap:12px; align-items:flex-start; background:#fffbeb; border:1px solid #fde68a; border-radius:14px; padding:12px 14px; margin-bottom:8px;">
            <span style="font-size:2.1rem; flex-shrink:0; line-height:1;">${c.emoji || '🏆'}</span>
            <div style="flex:1; min-width:0; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
                    <strong style="color:#92400e; font-size:0.85rem;">${c.titulo}</strong>
                    ${mesChip}
                </div>
                <p style="margin:4px 0 0 0; font-size:0.72rem; color:#4A4A4A; line-height:1.4;">${descricaoConquista(c.badgeId)}</p>
                ${quandoTxt ? `<p style="margin:4px 0 0 0; font-size:0.62rem; color:#b45309; font-weight:700;">🗓️ Conquistado em ${quandoTxt}</p>` : ''}
            </div>
        </div>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'modal-sala-trofeus';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(24,16,32,0.82); z-index:99998; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px); animation:fadeIn 0.25s ease;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
        <div style="background:linear-gradient(160deg, #ffffff, #fdf5f7); border-radius:24px; max-width:400px; width:100%; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 25px 60px rgba(0,0,0,0.45); font-family:'Montserrat', sans-serif; border:2px solid #fde68a; overflow:hidden;">
            <div style="padding:20px 20px 12px 20px; text-align:center; position:relative;">
                <button onclick="document.getElementById('modal-sala-trofeus').remove()" style="position:absolute; top:12px; right:14px; background:none; border:none; font-size:1.6rem; color:#b45309; cursor:pointer; line-height:1;">&times;</button>
                <span style="font-size:2.4rem;">🏛️</span>
                <h3 style="margin:4px 0 2px 0; color:#b45309; font-size:1.1rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Minha Sala de Troféus</h3>
                <p style="margin:0; color:#966178; font-size:0.72rem; font-weight:700;">${minhas.length} conquista${minhas.length > 1 ? 's' : ''} de ${usuarioLogado} — cada uma sua pra sempre 💛</p>
            </div>
            <div style="flex:1; overflow-y:auto; padding: 6px 16px 16px 16px;">${linhas}</div>
        </div>`;
    document.body.appendChild(overlay);
}

function fazerLogout(motivo) {
    const limparESair = () => {
        localStorage.removeItem('novera_token'); // Exclui o crachá
        localStorage.removeItem('novera_session_expires');
        localStorage.removeItem('novera_user_cargo');
        localStorage.removeItem('novera_admin_token_original'); // Limpa qualquer sessão de "ver como" pendente
        localStorage.removeItem('novera_admin_user_original');
        localStorage.removeItem('novera_admin_cargo_original');
        dadosCarregados = false;
        window.location.reload();
    };
    if (!motivo) return limparESair();

    // Aviso com a cara da Novera no lugar do alerta genérico do navegador (que expunha o domínio)
    const overlaySair = document.createElement('div');
    overlaySair.style.cssText = 'position:fixed; inset:0; background:rgba(24,16,32,0.8); z-index:100010; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fadeIn 0.25s ease;';
    overlaySair.innerHTML = `
        <div style="background:#fff; border-radius:20px; max-width:340px; width:100%; padding:30px 25px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.4); font-family:'Montserrat', sans-serif;">
            <div style="font-size:3rem; margin-bottom:8px;">🔒</div>
            <h3 style="margin:0 0 8px 0; color:#966178; font-family:'Playfair Display', serif; font-size:1.25rem; letter-spacing:2px; text-transform:uppercase;">Novera Scent</h3>
            <p style="margin:0 0 20px 0; color:#4A4A4A; font-size:0.9rem; line-height:1.5;">${motivo}</p>
            <button id="btn-relogin-novera" style="width:100%; background:#B87C96; color:#fff; border:none; padding:14px; border-radius:12px; font-weight:800; font-size:0.9rem; cursor:pointer; font-family:'Montserrat', sans-serif; text-transform:uppercase; letter-spacing:1px; box-shadow:0 5px 15px rgba(184,124,150,0.35);">🔑 Entrar Novamente</button>
        </div>`;
    document.body.appendChild(overlaySair);
    overlaySair.querySelector('#btn-relogin-novera').onclick = limparESair;
}

function salvarConfiguracoesChaves() {
    const keyGemini = document.getElementById('cfg-ai-key').value.trim();
    const keyImgBB = document.getElementById('cfg-imgbb-key').value.trim();
    const keyOnionSys = document.getElementById('cfg-onionsys-key').value.trim();
    if (keyGemini) localStorage.setItem('novera_ai_key', keyGemini);
    if (keyImgBB) { localStorage.setItem('novera_imgbb_key', keyImgBB); KEY_IMGBB = keyImgBB; }
    if (keyOnionSys) { localStorage.setItem('novera_onionsys_key', keyOnionSys); TOKEN_ONIONSYS = keyOnionSys; }
    mostrarAlerta("Salvo!", "Suas chaves foram gravadas.", "success");
}

async function alterarSenha() {
    const atual = document.getElementById('cfg-senha-atual').value;
    const nova = document.getElementById('cfg-nova-senha').value;
    if (!atual || !nova) return mostrarAlerta("Atenção", "Preencha as senhas.", "warning");

    mostrarLoading("Atualizando Senha...");
    try {
        const res = await fetch(API_NOVERA, {
            method: "POST",
            headers: cabecalhoAuth(),
            body: JSON.stringify({ acao: "alterar_senha", usuario: usuarioLogado, senha_atual: atual, nova_senha: nova })
        });
        const json = await res.json();
        if (json.sucesso) {
            mostrarAlerta("Sucesso", "Senha alterada!", "success");
            document.getElementById('cfg-senha-atual').value = "";
            document.getElementById('cfg-nova-senha').value = "";
        } else {
            mostrarAlerta("Erro", json.erro, "error");
        }
    } catch (e) {
        mostrarAlerta("Erro", "Falha na conexão.", "error");
    } finally {
        ocultarLoading();
    }
}

// ==========================================
// MÓDULO: SINCRONIZAÇÃO FANTASMA (AUTO-SYNC)
// ==========================================
// Detecta se a pessoa está no meio de alguma coisa (modal aberto, digitando, itens marcados).
// Nesses casos o auto-sync PULA a rodada — senão a atualização apaga o que está sendo feito.
function usuarioEstaOcupado() {
    // 1. Algum modal/janela aberto? (edições, confirmações, parâmetros, separação, catálogo...)
    const modais = document.querySelectorAll('[class*="modal-overlay"], [id^="modal-"]');
    for (const m of modais) {
        if (m.style.display && m.style.display !== 'none') return true;
    }
    // 2. Digitando em algum campo de texto?
    const ae = document.activeElement;
    if (ae && (ae.isContentEditable || ((ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA') && !ae.readOnly && !['checkbox', 'radio', 'button', 'submit', 'file'].includes((ae.type || '').toLowerCase())))) return true;
    // 3. Itens marcados na fila de compras (pra lançar em gastos ou excluir em lote)?
    if (document.querySelector('.chk-item-compra-lote:checked')) return true;
    return false;
}

async function sincronizarDadosSilencioso() {
    // 0. Se a pessoa está mexendo em algo, não atualiza agora — tenta de novo no próximo minuto
    if (usuarioEstaOcupado()) {
        const syncElPausa = document.getElementById("sync-status");
        if (syncElPausa) { syncElPausa.innerText = "✏️"; syncElPausa.title = "Atualização pausada enquanto você edita"; }
        return;
    }

    // 1. Mostra a nuvem girando lá no topo, sem bloquear a tela do usuário
    const syncEl = document.getElementById("sync-status");
    if (syncEl) { syncEl.innerText = "🔄"; syncEl.classList.add('spin-anim'); }

    try {
        const token = localStorage.getItem('novera_token');
        if (!token) return; // Se não estiver logado, não faz nada

        // 2. Busca os dados fresquinhos do banco
        const res = await fetch(API_NOVERA + "?acao=listar_tudo&_t=" + new Date().getTime(), {
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (!res.ok) throw new Error("Status API: " + res.status);
        const dados = await res.json();
        
        if (dados.sucesso) {
            rotulosGlobal = dados.rotulos || []; 
            estoqueGlobal = dados.estoque || []; 
            gastosGlobal = dados.gastos || []; 
            vendasGlobal = dados.vendas || []; 
            encomendasGlobal = dados.encomendas || []; 
            comprasGlobal = dados.compras || [];
            producaoGlobal = dados.producao || []; 
            logsGlobal = dados.logs || [];
            usuariosGlobal = dados.usuarios || [];
            bonusComissaoGlobal = dados.bonusComissao || [];
            descontosProdutoGlobal = dados.descontosProduto || [];
            sugestoesProducaoGlobal = dados.sugestoesProducao || [];
            clientesGlobal = dados.clientes || [];
            conquistasGlobal = dados.conquistas || [];
            visitasCatalogoGlobal = dados.visitasCatalogo || [];
            catalogoLinksGlobal = dados.catalogoLinks || [];
            configuracoesGlobais = dados.configuracoes || {};
            aplicarConfiguracoesDinamicas();

            if (typeof renderizarUsuarios === 'function') renderizarUsuarios();
            if (typeof renderizarClientes === 'function') renderizarClientes();
            if (typeof verificarNovasConquistasUI === 'function') verificarNovasConquistasUI();

            // Refaz o agrupamento de estoque com os dados novos
            estoqueAgrupado = {};
            estoqueGlobal.forEach(e => {
                let n = padronizarTexto(e.nome);
                let rotuloBase = rotulosGlobal.find(r => r.codigo === e.codigo);
                let generoEncontrado = rotuloBase && rotuloBase.genero ? String(rotuloBase.genero).trim() : 'Unissex';
                if (generoEncontrado === '') generoEncontrado = 'Unissex';

                if (!estoqueAgrupado[n]) {
                    estoqueAgrupado[n] = { nome: e.nome, tipo: e.tipo, codigo: e.codigo, preco: e.preco, custo: e.custo, foto: e.foto, totalQtd: 0, locais: {}, locaisDatas: {}, genero: generoEncontrado };
                }
                let lExib = e.local ? e.local.trim() : 'Sede';
                let q = parseFloat(e.qtd) || 0;

                if (!estoqueAgrupado[n].locais[lExib]) estoqueAgrupado[n].locais[lExib] = 0;
                estoqueAgrupado[n].locais[lExib] += q;
                estoqueAgrupado[n].totalQtd += q;
                estoqueAgrupado[n].locaisDatas[lExib] = e.dataEntrada || null; // data da última entrada de estoque nesse local específico
            });

            // 3. O SEGREDO: Salvar o que o usuário selecionou no PDV para a atualização não desmanchar
            let pdvProduto = document.getElementById('v-produto') ? document.getElementById('v-produto').value : "";
            let fabProduto = document.getElementById('pr-produto') ? document.getElementById('pr-produto').value : "";

            // Atualiza as telas de fundo
            atualizarDatalistsDinamicos(); 
            renderizarRotulos(); 
            renderizarOpcoesPrecificacao(); 
            renderizarEstoque(); 
            renderizarGastos(); 
            renderizarVendas(); 
            renderizarDashboard(); 
            renderizarEncomendas(); 
            renderizarCompras(); 
            renderizarProducao();
            if(typeof calcularRadarProducao === 'function') calcularRadarProducao();
            if (typeof renderizarEstoqueParado === 'function') renderizarEstoqueParado(); if (typeof renderizarMaceracaoVendedor === 'function') renderizarMaceracaoVendedor(); if (typeof popularDatalistProdutosSugestao === 'function') popularDatalistProdutosSugestao(); if (typeof renderizarMinhasSugestoes === 'function') renderizarMinhasSugestoes(); if (typeof renderizarSugestoesProducaoAdmin === 'function') renderizarSugestoesProducaoAdmin();
            if (document.getElementById('tab-logs').classList.contains('active')) renderizarLogs();

            // 4. Devolve a seleção para a tela de vendas
            if(pdvProduto && document.getElementById('v-produto')) document.getElementById('v-produto').value = pdvProduto;
            if(fabProduto && document.getElementById('pr-produto')) document.getElementById('pr-produto').value = fabProduto;
        }
    } catch (e) { 
        console.error("Auto-sync silencioso falhou:", e);
    } finally {
        // 5. Para de girar a nuvem e dá um OK verde
        if (syncEl) { 
            syncEl.classList.remove('spin-anim'); 
            syncEl.innerText = "✔️"; 
            setTimeout(() => { if (syncEl.innerText === "✔️") syncEl.innerText = "☁️"; }, 3000); 
        }
    }
}

// ==========================================
// MÓDULO: ONBOARDING / TUTORIAL INTELIGENTE
// ==========================================
function verificarTutorialUsuario() {
    // 1. Personaliza o título com o nome da pessoa!
    const tituloEl = document.getElementById('titulo-tutorial-nome');
    if (tituloEl) tituloEl.innerText = `Olá, ${usuarioLogado}!`;

    // 2. Se for o Admin, não precisa ficar pulando o tutorial na tela dele
    if (usuarioCargo === 'Admin') return; 

    // 3. Verifica na memória do celular se essa pessoa já leu o manual
    const jaViu = localStorage.getItem('novera_tutorial_visto_' + usuarioLogado);
    
    if (!jaViu) {
        // Se ela nunca viu, dá 1 segundo de respiro depois do login e joga o manual na tela
        setTimeout(() => {
            document.getElementById('modal-tutorial').style.display = 'flex';
        }, 1000); 
    }
}

function fecharTutorialUsuario() {
    // Grava na memória que a pessoa já leu para não encher o saco dela de novo
    localStorage.setItem('novera_tutorial_visto_' + usuarioLogado, 'sim');
    // E fecha a tela
    document.getElementById('modal-tutorial').style.display = 'none';
}

// ==========================================
// MÓDULO: MAPA DE SEPARAÇÃO EM NUVEM (LOGÍSTICA)
// ==========================================

// ☁️ FUNÇÃO: Salva na NUVEM em tempo real!
function toggleSeparacaoItem(linhaVenda, isChecked) {
    // 1. Atualiza na memória local na mesma hora para não piscar a tela
    let vendaEncontrada = vendasGlobal.find(v => v.linha === linhaVenda);
    if (vendaEncontrada) vendaEncontrada.separado = isChecked;

    // 2. Manda para a nuvem silenciosamente
    fetch(API_NOVERA, {
        method: 'POST',
        headers: cabecalhoAuth(),
        body: JSON.stringify({ acao: 'alternar_separacao', linha: linhaVenda, status: isChecked })
    }).catch(e => console.error("Erro ao salvar separação na nuvem", e));
}

function abrirMapaSeparacao(modo = 'pendentes') {
    const isAdmin = (usuarioCargo === 'Admin');
    if (!isAdmin) return; 

    let tituloFiltro = "";
    const hoje = new Date();
    const dIsoHoje = hoje.toISOString().split('T')[0];
    
    // 🛡️ Lista VIP de Vendedores
    let nomesVendedoresOficiais = usuariosGlobal.filter(u => u.cargo === 'Vendedor').map(u => String(u.usuario).toLowerCase().trim());

    // Pega as vendas individuais aplicando o filtro inteligente de LOGÍSTICA
    let vendasSeparacao = vendasGlobal.filter(v => {
        let nomeNaVenda = String(v.socio || '').toLowerCase().trim();
        let pEquipe = nomesVendedoresOficiais.includes(nomeNaVenda); // SÓ PASSA SE FOR UM VENDEDOR OFICIAL
        
        // 📦 A MÁGICA LOGÍSTICA COM ANTICORPOS PARA ACENTOS E Ç
        let loc = String(v.local_estoque || 'Sede').toLowerCase().trim();
        
        // Remove os acentos das palavras para o sistema entender que "Cléo" e "Cleo" são a mesma pessoa
        let locLimpo = loc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let nomeLimpo = nomeNaVenda.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let precisaSeparar = false;

        if (locLimpo === 'sede' || locLimpo === '') {
            precisaSeparar = true; // Regra 1: Saiu da sede principal, tem que separar.
        } else if (nomeLimpo !== '' && !locLimpo.includes(nomeLimpo)) {
            precisaSeparar = true; // Regra 2: Retirou de outro lugar que NÃO contém o nome do vendedor.
        }
        // Se chegou aqui e precisaSeparar continuar "false", é porque ela retirou de um local que leva o nome dela (ex: Kamila/Pancho ou Cléo). O item já está com ela!

        let pModo = false;
        if (modo === 'pendentes') {
            pModo = !v.separado; // Limpeza automática: se tiver marcado no banco, não aparece aqui
            tituloFiltro = "Fila Geral de Pendentes";
        } else if (modo === 'hoje') {
            pModo = (v.dataVendaIso === dIsoHoje);
            tituloFiltro = "Vendas de Hoje";
        } else if (modo === 'ontem') {
            let ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
            let dIsoOntem = ontem.toISOString().split('T')[0];
            pModo = (v.dataVendaIso === dIsoOntem);
            tituloFiltro = "Vendas de Ontem";
        }
        
        // Tem que ser da equipe E precisar de separação E bater a data/status
        return precisaSeparar && pEquipe && pModo;
    });

    const divConteudo = document.getElementById('conteudo-separacao');
    
    let html = '';
    if (vendasSeparacao.length === 0) {
        html = `<div style="text-align:center; padding: 20px 10px; color:#64748b;">
            <span style="font-size:3rem; display:block; margin-bottom:10px;">🎉</span>
            <b>Tudo pronto!</b><br>Nenhum item pendente de separação pela Sede em: <b>${tituloFiltro}</b>.
        </div>`;
    } else {
        html = `<h4 style="margin:0 0 15px 0; color:#0369a1; text-align:center; font-weight:900;">${tituloFiltro}</h4>`;
    }

    // Agrupa por vendedor, mas mantendo CADA PEDIDO INDIVIDUAL
    let mapaVendedores = {};
    vendasSeparacao.forEach(v => {
        let vendedor = String(v.socio).trim();
        if (!mapaVendedores[vendedor]) mapaVendedores[vendedor] = [];
        mapaVendedores[vendedor].push(v);
    });
    
    for (let vend in mapaVendedores) {
        html += `<div style="margin-bottom: 15px; border: 1px solid #bae6fd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <div style="background: #e0f2fe; padding: 10px 15px; font-weight: 900; color: #0369a1; border-bottom: 1px solid #bae6fd; display:flex; justify-content:space-between; align-items:center;">
                        <span>👤 Sacola: ${vend}</span>
                        <span style="font-size:0.7rem; background:#fff; padding:3px 8px; border-radius:12px;">${mapaVendedores[vend].length} itens</span>
                    </div>
                    <div style="padding: 12px 15px; background: #fff;">`;
        
        // Ordena para os mais antigos aparecerem primeiro
        mapaVendedores[vend].sort((a,b) => new Date(a.dataVendaIso) - new Date(b.dataVendaIso));

        mapaVendedores[vend].forEach(v => {
            let isChecked = v.separado ? true : false;
            let checkAttr = isChecked ? 'checked' : '';
            let opacity = isChecked ? '0.4' : '1';
            let lineThrough = isChecked ? 'line-through' : 'none';
            
            let badgeData = modo === 'pendentes' ? `<span style="background:#fee2e2; color:#991b1b; padding:2px 5px; border-radius:4px; font-size:0.6rem; margin-left:5px;">${v.dataVendaDisplay}</span>` : '';
            let obsHtml = v.observacao ? `<br><span style="font-size:0.7rem; color:#888; font-style:italic;">Obs: ${v.observacao}</span>` : '';

            // Aviso de Logística: Mostra de onde você tem que tirar o produto!
            let localRetiradaAviso = `<br><span style="font-size:0.7rem; color:#15803d; font-weight:bold;">📍 Pegar de: ${v.local_estoque || 'Sede'}</span>`;

            // Código Novera do produto, pra facilitar achar na prateleira
            let prodInfoSep = estoqueAgrupado[padronizarTexto(v.produto)];
            let codigoBadgeSep = prodInfoSep && prodInfoSep.codigo ? `<span style="background:var(--primary-dark); color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-right:5px;">${prodInfoSep.codigo}</span>` : '';

            html += `<label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; opacity: ${opacity}; text-decoration: ${lineThrough};">
                        <input type="checkbox" ${checkAttr} style="width: 22px; height: 22px; accent-color: #0ea5e9; cursor:pointer; flex-shrink: 0;"
                        onchange="
                            this.parentElement.style.opacity = this.checked ? '0.4' : '1';
                            this.parentElement.style.textDecoration = this.checked ? 'line-through' : 'none';
                            toggleSeparacaoItem(${v.linha}, this.checked);
                        ">
                        <div style="font-size: 0.95rem; color: var(--brand-dark); line-height: 1.3;">
                            <b style="color:#b45309; font-size:1.1rem;">${v.qtd}x</b> ${codigoBadgeSep}${v.produto} ${badgeData}
                            <br><span style="font-size:0.75rem; color:#64748b;">(Cli: ${v.cliente})</span>
                            ${localRetiradaAviso}
                            ${obsHtml}
                        </div>
                     </label>`;
        });
        html += `   </div>
                 </div>`;
    }

    // 🎁 ENCOMENDAS DA EQUIPE: quem está separando na Sede já enxerga os pedidos especiais —
    // as "Produzidas" estão prontas pra separar/entregar; as pendentes aparecem só pra contexto
    const encsSeparacao = encomendasGlobal.filter(en => en.status !== 'Atendida').sort((a, b) => {
        const pa = a.status === 'Produzido' ? 0 : 1, pb = b.status === 'Produzido' ? 0 : 1;
        return pa !== pb ? pa - pb : new Date(a.dataPedido) - new Date(b.dataPedido);
    });
    if (encsSeparacao.length) {
        html += `<div style="margin-top: 20px; border: 1px solid #f3d8e2; border-radius: 8px; overflow: hidden;">
            <div style="background: #fdf5f7; padding: 10px 15px; font-weight: 900; color: var(--primary-dark); border-bottom: 1px solid #f3d8e2; display:flex; justify-content:space-between; align-items:center;">
                <span>🎁 Encomendas da Equipe</span>
                <span style="font-size:0.7rem; background:#fff; padding:3px 8px; border-radius:12px;">${encsSeparacao.length} aberta(s)</span>
            </div>
            <div style="padding: 12px 15px; background: #fff;">`;
        encsSeparacao.forEach(en => {
            const pronta = en.status === 'Produzido';
            const badgeEnc = pronta
                ? `<span style="background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:4px; font-size:0.6rem; font-weight:800; text-transform:uppercase;">✅ Produzida — separar e entregar</span>`
                : `<span style="background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px; font-size:0.6rem; font-weight:800; text-transform:uppercase;">⏳ Aguardando produção</span>`;
            const prodInfoEnc = estoqueAgrupado[padronizarTexto(en.item)];
            const codEnc = prodInfoEnc && prodInfoEnc.codigo ? `<span style="background:var(--primary-dark); color:white; padding:1px 5px; border-radius:4px; font-size:0.65rem; margin-right:4px;">${prodInfoEnc.codigo}</span>` : '';
            html += `<div style="padding:8px 0; border-bottom:1px dashed #f3d8e2; font-size:0.85rem; color:var(--brand-dark); line-height:1.5; ${pronta ? '' : 'opacity:0.65;'}">
                <b style="color:#b45309;">${en.qtd}x</b> ${codEnc}${en.item} ${badgeEnc}
                <br><span style="font-size:0.72rem; color:#64748b;">Cli: ${en.cliente} · Vendedor: ${en.socio || '—'} · Pedido em ${en.dataDisplay || '?'}</span>
            </div>`;
        });
        html += `</div></div>`;
    }

    divConteudo.innerHTML = html;
    document.getElementById('modal-separacao').style.display = 'flex';
}

window.onload = () => {
    aplicarVersao(); 
    const selectAno = document.getElementById('d-filtro-ano'); 
    selectAno.innerHTML = '<option value="">Todos</option>'; 
    const anoAtual = new Date().getFullYear(); 
    for (let i = 2024; i <= anoAtual + 1; i++) { selectAno.innerHTML += `<option value="${i}">${i}</option>`; }
    
    calcularNovera(); 
    verificarLogin();
    
    document.getElementById('cfg-ai-key').value = localStorage.getItem('novera_ai_key') || ''; 
    document.getElementById('cfg-imgbb-key').value = localStorage.getItem('novera_imgbb_key') || ''; 
    document.getElementById('cfg-onionsys-key').value = localStorage.getItem('novera_onionsys_key') || '';

    // ================= NOVIDADE DA V8.0.0 =================
    // 1. Atualiza a cada 60 segundos (60000 milissegundos) se o app estiver aberto
    setInterval(sincronizarDadosSilencioso, 60000); 
    
    // 2. Atualiza imediatamente se você minimizou o navegador e voltou para ele
    document.addEventListener("visibilitychange", () => { 
        if(document.visibilityState === 'visible') sincronizarDadosSilencioso(); 
    });
};

function abrirModalEtiquetaAmostras() {
    if (rotulosGlobal.length === 0) return mostrarAlerta("Aviso", "Nenhuma essência cadastrada.", "warning");

    let html = `<label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; margin-bottom:10px; cursor:pointer;"><input type="checkbox" onchange="toggleTodasEtiquetas(this)" style="width:16px; height:16px; flex-shrink:0;"> <strong>Selecionar Todas</strong></label><div style="border-top:1px dashed #E8DDE1; margin-bottom:10px;"></div>`;

    let rotulosOrdenados = [...rotulosGlobal].sort((a, b) => String(a.codigo || "").localeCompare(String(b.codigo || "")));

    rotulosOrdenados.forEach(r => {
        let gen = r.genero ? ` (${r.genero})` : '';
        html += `<label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; margin-bottom:8px; cursor:pointer;"><input type="checkbox" class="chk-etq-rotulo" value="${r.linha}" style="width:16px; height:16px; flex-shrink:0;"> <b>${r.codigo}</b> - ${r.essencia}${gen}</label>`;
    });

    document.getElementById('etiqueta-checkbox-container').innerHTML = html;
    document.getElementById('modal-gerar-etiqueta').style.display = 'flex';
}

function toggleTodasEtiquetas(source) {
    document.querySelectorAll('.chk-etq-rotulo').forEach(cb => cb.checked = source.checked);
}

async function gerarEtiquetaPDF() {
    const checkboxes = document.querySelectorAll('.chk-etq-rotulo:checked');
    if (checkboxes.length === 0) return mostrarAlerta("Aviso", "Selecione pelo menos uma fragrância.", "warning");

    document.getElementById('modal-gerar-etiqueta').style.display = 'none';
    mostrarLoading("Gerando Etiqueta...");

    let listFem = "", listMasc = "";

    checkboxes.forEach(chk => {
        const r = rotulosGlobal.find(x => x.linha == chk.value);
        if (r) {
            let gen = String(r.genero || "").toLowerCase().trim();
            let linhaHtml = `<div style="display: flex; gap: 5px; font-size: 9px; margin-bottom: 2px;">
                <span style="font-weight: 800; color: #2C2A2B;">${r.codigo}</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.essencia}</span>
            </div>`;

            if (gen === 'feminino') {
                listFem += linhaHtml;
            } else {
                listMasc += linhaHtml;
            }
        }
    });

    let htmlEtiqueta = `
    <div style="width: 110mm; height: 85mm; max-height: 85mm; background: #fff; padding: 5mm; box-sizing: border-box; font-family: 'Montserrat', sans-serif; color: #2C2A2B; overflow: hidden;">
        <div style="text-align: center; margin-bottom: 8px;">
            <img src="logo.png" style="height: 25px; margin-bottom: 3px; object-fit: contain;">
            <h3 style="font-size: 11px; margin: 0; color: #966178; text-transform: uppercase; font-family: 'Playfair Display', serif; letter-spacing: 1px;">Novera Scent - Amostras</h3>
        </div>
        <div style="display: flex; gap: 4mm; height: calc(100% - 40px);">
            <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 900; border-bottom: 1px solid #f3d8e2; padding-bottom: 2px; margin-bottom: 4px; color: #be185d; font-size: 10px;">FEMININO</div>
                <div style="display: flex; flex-direction: column;">
                    ${listFem || "<i style='color:#ccc; font-size: 9px;'>Nenhum selecionado</i>"}
                </div>
            </div>
            <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 900; border-bottom: 1px solid #e0f2fe; padding-bottom: 2px; margin-bottom: 4px; color: #0369a1; font-size: 10px;">MASCULINO / OUTROS</div>
                <div style="display: flex; flex-direction: column;">
                    ${listMasc || "<i style='color:#ccc; font-size: 9px;'>Nenhum selecionado</i>"}
                </div>
            </div>
        </div>
    </div>`;

    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlEtiqueta;
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '0';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    try {
        await new Promise(r => setTimeout(r, 300));
        let opt = {
            margin: 0,
            filename: `Etiqueta_Caixa_Amostras_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 4, useCORS: true, scrollY: 0, windowY: 0, onclone: removerTemaEscuroDoClone },
            jsPDF: { unit: 'mm', format: [110, 85], orientation: 'landscape' },
            pagebreak: { mode: ['avoid-all'] }
        };
        await html2pdf().set(opt).from(tempDiv.firstElementChild).save();
        mostrarAlerta("Sucesso", "Etiqueta gerada lindamente!", "success");
    } catch (err) {
        console.error(err);
        mostrarAlerta("Erro", "Falha ao gerar o PDF.", "error");
    } finally {
        document.body.removeChild(tempDiv);
        ocultarLoading();
    }
}

function abrirModalNovidades() {
    document.getElementById('modal-novidades').style.display = 'flex';
}

function fecharModalNovidades() {
    localStorage.setItem('novera_versao_vista', VERSAO_ATUAL_SISTEMA);
    document.getElementById('modal-novidades').style.display = 'none';
}

function verificarNovidades() {
    const versaoVista = localStorage.getItem('novera_versao_vista');
    if (versaoVista !== VERSAO_ATUAL_SISTEMA) {
        setTimeout(abrirModalNovidades, 1000); 
    }
}

function abrirModalImagem(src) { if (!src || src.includes('placeholder')) return; document.getElementById('img-zoom-src').src = src; document.getElementById('modal-zoom-imagem').style.display = 'flex'; }
function fecharModalImagem() { document.getElementById('modal-zoom-imagem').style.display = 'none'; document.getElementById('img-zoom-src').src = ""; }
function pedirNomeDocumento(nomeOriginal, titulo) { return new Promise((resolve) => { document.getElementById('modal-doc-titulo').innerText = titulo; const input = document.getElementById('modal-doc-nome-input'); input.value = nomeOriginal; document.getElementById('modal-nome-documento').style.display = 'flex'; setTimeout(() => input.focus(), 100); const btnConfirmar = document.getElementById('btn-modal-doc-confirmar'); const btnCancelar = document.getElementById('btn-modal-doc-cancelar'); const removerListeners = () => { btnConfirmar.removeEventListener('click', onConfirmar); btnCancelar.removeEventListener('click', onCancelar); window.cancelarNomeDoc = null; }; const onConfirmar = () => { document.getElementById('modal-nome-documento').style.display = 'none'; removerListeners(); resolve(input.value.trim() === "" ? nomeOriginal : input.value.trim()); }; const onCancelar = () => { document.getElementById('modal-nome-documento').style.display = 'none'; removerListeners(); resolve(null); }; window.cancelarNomeDoc = onCancelar; btnConfirmar.addEventListener('click', onConfirmar); btnCancelar.addEventListener('click', onCancelar); }); }
const fileToBase64 = f => new Promise((r, j) => { const rd = new FileReader(); rd.readAsDataURL(f); rd.onload = () => r(rd.result.split(',')[1]); rd.onerror = e => j(e); });
function comprimirImagem(f, mW, mH, q) { return new Promise((r, j) => { if (!f.type.match(/image.*/)) return j(new Error(`Formato inválido.`)); const rd = new FileReader(); rd.readAsDataURL(f); rd.onload = e => { const i = new Image(); i.src = e.target.result; i.onload = () => { let w = i.width, h = i.height; if (w > h) { if (w > mW) { h = Math.round(h * mW / w); w = mW; } } else { if (h > mH) { w = Math.round(w * mH / h); h = mH; } } const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const cx = cv.getContext('2d'); cx.drawImage(i, 0, 0, w, h); cv.toBlob(b => b ? r(new File([b], "img.jpg", { type: 'image/jpeg' })) : j(new Error("Erro na Compressão")), 'image/jpeg', q); }; }; }); }
// 📤 Upload de fotos: imgbb é o TITULAR (rápido e libera CORS pro catálogo ler); OnionSys virou
// reserva com no máximo 6s de espera — se estiver lento (os famosos erros 524), seguimos sem ele.
// A URL do imgbb SEMPRE vem primeiro na lista salva.
async function uploadDuplo(fileBlob) {
    let urlOnion = "", urlImgBB = "";
    // 1º: imgbb (o que o app realmente usa)
    try {
        const fd2 = new FormData(); fd2.append("image", fileBlob);
        const res2 = await fetch(`https://api.imgbb.com/1/upload?key=${KEY_IMGBB}`, { method: "POST", body: fd2 });
        const data2 = await res2.json();
        if (data2.success) urlImgBB = data2.data.url;
    } catch (e) { }
    // 2º: OnionSys como backup, com paciência CURTA (6s) pra não travar o salvamento
    if (TOKEN_ONIONSYS) {
        try {
            const controle = new AbortController();
            const cronometro = setTimeout(() => controle.abort(), 6000);
            const fd = new FormData(); fd.append("imagem", fileBlob);
            const res = await fetch("https://api.onionsys.com.br/api/novera/registrar/catalogo", { method: "POST", headers: { "Authorization": `Bearer ${TOKEN_ONIONSYS}` }, body: fd, signal: controle.signal });
            clearTimeout(cronometro);
            const text = await res.text();
            if (res.ok) {
                const data = JSON.parse(text);
                urlOnion = (data.arquivos && data.arquivos.length > 0) ? data.arquivos[0].url : (data.url || data.link || (data.filename ? `https://api.onionsys.com.br/arquivos/catalogo/${data.filename}` : ""));
            }
        } catch (e) { /* backup lento ou fora do ar: segue o jogo só com o imgbb */ }
    }
    if (!urlOnion && !urlImgBB) throw new Error("Falha no upload da foto. Confira a chave imgbb em Configurações.");
    return [urlImgBB, urlOnion].filter(u => u).join(',');
}

// 🖼️ Entre as URLs salvas de uma foto, escolhe a melhor pro uso: a do imgbb (rápida e com CORS
// liberado). Conserta também os registros antigos que ficaram com a URL lenta na frente.
function melhorFotoUrl(fotoStr) {
    const urls = String(fotoStr || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!urls.length) return '';
    return urls.find(u => u.includes('ibb.co')) || urls[0];
}



// ==========================================
// MÓDULO: LEITOR DE QR CODE / CÓDIGO DE BARRAS
// ==========================================
let leitorQRScanner = null;

function abrirLeitorCamera() {
    document.getElementById('modal-camera').style.display = 'flex';
    
    // Dá 300ms para o navegador "desenhar" a janela antes de ligar a lente
    setTimeout(() => {
        if (!leitorQRScanner) {
            leitorQRScanner = new Html5Qrcode("reader");
        }
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        leitorQRScanner.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
        .catch(err => {
            console.error(err);
            mostrarAlerta("Erro na Câmera", "Dê permissão para acessar a câmera no seu navegador.", "error");
            fecharLeitorCamera();
        });
    }, 300);
}

function fecharLeitorCamera() {
    if (leitorQRScanner && leitorQRScanner.isScanning) {
        leitorQRScanner.stop().then(() => {
            document.getElementById('modal-camera').style.display = 'none';
        }).catch(err => {
            document.getElementById('modal-camera').style.display = 'none';
        });
    } else {
        document.getElementById('modal-camera').style.display = 'none';
    }
}

function onScanSuccess(codigoLido, decodedResult) {
    fecharLeitorCamera();
    
    let codigoLidoLimpo = codigoLido.trim();
    let codigoPesquisa = codigoLidoLimpo;

    // A MÁGICA: Se o código lido for a URL gigante, ele "corta" e pega só o N001 do final
    if (codigoLidoLimpo.includes('venda=')) {
        try {
            const url = new URL(codigoLidoLimpo);
            codigoPesquisa = url.searchParams.get('venda');
        } catch(e) {
            codigoPesquisa = codigoLidoLimpo.split('venda=')[1].split('&')[0];
        }
    }

    const codigoLimpo = (codigoPesquisa || '').toUpperCase(); 
    
    const selectProd = document.getElementById('v-produto');
    let encontrou = false;
    
    for (let i = 0; i < selectProd.options.length; i++) {
        if (selectProd.options[i].text.includes(codigoLimpo + ' -') || selectProd.options[i].text.startsWith(codigoLimpo)) {
            selectProd.selectedIndex = i;
            encontrou = true;
            break;
        }
    }
    
    if (encontrou) {
        autoPreencherValorVenda(); 
        mostrarAlerta("Bip! 🎯", `Produto ${codigoLimpo} identificado!`, "success");
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    } else {
        mostrarAlerta("Não encontrado", `O código ${codigoLimpo} não foi achado no estoque físico.`, "warning");
    }
}

function onScanFailure(error) {
    // Ele fica rodando 10 vezes por segundo, então se falhar o frame, ignora e tenta o próximo.
}

// ==========================================
// MÓDULO: DEEP LINKING (Leitura Direta da Câmera do Celular)
// ==========================================
function verificarComandosURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoScan = urlParams.get('venda');

    if (produtoScan) {
        const codigoLimpo = produtoScan.trim().toUpperCase();
        
        // 1. Força a ir para a tela de Vendas
        switchTab('vendas');
        toggleVendasTab('registro');
        
        // 2. Preenche a data de hoje automaticamente
        document.getElementById('v-data').valueAsDate = new Date();
        
        // 3. Procura o produto na lista
        const selectProd = document.getElementById('v-produto');
        let encontrou = false;
        
        for (let i = 0; i < selectProd.options.length; i++) {
            if (selectProd.options[i].text.includes(codigoLimpo + ' -') || selectProd.options[i].text.startsWith(codigoLimpo)) {
                selectProd.selectedIndex = i;
                encontrou = true;
                break;
            }
        }
        
        if (encontrou) {
            autoPreencherValorVenda();
            mostrarAlerta("Pronto! 🎯", `Produto ${codigoLimpo} carregado e pronto para venda.`, "success");
            
            // 4. Limpa a barra de endereços para não repetir se você recarregar a página
            window.history.replaceState(null, null, window.location.pathname);
        } else {
            mostrarAlerta("Não encontrado", `O código ${codigoLimpo} não foi achado no estoque físico.`, "warning");
        }
    }
}

// ==========================================
// MÓDULO: GERADOR DE QR CODES PARA IMPRESSORA
// ==========================================

const predefinicoesQR = {
    epson_150_90: { w: 150, h: 90, qr: 16, gap: 3, mx: 5, my: 5 },
    pimaco_100_50: { w: 100, h: 50, qr: 15, gap: 2, mx: 4, my: 4 },
    a4_padrao: { w: 210, h: 297, qr: 22, gap: 5, mx: 10, my: 10 }
};

function aplicarPresetQR() {
    const val = document.getElementById('qr-preset').value;
    if(val !== 'custom' && predefinicoesQR[val]) {
        const p = predefinicoesQR[val];
        document.getElementById('qr-papel-w').value = p.w;
        document.getElementById('qr-papel-h').value = p.h;
        document.getElementById('qr-tamanho').value = p.qr;
        document.getElementById('qr-gap').value = p.gap;
        document.getElementById('qr-margem-x').value = p.mx;
        document.getElementById('qr-margem-y').value = p.my;
        salvarConfigQR();
    }
}

function marcarPresetCustom() {
    document.getElementById('qr-preset').value = 'custom';
    salvarConfigQR();
}

function salvarConfigQR() {
    const config = {
        w: document.getElementById('qr-papel-w').value,
        h: document.getElementById('qr-papel-h').value,
        qr: document.getElementById('qr-tamanho').value,
        gap: document.getElementById('qr-gap').value,
        mx: document.getElementById('qr-margem-x').value,
        my: document.getElementById('qr-margem-y').value,
        preset: document.getElementById('qr-preset').value
    };
    localStorage.setItem('novera_qr_config', JSON.stringify(config));
}

function carregarConfigQR() {
    const saved = localStorage.getItem('novera_qr_config');
    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById('qr-papel-w').value = config.w || 150;
        document.getElementById('qr-papel-h').value = config.h || 90;
        document.getElementById('qr-tamanho').value = config.qr || 16;
        document.getElementById('qr-gap').value = config.gap || 3;
        document.getElementById('qr-margem-x').value = config.mx || 5;
        document.getElementById('qr-margem-y').value = config.my || 5;
        document.getElementById('qr-preset').value = config.preset || 'custom';
    }
}

function abrirModalQrCode() {
    carregarConfigQR(); // Puxa a última configuração salva!
    
    const container = document.getElementById('lista-qr-produtos');
    let html = '';
    
    let rotulosOrdenados = [...rotulosGlobal].sort((a, b) => String(a.codigo || "").localeCompare(String(b.codigo || "")));
    
    rotulosOrdenados.forEach(r => {
        if(!r.codigo) return;
        html += `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #E8DDE1; padding: 8px 0;">
            <span style="font-size: 0.8rem; color: #2C2A2B; font-weight: 700;">${r.codigo} - ${r.essencia}</span>
            <input type="number" class="input-qtd-qr" data-codigo="${r.codigo}" min="0" value="0" style="width: 60px; padding: 5px; border-radius: 6px; border: 1px solid var(--primary); text-align: center; font-weight: 900; color: var(--primary-dark);">
        </div>`;
    });
    
    container.innerHTML = html;
    document.getElementById('modal-gerar-qrcode').style.display = 'flex';
}

function preencherQtdQrComEstoque() {
    const inputs = document.querySelectorAll('.input-qtd-qr');
    inputs.forEach(input => {
        const cod = input.getAttribute('data-codigo');
        let total = 0;
        for(let key in estoqueAgrupado) {
            if(estoqueAgrupado[key].codigo === cod) {
                total += estoqueAgrupado[key].totalQtd;
            }
        }
        input.value = total > 0 ? total : 0;
    });
    mostrarAlerta("Preenchido!", "Quantidades atualizadas com o estoque real.", "success");
}

function salvarProducaoRapida() {
    const nomeProduto = document.getElementById('pr-produto').value;
    const qtdRendimento = parseFloat(document.getElementById('pr-qtd').value) || 0;
    const diasMaceracao = parseInt(document.getElementById('pr-dias').value) || 0;

    if (!nomeProduto || qtdRendimento <= 0) {
        return mostrarAlerta("Atenção", "Selecione o produto e informe o rendimento.", "warning");
    }

    const prodRef = estoqueAgrupado[padronizarTexto(nomeProduto)];
    if (!prodRef) return mostrarAlerta("Erro", "Produto não encontrado.", "error");

    // CORREÇÃO: Gerando a data cravada no fuso horário do seu aparelho!
    const dAtual = new Date();
    const anoI = dAtual.getFullYear();
    const mesI = String(dAtual.getMonth() + 1).padStart(2, '0');
    const diaI = String(dAtual.getDate()).padStart(2, '0');
    const dataInicio = `${anoI}-${mesI}-${diaI}`;

    // Somando os dias de maceração para a Previsão
    dAtual.setDate(dAtual.getDate() + diasMaceracao);
    const anoP = dAtual.getFullYear();
    const mesP = String(dAtual.getMonth() + 1).padStart(2, '0');
    const diaP = String(dAtual.getDate()).padStart(2, '0');
    const dataPrev = `${anoP}-${mesP}-${diaP}`;

    mostrarLoading("Colocando na Fila...");
    const msgLog = `⏳ Reposição Fila: ${qtdRendimento}x [${prodRef.nome}]. Previsão: ${dataBR(dataPrev)} (${diasMaceracao} dias).`;

    fetch(API_NOVERA, {
        method: "POST", headers: cabecalhoAuth(),
        body: JSON.stringify({ 
            usuario: usuarioLogado, 
            acao: "salvar_producao_fila", 
            data_inicio: dataInicio, 
            data_previsao: dataPrev, 
            nome_produto: prodRef.nome, 
            tipo: prodRef.tipo, 
            qtd_prevista: qtdRendimento, 
            custo: fmtPlanilha(parseDinheiro(prodRef.custo)), 
            preco: fmtPlanilha(parseDinheiro(prodRef.preco)), 
            codigo: prodRef.codigo || '', 
            log_detalhe: msgLog 
        })
    }).then(() => {
        mostrarAlerta("Lote na Fila!", `Nova leva de ${prodRef.nome} em maceração!`, "success");
        document.getElementById('pr-produto').value = "";
        document.getElementById('pr-qtd').value = "10";
        document.getElementById('pr-dias').value = "15";
        sincronizarDadosUnico();
    });
}

function abrirModalEditarProducao(linha) {
    const p = producaoGlobal.find(x => x.linha === linha);
    if (!p) return;
    document.getElementById('edit-p-linha').value = p.linha;
    document.getElementById('edit-p-nome').value = p.nome_produto;
    document.getElementById('edit-p-qtd').value = p.qtd_prevista;
    document.getElementById('edit-p-data').value = p.data_previsao;
    document.getElementById('modal-editar-producao').style.display = 'flex';
}

function salvarEdicaoProducao() {
    const linha = document.getElementById('edit-p-linha').value;
    const nome = document.getElementById('edit-p-nome').value;
    const qtd = document.getElementById('edit-p-qtd').value;
    const dataPrev = document.getElementById('edit-p-data').value;
    
    if (!qtd || !dataPrev) return mostrarAlerta("Atenção", "Preencha a data e a quantidade.", "warning");
    
    document.getElementById('modal-editar-producao').style.display = 'none';
    mostrarLoading("Atualizando Maceração...");
    
    const msgLog = `✏️ Editou lote [${nome}]: Qtd -> ${qtd} un | Nova Previsão -> ${dataBR(dataPrev)}`;
    
    const py = {
        usuario: usuarioLogado,
        acao: "atualizar_producao_fila",
        linha: linha,
        qtd: qtd,
        data_previsao: dataPrev,
        log_detalhe: msgLog
    };
    
    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(py) })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) {
                mostrarAlerta("Atualizado!", "O lote foi modificado com sucesso.", "success");
            } else {
                mostrarAlerta("Erro", res.erro || "Falha ao editar.", "error");
            }
            sincronizarDadosUnico();
        }).catch(e => {
            mostrarAlerta("Erro", "Falha de conexão.", "error");
            sincronizarDadosUnico();
        });
}


async function gerarPdfQrCodes() {
    const inputs = document.querySelectorAll('.input-qtd-qr');
    let toPrint = [];
    
    inputs.forEach(inp => {
        const q = parseInt(inp.value) || 0;
        if (q > 0) toPrint.push({ codigo: inp.getAttribute('data-codigo'), qtd: q });
    });
    
    if (toPrint.length === 0) return mostrarAlerta("Aviso", "Coloque a quantidade em pelo menos um produto.", "warning");
    
    // Captura as configurações e salva
    salvarConfigQR();
    const pW = parseFloat(document.getElementById('qr-papel-w').value) || 150;
    const pH = parseFloat(document.getElementById('qr-papel-h').value) || 90;
    const qrSize = parseFloat(document.getElementById('qr-tamanho').value) || 16;
    const gap = parseFloat(document.getElementById('qr-gap').value) || 3;
    const mx = parseFloat(document.getElementById('qr-margem-x').value) || 5;
    const my = parseFloat(document.getElementById('qr-margem-y').value) || 5;

    document.getElementById('modal-gerar-qrcode').style.display = 'none';
    mostrarLoading("Calculando Matemática das Etiquetas...");
    
    const tempQR = document.createElement('div');
    tempQR.style.position = 'absolute';
    tempQR.style.left = '-9999px';
    document.body.appendChild(tempQR);
    
    const baseUrl = "https://diario.vivainteligente.net/novera/index.html?venda=";
    let todasAsEtiquetasHtml = [];
    
    const qrBoxW = qrSize;
    const qrBoxH = qrSize + 5; // QR + texto
    
    for (let item of toPrint) {
        tempQR.innerHTML = '';
        new QRCode(tempQR, {
            text: baseUrl + item.codigo,
            width: 128, height: 128,
            colorDark : "#000000", colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        await new Promise(r => setTimeout(r, 40));
        const canvas = tempQR.querySelector('canvas');
        const dataUrl = canvas.toDataURL("image/jpeg");
        
        const htmlAdesivo = `
        <div style="width: ${qrBoxW}mm; height: ${qrBoxH}mm; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; box-sizing: border-box; background: #fff; overflow: hidden;">
            <img src="${dataUrl}" style="width: ${qrSize}mm; height: ${qrSize}mm; display: block; object-fit: contain;">
            <div style="font-size: 8px; font-family: Arial, sans-serif; font-weight: bold; color: #000; text-align: center; margin-top: 1mm; line-height: 1; white-space: nowrap;">${item.codigo}</div>
        </div>`;
        
        for (let i = 0; i < item.qtd; i++) todasAsEtiquetasHtml.push(htmlAdesivo);
    }
    document.body.removeChild(tempQR);
    
    // A MÁGICA MATEMÁTICA
    const areaUtilW = pW - (mx * 2);
    const areaUtilH = pH - (my * 2);
    
    const colunas = Math.max(1, Math.floor((areaUtilW + gap) / (qrBoxW + gap)));
    const linhas = Math.max(1, Math.floor((areaUtilH + gap) / (qrBoxH + gap)));
    const qrsPorPagina = colunas * linhas;
    
    // O Container Invisível Mestre
    const masterContainer = document.createElement('div');
    masterContainer.style.position = 'absolute';
    masterContainer.style.top = '0';
    masterContainer.style.left = '-9999px';
    document.body.appendChild(masterContainer);

    let paginasDOM = [];
    
    for (let i = 0; i < todasAsEtiquetasHtml.length; i += qrsPorPagina) {
        const pedacoDaPagina = todasAsEtiquetasHtml.slice(i, i + qrsPorPagina);
        
        // Em vez de fazer uma "tripa gigante", criamos um Bloco HTML real para cada página
        const paginaDiv = document.createElement('div');
        paginaDiv.style.width = `${pW}mm`;
        paginaDiv.style.height = `${pH}mm`;
        paginaDiv.style.padding = `${my}mm ${mx}mm`;
        paginaDiv.style.boxSizing = 'border-box';
        paginaDiv.style.background = '#ffffff';
        paginaDiv.style.display = 'flex';
        paginaDiv.style.flexWrap = 'wrap';
        paginaDiv.style.alignContent = 'center';
        paginaDiv.style.justifyContent = 'center';
        paginaDiv.style.gap = `${gap}mm`;
        paginaDiv.style.overflow = 'hidden';
        paginaDiv.innerHTML = pedacoDaPagina.join('');
        
        masterContainer.appendChild(paginaDiv);
        paginasDOM.push(paginaDiv); // Guardamos cada página separada numa lista!
    }
    
    const oldScrollY = window.scrollY;
    const oldScrollX = window.scrollX;
    window.scrollTo(0, 0);

    try {
        mostrarLoading("Criando PDF Perfeito...");
        await new Promise(r => setTimeout(r, 400));
        
        let opt = {
            margin: 0, 
            filename: `Novera_Etiquetas_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3, backgroundColor: '#ffffff', useCORS: true, scrollY: 0, windowY: 0, onclone: removerTemaEscuroDoClone },
            jsPDF: { unit: 'mm', format: [pW, pH], orientation: pW > pH ? 'landscape' : 'portrait' }
        };
        
        // O CÓDIGO DA VITÓRIA: Processa uma página, adiciona folha, processa a outra. Sem recortes!
        let worker = html2pdf().set(opt);
        
        for (let i = 0; i < paginasDOM.length; i++) {
            if (i === 0) {
                // Primeira página
                worker = worker.from(paginasDOM[i]).toPdf();
            } else {
                // Para as próximas, cria folha nova e cola a imagem limpa
                worker = worker.get('pdf').then(pdf => {
                    pdf.addPage();
                }).from(paginasDOM[i]).toContainer().toCanvas().toPdf();
            }
        }
        
        await worker.save();
        mostrarAlerta("Vencemos!", "PDF sem quebras e 100% alinhado gerado com sucesso.", "success");
    } catch(e) {
        console.error(e);
        mostrarAlerta("Erro", "Falha ao gerar o PDF.", "error");
    } finally {
        window.scrollTo(oldScrollX, oldScrollY);
        document.body.removeChild(masterContainer);
        ocultarLoading();
    }
}

// ==========================================
// MÓDULO: GESTÃO DE EQUIPE (USUÁRIOS)
// ==========================================

function renderizarUsuarios() {
    const container = document.getElementById('lista-usuarios-cards');
    if(!container) return;
    if(usuariosGlobal.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999;'>Nenhum usuário encontrado.</p>";
        return;
    }

    let html = "";
    usuariosGlobal.forEach(u => {
        let isAdmin = u.cargo === 'Admin';
        let corBorda = isAdmin ? '#0369a1' : '#166534';
        let badgeCargo = isAdmin ? `<span class="badge-status" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">👑 ADMIN</span>` : `<span class="badge-status" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;">💼 VENDEDOR</span>`;
        let taxa = parseFloat(u.comissao) || 0;

        let btnExcluir = u.usuario === usuarioLogado ? '' : `<button class="btn-acao" style="width:36px; height:36px;" onclick="prepararExclusaoRegistro('usuarios', ${u.id}, 'Usuário: ${u.usuario}')" title="Excluir Usuário">🗑️</button>`;
        let btnVerComo = (!isAdmin) ? `<button class="btn-acao" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd; width:36px; height:36px;" onclick="visualizarComoUsuario(${u.id})" title="Ver o sistema como este vendedor">👁️</button>` : '';

        html += `
        <div class="rotulo-card card-producao-list" style="border-left: 5px solid ${corBorda}; padding: 15px; border-radius: 8px;">
            <div class="prod-info-main" style="flex:1;">
                <h4 style="margin: 0 0 5px 0; font-size: 1rem; color: var(--brand-dark);">
                    👤 ${u.usuario} ${badgeCargo}
                </h4>
                <p style="font-size:0.75rem; color:#888; margin:0;">ID: ${u.id} | <b style="color:var(--primary-dark);">Comissão: ${taxa}%</b>${u.telefone ? ` | 📱 ${u.telefone}` : ` | <span style="color:#c2410c;">📵 sem WhatsApp p/ catálogo</span>`}</p>
            </div>

            <div class="prod-actions">
                <div></div> <!-- Esta div vazia empurra os botões pra direita no celular -->
                <div style="display:flex; gap:8px; align-items:center;">
                    ${btnVerComo}
                    <button class="btn-acao" style="background:#fef08a; color:#b45309; border-color:#fde047; width:36px; height:36px;" onclick="resetarSenhaUsuario(${u.id})" title="Resetar Senha">🔑</button>
                    <button class="btn-acao" style="width:36px; height:36px;" onclick="prepararEdicaoUsuario(${u.id})" title="Editar">✏️</button>
                    ${btnExcluir}
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function salvarUsuario() {
    const id = document.getElementById('u-id').value;
    const nome = padronizarTexto(document.getElementById('u-nome').value);
    const cargo = document.getElementById('u-cargo').value;
    const senha = document.getElementById('u-senha').value;
    const comissao = parseFloat(document.getElementById('u-comissao').value) || 0;
    const metaMensal = parseFloat(document.getElementById('u-meta') ? document.getElementById('u-meta').value : 0) || 0;
    const telefoneU = document.getElementById('u-telefone') ? document.getElementById('u-telefone').value.trim() : '';

    if(!nome) return mostrarAlerta("Atenção", "Preencha o nome de usuário.", "warning");
    if(!id && !senha) return mostrarAlerta("Atenção", "Crie uma senha para o novo usuário.", "warning");

    const acao = id ? "atualizar_usuario" : "salvar_usuario";
    mostrarLoading("Salvando...");
    const msgLog = id ? `✏️ Editou usuário: ${nome} (${cargo} - ${comissao}%${metaMensal ? ` - meta ${fmt(metaMensal)}` : ''})` : `👤 Novo membro: ${nome} (${cargo} - ${comissao}%)`;

    let payload = { usuario: usuarioLogado, acao: acao, id_usuario: id, nome_usuario: nome, cargo_usuario: cargo, comissao: comissao, meta_mensal: metaMensal, telefone: telefoneU, log_detalhe: msgLog };
    if(!id) payload.senha_usuario = senha; 

    fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(res => {
        if(res.sucesso) {
            mostrarAlerta("Sucesso!", `Usuário ${id ? 'atualizado' : 'cadastrado'} perfeitamente.`, "success");
            cancelarEdicaoUsuario();
            sincronizarDadosUnico();
        } else { mostrarAlerta("Erro", res.erro || "Falha.", "error"); }
    }).catch(e => mostrarAlerta("Erro", "Falha de conexão.", "error")).finally(() => ocultarLoading());
}

function prepararEdicaoUsuario(id) {
    const u = usuariosGlobal.find(x => x.id == id);
    if(!u) return;
    document.getElementById('u-id').value = u.id;
    document.getElementById('u-nome').value = u.usuario;
    document.getElementById('u-cargo').value = u.cargo;
    document.getElementById('u-comissao').value = u.comissao || 0;
    const uMetaEl = document.getElementById('u-meta'); if (uMetaEl) uMetaEl.value = u.meta_mensal || '';
    const uTelEl = document.getElementById('u-telefone'); if (uTelEl) uTelEl.value = u.telefone || '';

    document.getElementById('div-u-senha').style.display = 'none';
    document.getElementById('btn-salvar-usuario').innerText = "💾 Salvar Alterações";
    document.getElementById('btn-cancelar-edicao-usuario').style.display = 'block';
    
    document.getElementById('u-nome').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicaoUsuario() {
    document.getElementById('u-id').value = "";
    document.getElementById('u-nome').value = "";
    document.getElementById('u-cargo').value = "Vendedor";
    document.getElementById('u-comissao').value = "";
    const uMetaEl2 = document.getElementById('u-meta'); if (uMetaEl2) uMetaEl2.value = "";
    const uTelEl2 = document.getElementById('u-telefone'); if (uTelEl2) uTelEl2.value = "";
    document.getElementById('u-senha').value = "";
    document.getElementById('div-u-senha').style.display = 'block';
    document.getElementById('btn-salvar-usuario').innerText = "➕ Cadastrar Usuário";
    document.getElementById('btn-cancelar-edicao-usuario').style.display = 'none';
}

function resetarSenhaUsuario(id) {
    const u = usuariosGlobal.find(x => x.id == id);
    if(!u) return;
    abrirConfirmacao("Resetar Senha?", `A senha de acesso de ${u.usuario} será resetada para a senha padrão "N2026".`, "🔑", "#b45309", "#78350f", "✔️ Confirmar Reset", () => {
        mostrarLoading("Resetando Senha...");
        const msgLog = `🔑 Resetou a senha do usuário: ${u.usuario}`;
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "resetar_senha_usuario", id_usuario: id, log_detalhe: msgLog }) })
        .then(() => {
            mostrarAlerta("Senha Resetada!", `A nova senha de ${u.usuario} é N2026`, "success");
            sincronizarDadosUnico();
        });
    });
}

// "Ver como": deixa o Admin enxergar o sistema como um vendedor específico, sem nunca precisar saber a senha dele.
function visualizarComoUsuario(id) {
    const u = usuariosGlobal.find(x => x.id == id);
    if (!u) return;
    abrirConfirmacao(
        `Ver como ${u.usuario}?`,
        `Você vai visualizar o sistema exatamente como ${u.usuario} vê. Nenhuma ação de Admin fica disponível enquanto estiver nesse modo. Um aviso fixo vai aparecer no topo pra você voltar quando quiser.`,
        "👁️", "#0369a1", "#082f49", "✔️ Visualizar",
        () => {
            mostrarLoading("Entrando como " + u.usuario + "...");
            fetch(API_NOVERA, {
                method: "POST",
                headers: cabecalhoAuth(),
                body: JSON.stringify({ usuario: usuarioLogado, acao: "admin_visualizar_como", id_usuario_alvo: u.id })
            })
            .then(r => r.json())
            .then(res => {
                if (res.sucesso) {
                    // Guarda a sessão de Admin original pra dar pra voltar depois
                    localStorage.setItem('novera_admin_token_original', localStorage.getItem('novera_token'));
                    localStorage.setItem('novera_admin_user_original', usuarioLogado);
                    localStorage.setItem('novera_admin_cargo_original', usuarioCargo);

                    dadosCarregados = false;
                    iniciarSessaoLocal(res.usuario, res.cargo, res.token); // já dispara a sincronização, pois dadosCarregados está false
                } else {
                    mostrarAlerta("Erro", res.erro || "Não foi possível entrar como este usuário.", "error");
                }
            })
            .catch(e => mostrarAlerta("Erro", "Falha de conexão.", "error"))
            .finally(() => ocultarLoading());
        }
    );
}

function voltarDaVisualizacao() {
    const tokenAdmin = localStorage.getItem('novera_admin_token_original');
    const userAdmin = localStorage.getItem('novera_admin_user_original');
    const cargoAdmin = localStorage.getItem('novera_admin_cargo_original');
    if (!tokenAdmin) return;

    localStorage.removeItem('novera_admin_token_original');
    localStorage.removeItem('novera_admin_user_original');
    localStorage.removeItem('novera_admin_cargo_original');

    dadosCarregados = false;
    iniciarSessaoLocal(userAdmin, cargoAdmin, tokenAdmin); // já dispara a sincronização, pois dadosCarregados está false
}

// 🤝 ACERTO DE COMISSÃO EM LOTE (Docs & Lotes, exclusivo do Admin)
// Lista tudo que o cliente JÁ PAGOU mas a comissão da vendedora ainda não foi acertada
function prepararAcertoComissao() {
    const vendedor = document.getElementById('ac-vendedor').value;
    const lista = document.getElementById('acerto-comissao-lista');
    const rodape = document.getElementById('acerto-comissao-rodape');
    if (!lista || !rodape) return;
    if (!vendedor) { lista.style.display = 'none'; rodape.style.display = 'none'; return; }

    const pends = vendasGlobal.filter(v => v.status === 'Pago' && !v.repasse_feito && String(v.socio).trim() === vendedor);
    if (!pends.length) {
        lista.innerHTML = '<p style="font-size:0.8rem; color:#0369a1; font-weight:bold;">Nenhuma comissão pendente de acerto. Tudo em dia! 🎉</p>';
        lista.style.display = 'block'; rodape.style.display = 'none'; return;
    }

    pends.sort((a, b) => new Date(b.dataVendaIso) - new Date(a.dataVendaIso));
    let html = ''; let diaAtual = '';
    pends.forEach(v => {
        const dia = v.dataVendaDisplay || v.dataVendaIso;
        if (dia !== diaAtual) {
            diaAtual = dia;
            html += `<div style="background:#e0f2fe; color:#0369a1; font-weight:900; font-size:0.7rem; padding:5px 10px; border-radius:6px; margin:10px 0 6px 0;">📅 VENDA DO DIA: ${dia}</div>`;
        }
        const com = parseFloat(v.valor_comissao) || 0;
        const prodInfo = estoqueAgrupado[padronizarTexto(v.produto)];
        const codBadge = prodInfo && prodInfo.codigo ? `<span style="background:var(--primary-dark); color:white; padding:1px 5px; border-radius:4px; font-size:0.6rem; margin-right:4px;">${prodInfo.codigo}</span>` : '';
        html += `<label style="display:flex; align-items:center; gap:10px; padding:8px 5px; border-bottom:1px dashed #bae6fd; cursor:pointer;">
            <input type="checkbox" class="chk-item-acerto" value="${v.linha}" data-comissao="${com}" checked onchange="atualizarTotalAcertoComissao()" style="width:20px; height:20px; accent-color:#0369a1; flex-shrink:0;">
            <div style="flex:1; min-width:0; font-size:0.8rem; color:var(--brand-dark);">
                <b>${v.qtd}x</b> ${codBadge}${v.produto}
                <br><span style="font-size:0.7rem; color:#64748b;">Cli: ${v.cliente} · Venda: ${fmt(parseDinheiro(v.valor_venda))}</span>
            </div>
            <strong style="color:#0369a1; font-size:0.85rem; white-space:nowrap;">${fmt(com)}</strong>
        </label>`;
    });
    lista.innerHTML = html;
    lista.style.display = 'block';
    rodape.style.display = 'block';
    atualizarTotalAcertoComissao();
}

function atualizarTotalAcertoComissao() {
    const marcados = document.querySelectorAll('.chk-item-acerto:checked');
    let total = 0; marcados.forEach(c => total += parseFloat(c.dataset.comissao) || 0);
    const el = document.getElementById('acerto-comissao-total');
    if (el) el.innerText = fmt(total);
}

function confirmarAcertoComissaoLote() {
    const vendedor = document.getElementById('ac-vendedor').value;
    const marcados = document.querySelectorAll('.chk-item-acerto:checked');
    if (!vendedor || marcados.length === 0) return mostrarAlerta("Aviso", "Selecione ao menos uma venda para acertar.", "warning");
    let total = 0; const linhas = [];
    marcados.forEach(c => { linhas.push(parseInt(c.value)); total += parseFloat(c.dataset.comissao) || 0; });

    abrirConfirmacao("Acertar Comissões?", `Confirma o acerto de ${linhas.length} venda(s) de ${vendedor}, totalizando ${fmt(total)} de comissão repassada?`, "🤝", "#0369a1", "#082f49", "✔️ Confirmar Acerto", () => {
        mostrarLoading("Acertando comissões...");
        fetch(API_NOVERA, {
            method: "POST", headers: cabecalhoAuth(),
            body: JSON.stringify({ usuario: usuarioLogado, acao: "acertar_comissoes_lote", linhas: linhas, log_detalhe: `🤝 Acertou em lote ${linhas.length} comissão(ões) de ${vendedor} — total ${fmt(total)}` })
        })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) {
                mostrarAlerta("Acertado!", `${linhas.length} comissão(ões) de ${vendedor} marcadas como acertadas.`, "success");
                document.getElementById('acerto-comissao-lista').style.display = 'none';
                document.getElementById('acerto-comissao-rodape').style.display = 'none';
                document.getElementById('ac-vendedor').value = '';
                sincronizarDadosUnico();
            } else mostrarAlerta("Erro", res.erro || "Falha ao acertar.", "error");
        })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
    });
}

// ==========================================
// 📋 MÓDULO: CONFERÊNCIA DE ESTOQUE (ADMIN)
// ==========================================
let conferenciaAtual = [];

function abrirModalConferencia() {
    const sel = document.getElementById('conf-local');
    const locais = [...new Set(estoqueGlobal.map(e => (String(e.local || 'Sede').trim() || 'Sede')))].sort((a, b) => a.localeCompare(b));
    sel.innerHTML = '<option value="">Selecione...</option>' + locais.map(l => `<option value="${l}">${l}</option>`).join('');
    document.getElementById('conf-lista').innerHTML = '';
    document.getElementById('btn-salvar-conferencia').style.display = 'none';
    document.getElementById('modal-conferencia').style.display = 'flex';
}

function prepararConferencia() {
    const local = document.getElementById('conf-local').value;
    const cont = document.getElementById('conf-lista');
    const btn = document.getElementById('btn-salvar-conferencia');
    if (!local) { cont.innerHTML = ''; btn.style.display = 'none'; return; }

    // 📂 Agrupa por categoria pra bater com a prateleira: tipos na ordem dos Parâmetros Globais,
    // e Perfume ainda se divide por gênero (Feminino / Masculino / Unissex / Infantil)
    const ordemTiposConf = (configuracoesGlobais.tipos_produto || '').split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    const idxTipoConf = (t) => { const i = ordemTiposConf.indexOf(String(t || '').toLowerCase().trim()); return i === -1 ? 999 : i; };
    const categoriaDe = (e) => {
        const tipoStr = String(e.tipo || 'Outros').trim();
        if (tipoStr.toLowerCase().includes('perfume')) {
            const ag = estoqueAgrupado[padronizarTexto(e.nome)];
            return `${tipoStr} ${String((ag && ag.genero) || 'Unissex').trim()}`;
        }
        return tipoStr;
    };

    const itens = estoqueGlobal
        .filter(e => (String(e.local || 'Sede').trim() || 'Sede') === local)
        .sort((a, b) => {
            const ia = idxTipoConf(a.tipo), ib = idxTipoConf(b.tipo);
            if (ia !== ib) return ia - ib;
            const ca = categoriaDe(a), cb = categoriaDe(b);
            if (ca !== cb) return ca.localeCompare(cb);
            const codA = String(a.codigo || 'zzz'), codB = String(b.codigo || 'zzz');
            if (codA !== codB) return codA.localeCompare(codB);
            return String(a.nome).localeCompare(String(b.nome));
        });
    conferenciaAtual = itens.map(e => ({ nome: e.nome, local: local, esperado: parseFloat(e.qtd) || 0 }));

    if (!conferenciaAtual.length) { cont.innerHTML = '<p style="font-size:0.8rem; color:#999;">Nada registrado nesse local.</p>'; btn.style.display = 'none'; return; }

    let htmlConf = `<p style="font-size:0.7rem; color:#0369a1; font-weight:800; margin:0 0 8px 0;">${conferenciaAtual.length} produto(s) em ${local}:</p>`;
    let catAtualConf = '';
    itens.forEach((e, i) => {
        const cat = categoriaDe(e);
        if (cat !== catAtualConf) {
            catAtualConf = cat;
            htmlConf += `<div style="background:#eff6ff; color:#0369a1; font-weight:900; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px; padding:6px 10px; border-radius:6px; margin:14px 0 4px 0;">📂 ${cat}</div>`;
        }
        const esperado = parseFloat(e.qtd) || 0;
        const codBadge = e.codigo ? `<span style="background:var(--primary-dark); color:white; padding:1px 6px; border-radius:4px; font-size:0.65rem; margin-right:5px;">${e.codigo}</span>` : '';
        htmlConf += `
        <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dashed #E8DDE1;">
            <div style="flex:1; min-width:0; font-size:0.8rem; color:var(--brand-dark);">${codBadge}${e.nome}<br><span style="font-size:0.65rem; color:#999;">Sistema diz: <b>${esperado} un</b></span></div>
            <input type="number" id="conf-qtd-${i}" value="${esperado}" min="0" inputmode="numeric"
                style="width:80px; flex:0 0 80px; text-align:center; padding:8px; font-weight:800;"
                oninput="this.style.background = (parseFloat(this.value) === ${esperado}) ? '#fafafa' : '#fee2e2'">
        </div>`;
    });
    cont.innerHTML = htmlConf;
    btn.style.display = 'block';
}

function salvarConferencia() {
    const ajustes = [];
    conferenciaAtual.forEach((it, i) => {
        const el = document.getElementById('conf-qtd-' + i);
        const real = el ? parseFloat(el.value) : NaN;
        if (!isNaN(real) && real >= 0 && real !== it.esperado) ajustes.push({ nome: it.nome, local: it.local, qtd_real: real, qtd_antes: it.esperado });
    });

    if (!ajustes.length) {
        document.getElementById('modal-conferencia').style.display = 'none';
        return mostrarAlerta("Tudo certo!", "Nenhuma divergência — o estoque físico bateu 100% com o sistema! 🎉", "success");
    }

    abrirConfirmacao("Confirmar Ajustes?", `${ajustes.length} produto(s) com diferença serão corrigidos para a quantidade REAL que você contou. Fica registrado no log e avisa no Telegram.`, "📋", "#0369a1", "#082f49", "✔️ Ajustar Estoque", () => {
        mostrarLoading("Ajustando estoque...");
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "ajustar_estoque_conferencia", ajustes: ajustes }) })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) { mostrarAlerta("Conferido!", `${res.ajustados} produto(s) ajustado(s) pro valor real.`, "success"); document.getElementById('modal-conferencia').style.display = 'none'; sincronizarDadosUnico(); }
            else mostrarAlerta("Erro", res.erro || "Falha ao ajustar.", "error");
        })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
    });
}

// ==========================================
// 👥 MÓDULO: CADASTRO DE CLIENTES (ADMIN)
// ==========================================
function renderizarClientes() {
    const cont = document.getElementById('lista-cadastro-clientes');
    if (!cont) return;
    const isAdmin = (usuarioCargo === 'Admin');

    // A ferramenta de unificar nomes é cirurgia no histórico — só a Diretoria
    const secUnificar = document.getElementById('secao-unificar-clientes');
    if (secUnificar) secUnificar.style.display = isAdmin ? 'block' : 'none';

    const buscaEl = document.getElementById('busca-cadastro-clientes');
    const termo = buscaEl ? normalizarNomeBusca(buscaEl.value) : '';
    const totalEl = document.getElementById('total-clientes-cadastrados');
    if (totalEl) totalEl.innerText = `(${clientesGlobal.length})`;

    const filtrados = clientesGlobal.filter(c => !termo || normalizarNomeBusca(c.nome).includes(termo) || String(c.telefone || '').includes(termo));
    if (!filtrados.length) {
        cont.innerHTML = `<p style='color:#999; font-size:0.8rem;'>${clientesGlobal.length ? 'Nenhum cliente encontrado na busca.' : 'Nenhum cliente cadastrado ainda. Cadastre o primeiro acima! 👆'}</p>`;
    } else {
        cont.innerHTML = filtrados.map(c => {
            const digitos = String(c.telefone || '').replace(/\D/g, '');
            const fone = digitos ? (digitos.length <= 11 ? '55' + digitos : digitos) : '';
            const btnZap = fone ? `<a href="https://wa.me/${fone}" target="_blank" rel="noopener" class="btn-acao" style="width:36px; height:36px; background:#dcfce7; color:#15803d; border-color:#bbf7d0; display:inline-flex; align-items:center; justify-content:center; text-decoration:none;" title="Abrir WhatsApp">📲</a>` : '';
            // Vendedor só mexe nos clientes que ele mesmo cadastrou (o servidor também confere, isso aqui é só a vitrine)
            const souDono = isAdmin || normalizarNomeBusca(c.criadoPor) === normalizarNomeBusca(usuarioLogado);
            const btnEditar = souDono ? `<button class="btn-acao" style="width:36px; height:36px;" onclick="editarCliente(${c.linha})" title="Editar">✏️</button>` : '';
            const btnExcluirCli = souDono ? `<button class="btn-acao" style="width:36px; height:36px; background:#fee2e2; color:#991b1b; border-color:#fecaca;" onclick="excluirCliente(${c.linha})" title="Excluir">🗑️</button>` : '';
            const badgeDono = isAdmin && c.criadoPor ? ` · ✍️ ${c.criadoPor}` : '';
            return `
            <div class="rotulo-card" style="flex-direction:column; align-items:stretch; border-left:5px solid var(--primary-dark); border-radius:8px; padding:12px 15px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                    <div style="min-width:0;">
                        <h4 style="margin:0; font-size:0.9rem; color:var(--brand-dark);">${c.nome}</h4>
                        <p style="margin:3px 0 0 0; font-size:0.72rem; color:#888;">
                            ${c.telefone ? `📱 ${c.telefone}` : '📵 sem telefone'}
                            ${c.aniversario ? ` · 🎂 ${c.aniversario}` : ''}${badgeDono}
                            ${c.obs ? `<br>📝 ${c.obs}` : ''}
                        </p>
                    </div>
                    <div style="display:flex; gap:6px; flex-shrink:0;">
                        ${btnZap}
                        ${btnEditar}
                        ${btnExcluirCli}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // 🔀 Popula os seletores de unificação com TODOS os nomes já usados (vendas + encomendas + cadastro)
    const nomesTodos = [...new Set([
        ...vendasGlobal.map(v => String(v.cliente || '').trim()),
        ...encomendasGlobal.map(e => String(e.cliente || '').trim()),
        ...clientesGlobal.map(c => String(c.nome || '').trim())
    ].filter(n => n))].sort((a, b) => a.localeCompare(b));
    ['mesclar-de', 'mesclar-para'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const atual = sel.value;
        sel.innerHTML = '<option value="">Selecione...</option>' + nomesTodos.map(n => `<option value="${n.replace(/"/g, '&quot;')}">${n}</option>`).join('');
        sel.value = atual;
        iniciarComboBusca(id);
    });
}

function limparFormCliente() {
    document.getElementById('cad-cli-id').value = '';
    document.getElementById('cad-cli-nome').value = '';
    document.getElementById('cad-cli-telefone').value = '';
    document.getElementById('cad-cli-aniversario').value = '';
    document.getElementById('cad-cli-obs').value = '';
    document.getElementById('btn-salvar-cliente').innerText = '💾 Salvar Cliente';
    document.getElementById('btn-cancelar-edicao-cliente').style.display = 'none';
}

function editarCliente(linha) {
    const c = clientesGlobal.find(x => x.linha == linha);
    if (!c) return;
    document.getElementById('cad-cli-id').value = c.linha;
    document.getElementById('cad-cli-nome').value = c.nome;
    document.getElementById('cad-cli-telefone').value = c.telefone || '';
    document.getElementById('cad-cli-aniversario').value = c.aniversario || '';
    document.getElementById('cad-cli-obs').value = c.obs || '';
    document.getElementById('btn-salvar-cliente').innerText = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar-edicao-cliente').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function salvarCliente() {
    const nome = document.getElementById('cad-cli-nome').value.trim();
    if (!nome) return mostrarAlerta("Aviso", "Digite o nome do cliente.", "warning");
    const aniv = document.getElementById('cad-cli-aniversario').value.trim();
    if (aniv && !/^\d{2}\/\d{2}$/.test(aniv)) return mostrarAlerta("Aviso", "Aniversário no formato dia/mês. Ex: 25/12", "warning");
    const linha = document.getElementById('cad-cli-id').value;

    mostrarLoading("Salvando cliente...");
    fetch(API_NOVERA, {
        method: "POST", headers: cabecalhoAuth(),
        body: JSON.stringify({ usuario: usuarioLogado, acao: "salvar_cliente", linha: linha || null, nome: nome, telefone: document.getElementById('cad-cli-telefone').value.trim(), aniversario: aniv, obs: document.getElementById('cad-cli-obs').value.trim() })
    })
    .then(r => r.json())
    .then(res => {
        if (res.sucesso) { mostrarAlerta("Salvo!", `Cliente ${nome} ${linha ? 'atualizado' : 'cadastrado'}.`, "success"); limparFormCliente(); sincronizarDadosUnico(); }
        else mostrarAlerta("Erro", res.erro || "Falha ao salvar.", "error");
    })
    .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
    .finally(() => ocultarLoading());
}

function excluirCliente(linha) {
    const c = clientesGlobal.find(x => x.linha == linha);
    if (!c) return;
    abrirConfirmacao("Excluir Cliente?", `O cadastro de "${c.nome}" será removido (as vendas dele continuam no histórico).`, "🗑️", "#A05252", "#803f3f", "🗑️ Excluir", () => {
        mostrarLoading("Excluindo...");
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "excluir_registro", aba: "Cliente", linha: linha, log_detalhe: `👥 Excluiu cadastro do cliente: ${c.nome}` }) })
        .then(r => r.json())
        .then(res => { if (res.sucesso) { mostrarAlerta("Excluído!", "Cadastro removido.", "success"); sincronizarDadosUnico(); } else mostrarAlerta("Erro", res.erro || "Falha.", "error"); })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
    });
}

function mesclarClientesUI() {
    const de = document.getElementById('mesclar-de').value;
    const para = document.getElementById('mesclar-para').value;
    if (!de || !para) return mostrarAlerta("Aviso", "Escolha o nome errado e o nome certo.", "warning");
    if (de === para) return mostrarAlerta("Aviso", "Os dois nomes são iguais.", "warning");
    const qtdVendas = vendasGlobal.filter(v => String(v.cliente || '').trim() === de).length;

    abrirConfirmacao("Unificar Clientes?", `TODAS as vendas e encomendas de "${de}" (${qtdVendas} venda(s)) vão passar para "${para}". Essa ação NÃO pode ser desfeita.`, "🔀", "#b91c1c", "#7f1d1d", "🔀 Unificar", () => {
        mostrarLoading("Unificando...");
        fetch(API_NOVERA, { method: "POST", headers: cabecalhoAuth(), body: JSON.stringify({ usuario: usuarioLogado, acao: "mesclar_clientes", nome_antigo: de, nome_novo: para }) })
        .then(r => r.json())
        .then(res => {
            if (res.sucesso) { mostrarAlerta("Unificado!", `${res.vendas} venda(s) e ${res.encomendas} encomenda(s) transferidas para "${para}".`, "success"); document.getElementById('mesclar-de').value = ''; document.getElementById('mesclar-para').value = ''; sincronizarDadosUnico(); }
            else mostrarAlerta("Erro", res.erro || "Falha ao unificar.", "error");
        })
        .catch(() => mostrarAlerta("Erro", "Falha na conexão.", "error"))
        .finally(() => ocultarLoading());
    });
}

// Função para o Admin confirmar o Acerto de Contas com o Vendedor
function acertarCaixaVenda(id) {
    abrirConfirmacao("Acertar Caixa?", "Você confirma que o valor dessa venda entrou na conta e a comissão do vendedor foi repassada?", "🤝", "#0369a1", "#082f49", "✔️ Confirmar Acerto", () => {
        mostrarLoading("Acertando e validando...");
        const msgLog = `🤝 Confirmou acerto de caixa e repasse da venda ID: ${id}`;
        fetch(API_NOVERA, { 
            method: "POST", headers: cabecalhoAuth(), 
            body: JSON.stringify({ usuario: usuarioLogado, acao: "acertar_caixa_venda", linha: id, log_detalhe: msgLog }) 
        })
        .then(() => {
            mostrarAlerta("Acertado!", "Caixa finalizado com sucesso.", "success");
            sincronizarDadosUnico();
        });
    });
}

// ==========================================
// 🎛️ MÓDULO: PARÂMETROS GLOBAIS (ADMIN)
// ==========================================
function aplicarConfiguracoesDinamicas() {
    // 🔒 TRAVA DE SEGURANÇA: Mostra o botão do painel APENAS se o crachá for de Admin
    const btnParams = document.getElementById('btn-abrir-parametros');
    if(btnParams) {
        btnParams.style.display = (usuarioCargo === 'Admin') ? 'block' : 'none';
    }

    if(document.getElementById('cfg-estoque-min')) document.getElementById('cfg-estoque-min').value = configuracoesGlobais.estoque_minimo || 5;
    if(document.getElementById('cfg-dias-parado')) document.getElementById('cfg-dias-parado').value = configuracoesGlobais.dias_estoque_parado || 30;
    if(document.getElementById('cfg-tipos-prod')) document.getElementById('cfg-tipos-prod').value = configuracoesGlobais.tipos_produto || '';
    if(document.getElementById('cfg-cat-compras')) document.getElementById('cfg-cat-compras').value = configuracoesGlobais.categorias_compras || '';
    if(document.getElementById('cfg-locais')) document.getElementById('cfg-locais').value = configuracoesGlobais.locais_estoque || '';
    if(document.getElementById('cfg-telefone-loja')) document.getElementById('cfg-telefone-loja').value = configuracoesGlobais.telefone_loja || '';

    // 🎨 Identidade Visual: preenche o painel e aplica a paleta/nome/logo salvos
    if(document.getElementById('cfg-marca-nome')) document.getElementById('cfg-marca-nome').value = configuracoesGlobais.marca_nome || IDENTIDADE_PADRAO.marca_nome;
    if(document.getElementById('cfg-marca-logo')) document.getElementById('cfg-marca-logo').value = configuracoesGlobais.marca_logo_url || '';
    [['cfg-cor-primaria', 'cor_primaria'], ['cfg-cor-primaria-escura', 'cor_primaria_escura'], ['cfg-cor-fundo-claro', 'cor_fundo_claro'], ['cfg-cor-fundo-escuro', 'cor_fundo_escuro'], ['cfg-cor-painel-escuro', 'cor_painel_escuro'], ['cfg-cor-superficie-escura', 'cor_superficie_escura']].forEach(([id, chave]) => {
        const el = document.getElementById(id);
        if (el) el.value = configuracoesGlobais[chave] || IDENTIDADE_PADRAO[chave];
    });
    aplicarIdentidadeVisual(configuracoesGlobais);

    const arrTipos = (configuracoesGlobais.tipos_produto || '').split(',').map(s => s.trim()).filter(s => s);
    if(document.getElementById('lista-tipos-finais')) document.getElementById('lista-tipos-finais').innerHTML = arrTipos.map(t => `<option value="${t}">`).join('');

    const arrCat = (configuracoesGlobais.categorias_compras || '').split(',').map(s => s.trim()).filter(s => s);
    if(document.getElementById('lista-categorias-compras')) document.getElementById('lista-categorias-compras').innerHTML = arrCat.map(c => `<option value="${c}">`).join('');

    const arrLocais = (configuracoesGlobais.locais_estoque || '').split(',').map(s => s.trim()).filter(s => s);
    let optionsLocais = '<option value="">Aguardando...</option>' + arrLocais.map(l => `<option value="${l}">${l}</option>`).join('');
    
    if(document.getElementById('lista-locais')) document.getElementById('lista-locais').innerHTML = arrLocais.map(l => `<option value="${l}">`).join('');
    if(document.getElementById('lista-locais-estoque')) document.getElementById('lista-locais-estoque').innerHTML = arrLocais.map(l => `<option value="${l}">`).join('');
}

// ATUALIZAÇÃO DA FUNÇÃO DE SALVAR (Agora ela fecha o modal sozinha!)
function salvarParametrosSistema() {
    const estMin = document.getElementById('cfg-estoque-min').value;
    const diasParado = document.getElementById('cfg-dias-parado').value;
    const tipos = document.getElementById('cfg-tipos-prod').value;
    const cats = document.getElementById('cfg-cat-compras').value;
    const locais = document.getElementById('cfg-locais').value;

    mostrarLoading();
    fetch(API_NOVERA, {
        method: 'POST',
        headers: cabecalhoAuth(),
        body: JSON.stringify({
            acao: 'salvar_configuracoes',
            configs: {
                estoque_minimo: estMin,
                dias_estoque_parado: diasParado,
                tipos_produto: tipos,
                categorias_compras: cats,
                locais_estoque: locais,
                telefone_loja: (document.getElementById('cfg-telefone-loja') ? document.getElementById('cfg-telefone-loja').value.trim() : ''),
                ...lerIdentidadeDosInputs() // 🎨 nome, logo e paleta viajam junto
            }
        })
    })
    .then(r => r.json())
    .then(res => {
        if(res.sucesso) { 
            mostrarAlerta('Salvo', 'Parâmetros Globais atualizados!', 'success'); 
            fecharModalParametros(); // <--- MÁGICA: Fecha a telinha ao salvar
            sincronizarDadosUnico(); 
        } else { 
            mostrarAlerta('Erro', 'Falha ao salvar as configurações.', 'error'); 
        }
    })
    .catch(() => mostrarAlerta('Erro', 'Falha na conexão.', 'error'))
    .finally(() => ocultarLoading());
}

function abrirModalParametros() {
    if (usuarioCargo !== 'Admin') {
        mostrarAlerta('Acesso Negado', 'Apenas administradores podem mexer no motor do sistema.', 'error');
        return;
    }
    // O segredo está na palavra 'flex' abaixo para ele centralizar na tela toda!
    document.getElementById('modal-parametros').style.display = 'flex';
}

function fecharModalParametros() {
    document.getElementById('modal-parametros').style.display = 'none';
}

// ==========================================
// CONTROLE DAS SUB-ABAS DA FÁBRICA
// ==========================================
function toggleFabricaTab(aba) {
    // 1. Apaga a cor de ativo de todos os botões
    document.getElementById('btn-sub-fab-receita').classList.remove('active');
    document.getElementById('btn-sub-fab-lancar').classList.remove('active');
    document.getElementById('btn-sub-fab-fila').classList.remove('active');
    document.getElementById('btn-sub-fab-sugestoes').classList.remove('active');

    // 2. Esconde todas as telas
    document.getElementById('fabrica-receita-view').style.display = 'none';
    document.getElementById('fabrica-lancar-view').style.display = 'none';
    document.getElementById('fabrica-fila-view').style.display = 'none';
    document.getElementById('fabrica-sugestoes-view').style.display = 'none';

    // 3. Mostra só a tela que foi clicada e acende o botão
    if (aba === 'receita') {
        document.getElementById('btn-sub-fab-receita').classList.add('active');
        document.getElementById('fabrica-receita-view').style.display = 'block';
    } else if (aba === 'lancar') {
        document.getElementById('btn-sub-fab-lancar').classList.add('active');
        document.getElementById('fabrica-lancar-view').style.display = 'block';
    } else if (aba === 'fila') {
        document.getElementById('btn-sub-fab-fila').classList.add('active');
        document.getElementById('fabrica-fila-view').style.display = 'block';
    } else if (aba === 'sugestoes') {
        document.getElementById('btn-sub-fab-sugestoes').classList.add('active');
        document.getElementById('fabrica-sugestoes-view').style.display = 'block';
        renderizarSugestoesProducaoAdmin();
    }
}

// ==========================================
// 📋 COPIAR PEDIDO PARA A ÁREA DE TRANSFERÊNCIA
// ==========================================
function copiarPedidoClipboard() {
    let pendentes = comprasGlobal.filter(c => c.status !== 'Comprado' && c.status !== 'Concluido');
    
    if (pendentes.length === 0) {
        alert('Não há itens pendentes de compra para copiar!');
        return;
    }

    let grupos = {};
    pendentes.forEach(c => {
        let cat = String(c.categoria || 'Diversos').toUpperCase();
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(c);
    });

    let texto = "*NOVO PEDIDO - NOVERA SCENT*\n\n";
    texto += "Olá! Pode separar esses itens para mim, por favor?\n\n";

    for (let cat in grupos) {
        texto += `*${cat}*\n`;
        grupos[cat].forEach(c => {
            texto += `- ${c.qtd}x ${c.item}\n`;
        });
        texto += `\n`;
    }
    
    texto += "Fico no aguardo do total para acertarmos. Obrigado!";

    // MÁGICA DE UX: Copia silenciosamente e anima o botão (SEM ALERTAS NA TELA)
    copiarTextoSeguro(texto).then(() => {
        const btn = document.getElementById('btn-copiar-pedido');
        if(btn) {
            let originalText = btn.innerHTML;
            let originalBg = btn.style.background;
            let originalWidth = btn.offsetWidth; 
            
            // Trava a largura para o botão não "tremer" e muda a cor
            btn.style.width = originalWidth + 'px';
            btn.innerHTML = '✅ Copiado com sucesso!';
            btn.style.background = '#15803d'; // Verde Sucesso
            btn.style.transform = 'scale(1.05)'; // Dá um "pulinho"
            
            // Volta ao normal magicamente após 2.5 segundos
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = originalBg;
                btn.style.transform = 'scale(1)';
                btn.style.width = '100%'; 
            }, 2500);
        }
    }).catch(err => {
        console.error("Erro ao copiar: ", err);
        alert("Erro ao copiar. Seu navegador pode ter bloqueado a área de transferência.");
    });
}