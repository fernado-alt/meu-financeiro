import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Save,
  Trash2,
  FileSpreadsheet,
  X,
  LogOut,
  User,
  Building2,
  PieChart,
  BarChart3,
  Wallet,
  Settings,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CalendarRange,
  Calendar,
  Landmark,
  CreditCard,
  Pencil, // Icone de Edição
  Download, // Icone de Backup
  Upload, // Icone de Restore
  Link // Icone de Link/Conexão
} from "lucide-react";

/* =========================================================
   HELPERS (datas, moeda, compact)
========================================================= */
const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor || 0)
  );

const formatCurrencyCompact = (v) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));

const formatNumberCompact = (v) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(Number(v || 0));

const ymd = (d) => d.toISOString().slice(0, 10);

const parseDateLocal = (ymdStr) => {
  if (!ymdStr) return new Date(NaN);
  const [y, m, d] = ymdStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
};

const isBeforeTodayLocal = (ymdStr) => {
  const d = parseDateLocal(ymdStr);
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  return d < t;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Tailwind-safe
const empresaBadgeStyle = (cor) => {
  const map = {
    blue: { backgroundColor: "#3b82f6", color: "white" },
    purple: { backgroundColor: "#8b5cf6", color: "white" },
    emerald: { backgroundColor: "#10b981", color: "white" },
    gray: { backgroundColor: "#64748b", color: "white" },
  };
  return map[cor] || map.gray;
};

/* =========================================================
   COMPONENTE: BAR CHART
========================================================= */
const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
        Sem dados suficientes
      </div>
    );

  const height = 200;
  const maxVal = Math.max(...data.map((d) => Math.max(d.entrada, d.saida)), 1);
  const scale = (height - 30) / maxVal;

  return (
    <div className="w-full h-64 flex items-end justify-between gap-2 pt-6">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div className="w-full flex items-end justify-center gap-1 h-[200px] border-b border-slate-200">
            <div
              style={{ height: `${Math.max(d.entrada * scale, 1)}px` }}
              className={`w-1/3 rounded-t-sm transition-all duration-500 relative group-hover:opacity-90 ${
                d.entrada > 0 ? "bg-green-500 hover:bg-green-600" : "bg-transparent"
              }`}
            >
              {d.entrada > 0 && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-green-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-green-100 px-1 rounded z-10">
                  {formatNumberCompact(d.entrada)}
                </span>
              )}
            </div>
            <div
              style={{ height: `${Math.max(d.saida * scale, 1)}px` }}
              className={`w-1/3 rounded-t-sm transition-all duration-500 relative group-hover:opacity-90 ${
                d.saida > 0 ? "bg-red-500 hover:bg-red-600" : "bg-transparent"
              }`}
            >
              {d.saida > 0 && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-red-100 px-1 rounded z-10">
                  {formatNumberCompact(d.saida)}
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-medium truncate w-full text-center">
            {d.mes}
          </span>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   COMPONENTE: DONUT CHART
========================================================= */
const SimpleDonutChart = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
        Sem despesas para exibir
      </div>
    );

  let cumulativePercent = 0;
  const total = data.reduce((acc, curr) => acc + curr.valor, 0);

  if (total === 0)
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
        Sem despesas no período
      </div>
    );

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((slice) => {
    const start = cumulativePercent;
    const percent = slice.valor / total;
    cumulativePercent += percent;
    const end = cumulativePercent;

    if (percent > 0.999) {
      return { isCircle: true, color: slice.color, label: slice.label, valor: slice.valor };
    }

    const [startX, startY] = getCoordinatesForPercent(start);
    const [endX, endY] = getCoordinatesForPercent(end);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    return {
      isCircle: false,
      d: `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      color: slice.color,
      percent,
      label: slice.label,
      valor: slice.valor,
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg viewBox="-1.25 -1.25 2.5 2.5" className="transform -rotate-90 w-full h-full">
          {slices.map((slice, i) =>
            slice.isCircle ? (
              <circle key={i} cx="0" cy="0" r="1" fill="none" stroke={slice.color} strokeWidth="0.5" />
            ) : (
              <path
                key={i}
                d={slice.d}
                fill="none"
                stroke={slice.color}
                strokeWidth="0.5"
                className="hover:opacity-80 transition-opacity"
              />
            )
          )}
          {slices.length === 0 && <circle cx="0" cy="0" r="1" stroke="#eee" strokeWidth="0.5" fill="none" />}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 font-medium">Total</span>
          <span className="text-sm font-bold text-slate-800">{formatCurrencyCompact(total)}</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3 max-h-60 overflow-y-auto pr-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600 font-medium truncate max-w-[160px]" title={d.label}>
                {d.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">{formatarMoeda(d.valor)}</span>
              <span className="text-slate-500 w-10 text-right bg-slate-100 rounded px-1">{((d.valor / total) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENTE: LINE CHART
========================================================= */
const SimpleLineChartBalance = ({ points, titleHint }) => {
  if (!points || points.length < 2) {
    return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">Sem dados suficientes</div>;
  }
  const height = 220; const width = 700; const padding = 28;
  const values = points.map(p => p.value);
  const min = Math.min(...values); const max = Math.max(...values);
  const safeRange = max - min || 1;
  const xStep = (width - padding * 2) / (points.length - 1);
  const toX = (i) => padding + i * xStep;
  const toY = (v) => (height - padding) - ((v - min) / safeRange) * (height - padding * 2);
  const polyline = points.map((p, i) => `${toX(i)},${toY(p.value)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + (i * (height - padding * 2)) / 4;
          return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />;
        })}
        <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={polyline} />
        <circle cx={toX(points.length - 1)} cy={toY(last.value)} r="4" fill="#2563eb" />
        <text x={padding} y={toY(max) - 6} fontSize="10" fill="#64748b">{formatCurrencyCompact(max)}</text>
        <text x={padding} y={toY(min) + 12} fontSize="10" fill="#64748b">{formatCurrencyCompact(min)}</text>
        <text x={toX(points.length - 1) - 2} y={toY(last.value) - 10} textAnchor="end" fontSize="10" fill="#0f172a">{formatCurrencyCompact(last.value)}</text>
        <text x={padding} y={height - 8} fontSize="10" fill="#64748b">{points[0].label}</text>
        <text x={width - padding} y={height - 8} textAnchor="end" fontSize="10" fill="#64748b">{last.label}</text>
      </svg>
      {titleHint && <div className="text-[11px] text-slate-400 mt-1">{titleHint}</div>}
    </div>
  );
};

/* =========================================================
   COMPONENTE: STACKED BAR DRE
========================================================= */
const LegendItem = ({ color, label }) => (
  <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />{label}</span>
);
const SimpleStackedBarChartDRE = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">Sem dados suficientes</div>;
  const height = 220; const width = 700; const padding = 28;
  const colors = { impostos: "#ef4444", cmv: "#f59e0b", variaveis: "#8b5cf6", fixas: "#10b981" };
  const maxTotal = Math.max(...data.map(d => d.impostos + d.cmv + d.variaveis + d.fixas), 1);
  const chartH = height - padding * 2; const chartW = width - padding * 2; const barW = chartW / data.length; const gap = Math.max(6, barW * 0.2); const innerW = barW - gap;
  const toY = (v) => (chartH * v) / maxTotal;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-2">
        <LegendItem color={colors.fixas} label="Fixas" />
        <LegendItem color={colors.variaveis} label="Variáveis (Taxas)" />
        <LegendItem color={colors.cmv} label="CMV" />
        <LegendItem color={colors.impostos} label="Impostos" />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        {Array.from({ length: 5 }).map((_, i) => { const y = padding + (i * chartH) / 4; return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />; })}
        {data.map((d, i) => {
          const x = padding + i * barW + gap / 2; const baseY = height - padding;
          const hFixas = toY(d.fixas); const hVar = toY(d.variaveis); const hCmv = toY(d.cmv); const hImp = toY(d.impostos);
          return (
            <g key={i}>
              <rect x={x} y={baseY - hFixas} width={innerW} height={hFixas} fill={colors.fixas} />
              <rect x={x} y={baseY - hFixas - hVar} width={innerW} height={hVar} fill={colors.variaveis} />
              <rect x={x} y={baseY - hFixas - hVar - hCmv} width={innerW} height={hCmv} fill={colors.cmv} />
              <rect x={x} y={baseY - hFixas - hVar - hCmv - hImp} width={innerW} height={hImp} fill={colors.impostos} />
              <text x={x + innerW / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* =========================================================
   LOGIN
========================================================= */
const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const handleLogin = (e) => {
    e.preventDefault();
    if ((user === "admin" && pass === "123") || (user === "socio" && pass === "abc")) onLogin(user);
    else setError("Usuário ou senha incorretos.");
  };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Building2 className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-bold text-slate-800">Grupo Empresarial</h1>
          <p className="text-slate-500">Sistema de Gestão Integrada</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" value={user} onChange={(e) => setUser(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Usuário" />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Senha" />
          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Acessar Painel</button>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   APP
========================================================= */
export default function SistemaFinanceiroPRO() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [viewMode, setViewMode] = useState("dashboard");
  const [empresaSelecionada, setEmpresaSelecionada] = useState("consolidado");
  const [periodoFiltro, setPeriodoFiltro] = useState("este_mes");
  const [customStart, setCustomStart] = useState(ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [customEnd, setCustomEnd] = useState(ymd(new Date()));
  const [regime, setRegime] = useState("caixa");
  const [showGuide, setShowGuide] = useState(false);

  // Estados de edição, backup e integração
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem("financeiro_webhook") || "");

  const empresas = [
    { id: "ps", nome: "PS Investimentos", cor: "blue" },
    { id: "matt", nome: "MATT DEV", cor: "purple" },
    { id: "afm", nome: "AFM Tecnologia", cor: "emerald" },
  ];

  const chartColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

  /* -------------------------
     ESTADOS (PERSISTIDOS)
   ------------------------- */
  
  // Categorias
  const [categorias, setCategorias] = useState(() => {
    try { const s = localStorage.getItem("financeiro_categorias"); if (s) return JSON.parse(s); } catch (e) {}
    return [
      { id: 1, nome: "Receita SaaS", tipo: "entrada", grupoDRE: "Receita Bruta" },
      { id: 2, nome: "Receita Recorrente", tipo: "entrada", grupoDRE: "Receita Bruta" },
      { id: 3, nome: "Vendas", tipo: "entrada", grupoDRE: "Receita Bruta" },
      { id: 4, nome: "Infraestrutura TI", tipo: "saida", grupoDRE: "Custo do Serviço (CMV)" },
      { id: 5, nome: "Taxas Cartão", tipo: "saida", grupoDRE: "Despesas Variáveis" },
      { id: 6, nome: "Licenças", tipo: "saida", grupoDRE: "Custo do Serviço (CMV)" },
      { id: 7, nome: "Compra de Recargas", tipo: "saida", grupoDRE: "Custo do Serviço (CMV)" },
      { id: 8, nome: "Folha de Pagamento", tipo: "saida", grupoDRE: "Despesas Fixas" },
      { id: 9, nome: "Marketing", tipo: "saida", grupoDRE: "Despesas Fixas" },
      { id: 10, nome: "Contabilidade", tipo: "saida", grupoDRE: "Despesas Fixas" },
      { id: 11, nome: "Aluguel", tipo: "saida", grupoDRE: "Despesas Fixas" },
      { id: 12, nome: "Impostos", tipo: "saida", grupoDRE: "Impostos sobre Venda" },
    ];
  });

  // Contas Bancárias (Agora Editáveis!)
  const [contas, setContas] = useState(() => {
    try { const s = localStorage.getItem("financeiro_contas"); if (s) return JSON.parse(s); } catch(e){}
    return [
      { id: 'principal', nome: 'Banco Principal (Inter/Nubank)', tipo: 'banco' },
      { id: 'caixa', nome: 'Caixa Físico', tipo: 'caixa' },
      { id: 'stripe', nome: 'Stripe (Gateway)', tipo: 'gateway' },
      { id: 'mp', nome: 'Mercado Pago', tipo: 'gateway' },
    ];
  });

  // Transações
  const [transacoes, setTransacoes] = useState(() => {
    try { const s = localStorage.getItem("financeiro_pro_data_v2"); if (s) return JSON.parse(s).map(d => ({ ...d, status: d.status || "pago", conta: d.conta || 'principal' })); } catch (e) {}
    return [
      { id: 1, empresa: "ps", descricao: "Renovação Assinaturas", valor: 15000.0, tipo: "entrada", status: "pago", conta: 'stripe', data: "2023-10-01", categoria: "Receita Recorrente", grupoDRE: "Receita Bruta" },
      { id: 2, empresa: "ps", descricao: "Taxas Gateway (Stripe)", valor: 890.0, tipo: "saida", status: "pago", conta: 'stripe', data: "2023-10-02", categoria: "Taxas Cartão", grupoDRE: "Despesas Variáveis" },
      { id: 6, empresa: "afm", descricao: "Folha Pagamento Devs", valor: 12000.0, tipo: "saida", status: "pago", conta: 'principal', data: "2023-10-25", categoria: "Folha de Pagamento", grupoDRE: "Despesas Fixas" },
    ];
  });

  // State para Forms de Configuração
  const [novaCat, setNovaCat] = useState({ nome: "", tipo: "saida", grupoDRE: "Despesas Fixas" });
  const [novaConta, setNovaConta] = useState({ nome: "", tipo: "banco" });

  const [form, setForm] = useState({
    empresa: "ps",
    descricao: "",
    valor: "",
    tipo: "entrada",
    status: "pago",
    conta: "principal",
    data: ymd(new Date()),
    categoria: "",
    grupoDRE: "Despesas Fixas",
  });

  // Login & Persistência
  useEffect(() => { const u = sessionStorage.getItem("fluxo_user_pro"); if(u) { setIsAuthenticated(true); setCurrentUser(u); } }, []);
  const handleLogin = (u) => { sessionStorage.setItem("fluxo_user_pro", u); setIsAuthenticated(true); setCurrentUser(u); };
  const handleLogout = () => { sessionStorage.removeItem("fluxo_user_pro"); setIsAuthenticated(false); setCurrentUser(""); };

  useEffect(() => { localStorage.setItem("financeiro_pro_data_v2", JSON.stringify(transacoes)); }, [transacoes]);
  useEffect(() => { localStorage.setItem("financeiro_categorias", JSON.stringify(categorias)); }, [categorias]);
  useEffect(() => { localStorage.setItem("financeiro_contas", JSON.stringify(contas)); }, [contas]);
  useEffect(() => { localStorage.setItem("financeiro_webhook", webhookUrl); }, [webhookUrl]);

  /* -------------------------
     FILTROS E DADOS
   ------------------------- */
  const filtrarTransacoesPorPeriodo = (lista, periodo) => {
    const hoje = new Date(); const y = hoje.getFullYear(); const m = hoje.getMonth();
    if (periodo === "custom") { const i = parseDateLocal(customStart); const f = parseDateLocal(customEnd); return lista.filter(t => { const d = parseDateLocal(t.data); return d >= i && d <= f; }); }
    return lista.filter(t => {
      const d = parseDateLocal(t.data); const tY = d.getFullYear(); const tM = d.getMonth();
      switch (periodo) {
        case "este_mes": return tY === y && tM === m;
        case "mes_passado": { const mp = m===0?11:m-1; const ap = m===0?y-1:y; return tY===ap && tM===mp; }
        case "este_ano": return tY === y;
        case "ultimos_12": { const um = new Date(hoje); um.setFullYear(y-1); return d>=um && d<=hoje; }
        case "tudo": return true;
        default: return true;
      }
    });
  };

  const filtrarPorRegime = (l, r) => (r === "caixa" ? l.filter(t => t.status === "pago") : l);

  const transacoesEmpresa = useMemo(() => empresaSelecionada === "consolidado" ? transacoes : transacoes.filter(t => t.empresa === empresaSelecionada), [transacoes, empresaSelecionada]);
  const transacoesBasePeriodo = useMemo(() => filtrarPorRegime(filtrarTransacoesPorPeriodo(transacoesEmpresa, periodoFiltro), regime), [transacoesEmpresa, periodoFiltro, customStart, customEnd, regime]);

  const getEmpresaNome = (id) => empresas.find(e => e.id === id)?.nome || "Desconhecida";
  const getEmpresaColor = (id) => empresas.find(e => e.id === id)?.cor || "gray";

  // Saldos
  const saldosPorConta = useMemo(() => {
    const pagas = (empresaSelecionada === "consolidado" ? transacoes : transacoes.filter(t => t.empresa === empresaSelecionada)).filter(t => t.status === "pago");
    return contas.map(c => {
      const total = pagas.filter(t => t.conta === c.id).reduce((a, t) => a + (t.tipo === 'entrada' ? Number(t.valor) : -Number(t.valor)), 0);
      return { ...c, saldo: total };
    });
  }, [transacoes, contas, empresaSelecionada]);

  // KPI Dashboard
  const dashboardStats = useMemo(() => {
    const d = transacoesBasePeriodo;
    const rec = d.filter(t => t.tipo === "entrada").reduce((a, t) => a + Number(t.valor), 0);
    const desp = d.filter(t => t.tipo === "saida").reduce((a, t) => a + Number(t.valor), 0);
    const taxas = d.filter(t => t.tipo === "saida" && (t.categoria.toLowerCase().includes("taxa") || t.grupoDRE === "Despesas Variáveis")).reduce((a, t) => a + Number(t.valor), 0);
    return { receita: rec, despesa: desp, lucro: rec - desp, margem: rec > 0 ? ((rec-desp)/rec)*100 : 0, taxasTotal: taxas };
  }, [transacoesBasePeriodo]);

  const tesouraria = useMemo(() => {
    const pend = transacoesEmpresa.filter(t => t.status === "pendente");
    const pag = transacoesEmpresa.filter(t => t.status === "pago");
    const rec = pend.filter(t => t.tipo === "entrada").reduce((a, t) => a + Number(t.valor), 0);
    const pagPend = pend.filter(t => t.tipo === "saida").reduce((a, t) => a + Number(t.valor), 0);
    const saldo = pag.reduce((a, t) => a + (t.tipo === "entrada" ? Number(t.valor) : -Number(t.valor)), 0);
    return { saldoAtual: saldo, aReceber: rec, aPagar: pagPend, saldoProjetado: saldo + rec - pagPend };
  }, [transacoesEmpresa]);

  // Analytics Data
  const analyticsData = useMemo(() => {
    const hist = filtrarPorRegime(transacoesEmpresa, regime);
    const porMes = {};
    hist.forEach(t => { const k = t.data.substring(0,7); if(!porMes[k]) porMes[k]={mes:k, entrada:0, saida:0}; if(t.tipo==='entrada') porMes[k].entrada+=Number(t.valor); else porMes[k].saida+=Number(t.valor); });
    const chartData = Object.values(porMes).sort((a,b)=>a.mes.localeCompare(b.mes)).slice(-6).map(i=>{const[y,m]=i.mes.split('-'); return{...i, mes:`${m}/${y.slice(2)}`}});
    
    const cats = transacoesBasePeriodo.filter(t=>t.tipo==='saida');
    const porCat = {}; cats.forEach(t=>{ porCat[t.categoria]=(porCat[t.categoria]||0)+Number(t.valor) });
    const pieData = Object.entries(porCat).sort(([,a],[,b])=>b-a).slice(0,8).map(([k,v],i)=>({label:k, valor:v, color:chartColors[i%chartColors.length]}));
    return { chartData, pieData };
  }, [transacoesEmpresa, transacoesBasePeriodo, regime]);

  const dreStackedByMonth = useMemo(() => {
    const base = filtrarPorRegime(transacoesEmpresa, regime);
    const porMes = {};
    base.filter(t => t.tipo === 'saida').forEach(t => {
      const k = t.data.substring(0, 7);
      if(!porMes[k]) porMes[k] = { fixas: 0, variaveis: 0, cmv: 0, impostos: 0 };
      const v = Number(t.valor); const g = t.grupoDRE;
      if(g === 'Despesas Fixas') porMes[k].fixas += v; else if(g === 'Despesas Variáveis') porMes[k].variaveis += v; else if(g === 'Custo do Serviço (CMV)') porMes[k].cmv += v; else if(g === 'Impostos sobre Venda') porMes[k].impostos += v; else porMes[k].variaveis += v;
    });
    return Object.keys(porMes).sort().slice(-6).map(m => { const [y, mo] = m.split('-'); return { label: `${mo}/${y.slice(2)}`, ...porMes[m] }; });
  }, [transacoesEmpresa, regime]);

  const saldoAcumuladoPoints = useMemo(() => {
    const base = filtrarPorRegime(transacoesEmpresa, regime);
    const datas = base.map(t => t.data).sort(); if(datas.length===0) return [];
    const inicio = parseDateLocal(datas[0]); const fim = new Date();
    const meses = []; const cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while(cur<=fim){ meses.push(ymd(cur).substring(0,7)); cur.setMonth(cur.getMonth()+1); }
    const porMesLiq = {}; base.forEach(t=>{ const k = t.data.substring(0,7); porMesLiq[k]=(porMesLiq[k]||0)+(t.tipo==='entrada'?Number(t.valor):-Number(t.valor)); });
    let acum=0; return meses.map(m=>{ acum+=(porMesLiq[m]||0); const[y,mo]=m.split('-'); return{label:`${mo}/${y.slice(2)}`, value:acum}; });
  }, [transacoesEmpresa, regime]);

  const dadosDRE = useMemo(() => {
    const base = transacoesEmpresa; // competência total
    const s = (g, t) => base.filter(x => x.grupoDRE === g && (!t || x.tipo === t)).reduce((a, b) => a + Number(b.valor), 0);
    const rb = s("Receita Bruta", "entrada"); const imp = s("Impostos sobre Venda", "saida");
    const rl = rb - imp;
    const cmv = s("Custo do Serviço (CMV)", "saida"); const var_ = s("Despesas Variáveis", "saida");
    const mc = rl - (cmv + var_);
    const fix = s("Despesas Fixas", "saida");
    return { receitaBruta: rb, impostos: imp, receitaLiquida: rl, custosVariaveis: cmv + var_, margemContribuicao: mc, despesasFixas: fix, lucroOperacional: mc - fix };
  }, [transacoesEmpresa]);

  /* -------------------------
     HANDLERS DE AÇÃO
   ------------------------- */
  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const adicionarTransacao = async (e) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.categoria) return;
    const catObj = categorias.find((c) => c.nome === form.categoria);
    setIsSaving(true);
    
    // Objeto da transação
    let nova = { 
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now(), 
        ...form, 
        valor: parseFloat(form.valor), 
        grupoDRE: catObj?.grupoDRE || form.grupoDRE 
    };

    // Se estiver editando:
    if (editingId) {
        setTransacoes(transacoes.map(t => t.id === editingId ? { ...t, ...nova, id: editingId } : t)); // Mantém ID original
        setEditingId(null);
    } else {
        // Criando nova
        setTransacoes([nova, ...transacoes]);
    }

    // Integração com Google Sheets (se configurado)
    if(webhookUrl && !editingId) { // Só envia novos lançamentos por enquanto para não duplicar
       try {
         await fetch(webhookUrl, {
           method: 'POST',
           mode: 'no-cors', // Importante para Google Apps Script simples
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(nova)
         });
       } catch (err) {
         console.error("Erro ao enviar para o Sheets", err);
       }
    }

    setIsSaving(false);
    setForm({ empresa: form.empresa, descricao: "", valor: "", tipo: "entrada", status: "pago", conta: form.conta, data: ymd(new Date()), categoria: "", grupoDRE: "Despesas Fixas" });
  };

  const preparerEdicao = (t) => {
      setForm({
          empresa: t.empresa,
          descricao: t.descricao,
          valor: t.valor,
          tipo: t.tipo,
          status: t.status,
          conta: t.conta || "principal",
          data: t.data,
          categoria: t.categoria,
          grupoDRE: t.grupoDRE
      });
      setEditingId(t.id);
      setViewMode("fluxo"); // Leva o usuário para o form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
      setEditingId(null);
      setForm({ empresa: "ps", descricao: "", valor: "", tipo: "entrada", status: "pago", conta: "principal", data: ymd(new Date()), categoria: "", grupoDRE: "Despesas Fixas" });
  };

  const backupDados = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ transacoes, categorias, contas }));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "financeiro_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const restoreDados = (e) => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
          try {
              const parsed = JSON.parse(e.target.result);
              if(parsed.transacoes) setTransacoes(parsed.transacoes);
              if(parsed.categorias) setCategorias(parsed.categorias);
              if(parsed.contas) setContas(parsed.contas);
              alert("Dados restaurados com sucesso!");
          } catch(err) { alert("Erro ao ler arquivo de backup."); }
      };
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-20 md:pb-0">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-400 w-8 h-8" />
            <div><h1 className="text-xl font-bold">Gestão Integrada</h1><p className="text-xs text-slate-400">Olá, {currentUser}</p></div>
          </div>
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <select value={empresaSelecionada} onChange={(e) => setEmpresaSelecionada(e.target.value)} className="bg-transparent text-white text-sm font-medium px-4 py-2 outline-none cursor-pointer border-none">
              <option value="consolidado">🏢 Visão Consolidada</option>
              {empresas.map((e) => (<option key={e.id} value={e.id}>{e.nome}</option>))}
            </select>
          </div>
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg overflow-x-auto">
            <button onClick={() => setViewMode("dashboard")} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${viewMode === "dashboard" ? "bg-blue-600" : "hover:bg-slate-700"}`}><PieChart className="w-4 h-4" /> Dash</button>
            <button onClick={() => setViewMode("fluxo")} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${viewMode === "fluxo" ? "bg-blue-600" : "hover:bg-slate-700"}`}><Wallet className="w-4 h-4" /> Fluxo</button>
            <button onClick={() => setViewMode("dre")} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${viewMode === "dre" ? "bg-blue-600" : "hover:bg-slate-700"}`}><FileSpreadsheet className="w-4 h-4" /> DRE</button>
            <button onClick={() => setViewMode("config")} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${viewMode === "config" ? "bg-blue-600" : "hover:bg-slate-700"}`}><Settings className="w-4 h-4" /> Config</button>
            <button onClick={handleLogout} className="p-2 hover:bg-red-900 rounded-md text-red-400 ml-2"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        
        {viewMode === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="text-blue-600" /> Painel: {empresaSelecionada === "consolidado" ? "Consolidado" : getEmpresaNome(empresaSelecionada)}</h2>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 px-2">Regime</span>
                  <button onClick={() => setRegime("caixa")} className={`px-3 py-2 rounded-md text-sm font-bold ${regime === "caixa" ? "bg-green-100 text-green-700" : "text-slate-500"}`}>Caixa</button>
                  <button onClick={() => setRegime("competencia")} className={`px-3 py-2 rounded-md text-sm font-bold ${regime === "competencia" ? "bg-blue-100 text-blue-700" : "text-slate-500"}`}>Competência</button>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
                  <CalendarRange className="w-4 h-4 text-slate-500 ml-2" />
                  <select value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 p-2 outline-none">
                    <option value="este_mes">Este Mês</option><option value="mes_passado">Mês Passado</option><option value="este_ano">Este Ano</option><option value="ultimos_12">Últimos 12 Meses</option><option value="tudo">Todo o Período</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SALDOS DE CONTAS (NOVO) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Landmark className="w-4 h-4 text-slate-500" /> Saldos por Conta (Acumulado Real)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {saldosPorConta.map(c => (
                  <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase truncate max-w-[150px]" title={c.nome}>{c.nome}</p>
                      <p className={`text-lg font-bold ${c.saldo >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatarMoeda(c.saldo)}</p>
                    </div>
                    {c.tipo === 'gateway' ? <CreditCard className="w-5 h-5 text-purple-400" /> : <Landmark className="w-5 h-5 text-blue-400" />}
                  </div>
                ))}
                <div className="bg-slate-800 text-white p-3 rounded-lg border border-slate-700 shadow-sm flex items-center justify-between">
                    <div><p className="text-xs text-slate-400 font-bold uppercase">Total Líquido</p><p className="text-lg font-bold">{formatarMoeda(saldosPorConta.reduce((a,b)=>a+b.saldo,0))}</p></div>
                    <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Receita</span><TrendingUp className="w-4 h-4 text-green-600" /></div>
                <div className="text-2xl font-bold text-slate-800">{formatarMoeda(dashboardStats.receita)}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Despesas</span><TrendingDown className="w-4 h-4 text-red-600" /></div>
                <div className="text-2xl font-bold text-slate-800">{formatarMoeda(dashboardStats.despesa)}</div>
                <div className="text-xs text-slate-400 mt-1 flex justify-between"><span>Taxas/Variáveis:</span><span className="text-red-500">{formatarMoeda(dashboardStats.taxasTotal)}</span></div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Resultado</span><Wallet className="w-4 h-4 text-blue-600" /></div>
                <div className={`text-2xl font-bold ${dashboardStats.lucro >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatarMoeda(dashboardStats.lucro)}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Previsão</span><Clock className="w-4 h-4 text-indigo-600" /></div>
                <div className="text-2xl font-bold text-slate-800">{formatarMoeda(tesouraria.saldoProjetado)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-slate-400" /> Evolução Saldo (Acumulado)</h3>
                <SimpleLineChartBalance points={saldoAcumuladoPoints} titleHint="Visualização mensal acumulada" />
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-400" /> Entradas vs Saídas (6 Meses)</h3>
                <SimpleBarChart data={analyticsData.chartData} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-slate-400" /> Despesas por Grupo (Composição)</h3>
                <SimpleStackedBarChartDRE data={dreStackedByMonth} />
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-slate-400" /> Categorias (Período)</h3>
                <div className="flex items-center justify-center h-64"><SimpleDonutChart data={analyticsData.pieData} /></div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "fluxo" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><User className="text-blue-600 w-5 h-5" /> {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                    {editingId && <button onClick={cancelarEdicao} className="text-xs text-red-500 underline">Cancelar</button>}
                </div>
                
                <form onSubmit={adicionarTransacao} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Empresa</label>
                    <select name="empresa" value={form.empresa} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded mt-1">
                      {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                    <input type="text" name="descricao" value={form.descricao} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded mt-1" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Valor</label><input type="number" step="0.01" name="valor" value={form.valor} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded mt-1" required /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Data</label><input type="date" name="data" value={form.data} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded mt-1" required /></div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                    <select name="categoria" value={form.categoria} onChange={(e) => {
                      const c = e.target.value; const cat = categorias.find(x => x.nome === c);
                      setForm(p => ({ ...p, categoria: c, tipo: cat?.tipo || p.tipo, grupoDRE: cat?.grupoDRE || p.grupoDRE }));
                    }} className="w-full p-2 border border-slate-300 rounded mt-1 bg-white" required>
                      <option value="">Selecione...</option>
                      {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome} ({c.tipo})</option>)}
                    </select>
                  </div>
                  {/* CONTA (NOVO) */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Conta / Destino</label>
                    <select name="conta" value={form.conta} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded mt-1 bg-white">
                      {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                     <button type="button" onClick={() => setForm({...form, status: 'pago'})} className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${form.status === 'pago' ? 'bg-green-100 text-green-700 font-bold' : 'text-slate-400'}`}><CheckCircle2 className="w-3 h-3" /> Pago</button>
                     <button type="button" onClick={() => setForm({...form, status: 'pendente'})} className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${form.status === 'pendente' ? 'bg-orange-100 text-orange-700 font-bold' : 'text-slate-400'}`}><Clock className="w-3 h-3" /> Agendar</button>
                  </div>
                  <button type="submit" disabled={isSaving} className={`w-full py-3 text-white font-bold rounded shadow mt-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} ${isSaving ? 'opacity-70 cursor-wait' : ''}`}>
                    {isSaving ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Registrar Lançamento')}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center"><h3 className="font-bold text-slate-700">Histórico</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b"><tr><th className="px-4 py-3">Status</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">Conta</th><th className="px-4 py-3">Desc.</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-center">Ações</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {transacoesEmpresa.sort((a,b)=>b.data.localeCompare(a.data)).map((t) => (
                        <tr key={t.id} className={`hover:bg-slate-50 ${t.status === 'pendente' ? 'bg-orange-50/30' : ''} ${editingId === t.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                          <td className="px-4 py-3 text-center"><button onClick={() => alternarStatus(t.id)}>{t.status === 'pago' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-orange-400" />}</button></td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-500">{parseDateLocal(t.data).toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-3 text-xs">{contas.find(c => c.id === t.conta)?.nome || '-'}</td>
                          <td className="px-4 py-3"><div>{t.descricao}</div><div className="text-xs text-slate-400">{t.categoria}</div></td>
                          <td className={`px-4 py-3 text-right font-bold ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>{t.tipo === 'saida' && '- '}{formatarMoeda(t.valor)}</td>
                          <td className="px-4 py-3 text-center flex justify-center gap-2">
                              <button onClick={() => preparerEdicao(t)} className="text-blue-400 hover:text-blue-600" title="Editar"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => removerTransacao(t.id)} className="text-slate-300 hover:text-red-500" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "dre" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileSpreadsheet className="text-blue-600" /> DRE Gerencial</h2>
             <div className="space-y-1 font-mono text-sm">
                <div className="flex justify-between py-2 border-b"><span>(+) Receita Bruta</span><span className="text-blue-600 font-bold">{formatarMoeda(dadosDRE.receitaBruta)}</span></div>
                <div className="flex justify-between py-1 text-slate-500 pl-4"><span>(-) Impostos</span><span className="text-red-400">{formatarMoeda(dadosDRE.impostos)}</span></div>
                <div className="flex justify-between py-2 bg-slate-50 font-bold"><span>(=) Receita Líquida</span><span>{formatarMoeda(dadosDRE.receitaLiquida)}</span></div>
                <div className="flex justify-between py-1 text-slate-500 pl-4"><span>(-) Custos Variáveis</span><span className="text-red-400">{formatarMoeda(dadosDRE.custosVariaveis)}</span></div>
                <div className="flex justify-between py-2 bg-blue-50 font-bold text-blue-800"><span>(=) Margem Contribuição</span><span>{formatarMoeda(dadosDRE.margemContribuicao)}</span></div>
                <div className="flex justify-between py-1 text-slate-500 pl-4"><span>(-) Despesas Fixas</span><span className="text-red-400">{formatarMoeda(dadosDRE.despesasFixas)}</span></div>
                <div className="flex justify-between py-4 mt-2 border-t-2 text-lg font-bold"><span>(=) Lucro Operacional</span><span className={dadosDRE.lucroOperacional>=0?'text-green-600':'text-red-600'}>{formatarMoeda(dadosDRE.lucroOperacional)}</span></div>
             </div>
          </div>
        )}

        {viewMode === "config" && (
          <div className="max-w-4xl mx-auto space-y-6">
             {/* CONFIGURAÇÃO DE INTEGRAÇÃO (NOVO) */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Link className="w-4 h-4"/> Integração Google Sheets</h3>
                <p className="text-sm text-slate-500 mb-4">Cole abaixo a URL do seu Web App do Google Apps Script. Os novos lançamentos serão enviados automaticamente.</p>
                <div className="flex gap-2">
                    <input type="text" placeholder="https://script.google.com/macros/s/..." className="border p-2 rounded flex-1 text-sm font-mono" value={webhookUrl} onChange={e=>setWebhookUrl(e.target.value)} />
                    <button onClick={()=>alert("URL Salva!")} className="bg-slate-800 text-white px-4 rounded text-sm font-bold">Salvar URL</button>
                </div>
                <div className="mt-2 text-xs text-slate-400">Status: {webhookUrl ? "Conectado (Pronto para enviar)" : "Desconectado (Apenas local)"}</div>
             </div>

             {/* GERENCIAR CONTAS (NOVO) */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-700 mb-4">Gerenciar Contas Bancárias / Gateways</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Nome da Conta (ex: Nubank)" className="border p-2 rounded flex-1" value={novaConta.nome} onChange={e=>setNovaConta({...novaConta, nome:e.target.value})} />
                    <select className="border p-2 rounded" value={novaConta.tipo} onChange={e=>setNovaConta({...novaConta, tipo:e.target.value})}><option value="banco">Banco</option><option value="gateway">Gateway (Stripe/MP)</option><option value="caixa">Caixa Físico</option></select>
                    <button onClick={()=>{if(novaConta.nome){setContas([...contas, {id: Date.now().toString(), ...novaConta}]); setNovaConta({nome:'', tipo:'banco'})}}} className="bg-green-600 text-white px-4 rounded font-bold"><PlusCircle className="w-4 h-4"/></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {contas.map(c => <div key={c.id} className="border p-2 rounded flex justify-between text-sm items-center"><span>{c.nome}</span><button onClick={()=>setContas(contas.filter(x=>x.id!==c.id))} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>)}
                </div>
             </div>

             {/* GERENCIAR CATEGORIAS */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-700 mb-4">Gerenciar Categorias</h3>
                <form onSubmit={(e) => { e.preventDefault(); if(!novaCat.nome) return; setCategorias([...categorias, {id: Date.now(), ...novaCat}]); setNovaCat({nome:"", tipo:"saida", grupoDRE:"Despesas Fixas"}); }} className="flex gap-2 mb-4">
                    <input type="text" placeholder="Nome" className="border p-2 rounded flex-1" value={novaCat.nome} onChange={e=>setNovaCat({...novaCat, nome:e.target.value})} />
                    <select className="border p-2 rounded" value={novaCat.tipo} onChange={e=>setNovaCat({...novaCat, tipo:e.target.value})}><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
                    <select className="border p-2 rounded w-48" value={novaCat.grupoDRE} onChange={e=>setNovaCat({...novaCat, grupoDRE:e.target.value})}><option>Despesas Variáveis</option><option>Despesas Fixas</option><option>Custo do Serviço (CMV)</option><option>Receita Bruta</option></select>
                    <button type="submit" className="bg-blue-600 text-white px-4 rounded font-bold"><PlusCircle className="w-4 h-4"/></button>
                </form>
                <div className="grid grid-cols-2 gap-2">
                    {categorias.map(c => <div key={c.id} className="border p-2 rounded flex justify-between text-sm"><span>{c.nome}</span><button onClick={()=>setCategorias(categorias.filter(x=>x.id!==c.id))} className="text-red-400"><Trash2 className="w-3 h-3"/></button></div>)}
                </div>
             </div>

             {/* BACKUP DE SEGURANÇA */}
             <div className="bg-slate-800 text-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-lg mb-1">Segurança dos Dados</h3>
                    <p className="text-sm text-slate-400">Salve seus dados no computador para não perder nada.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={backupDados} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 text-sm font-bold"><Download className="w-4 h-4"/> Fazer Backup</button>
                    <label className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <Upload className="w-4 h-4"/> Restaurar Backup
                        <input type="file" onChange={restoreDados} className="hidden" accept=".json" />
                    </label>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
