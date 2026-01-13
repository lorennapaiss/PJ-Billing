import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Download, 
  User, 
  DollarSign, 
  Sparkles,
  Mail,
  Copy,
  FileSpreadsheet,
  Users,
  Activity,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Smile
} from 'lucide-react';
import { parseExcelFile, downloadExcelTemplate } from './utils/excelParser';
import { generatePDF } from './utils/pdfGenerator';
import { generateEmailTemplate } from './services/geminiService';
import { EmployeeBillingData, EmailTemplateResponse } from './types';
import { formatCurrency, getInitials } from './utils/formatters';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeBillingData[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeBillingData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeBillingData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateResponse | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await parseExcelFile(file);
      setEmployees(data);
      setFilteredEmployees(data);
      if (data.length > 0) {
        // Optional: auto-select first
        // setSelectedEmployee(data[0]); 
      }
    } catch (error) {
      console.error("Error parsing file", error);
      alert("Erro ao ler o arquivo Excel. Verifique o formato.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const results = employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const handleSelectEmployee = (emp: EmployeeBillingData) => {
    setSelectedEmployee(emp);
    setEmailTemplate(null); 
  };

  const handleGenerateEmail = async () => {
    if (!selectedEmployee) return;
    setAiLoading(true);
    try {
      const template = await generateEmailTemplate(selectedEmployee);
      setEmailTemplate(template);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-900">
      
      {/* Top Navigation / Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-orange-500 to-red-500 text-white p-2 rounded-lg shadow-lg shadow-orange-200">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                PJ Health Manager
              </h1>
              <p className="text-xs text-slate-500 font-medium">Raiz Educação - Benefícios</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadExcelTemplate}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-full hover:bg-slate-50 transition-all shadow-sm hover:shadow"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
              Modelo Excel
            </button>
            
            <div className="relative">
               <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-all shadow-md shadow-orange-200 hover:shadow-orange-300">
                <Upload className="mr-2 h-4 w-4" />
                Carregar Dados
              </label>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-9rem)] min-h-[600px]">
          
          {/* Left Column: Sidebar List */}
          <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Colaboradores</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-40 text-slate-400 animate-pulse">
                   <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                   <span className="text-xs">Processando planilha...</span>
                </div>
              ) : employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                  <Upload className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Faça upload de uma planilha para começar</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-center text-sm text-slate-500 mt-8">Nenhum resultado encontrado.</p>
              ) : (
                filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className={`w-full group flex items-center p-3 rounded-xl transition-all duration-200 border ${
                        isSelected 
                          ? 'bg-orange-50 border-orange-200 shadow-sm' 
                          : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isSelected 
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                      }`}>
                        {getInitials(emp.name)}
                      </div>
                      <div className="ml-3 flex-1 text-left overflow-hidden">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>
                          {emp.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{emp.healthPlanType}</p>
                      </div>
                      <div className="ml-2 text-right">
                         <span className={`block text-xs font-bold ${isSelected ? 'text-orange-700' : 'text-slate-600'}`}>
                           {formatCurrency(emp.total)}
                         </span>
                         <span className="text-[10px] text-slate-400">{emp.referenceMonth}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">Total: {filteredEmployees.length} registros</p>
            </div>
          </div>

          {/* Right Column: Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-1">
            
            {selectedEmployee ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                
                {/* Main Card: Details */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-6 sm:p-8 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-orange-500 opacity-20 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/10 flex items-center">
                             {selectedEmployee.referenceMonth}
                           </span>
                           <span className="px-2.5 py-0.5 rounded-full bg-orange-500/50 backdrop-blur-sm text-xs font-medium border border-orange-400/30 flex items-center">
                             <Activity className="w-3 h-3 mr-1" />
                             {selectedEmployee.healthPlanType}
                           </span>
                           <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 backdrop-blur-sm text-xs font-medium border border-blue-400/30 flex items-center">
                             <Smile className="w-3 h-3 mr-1" />
                             {selectedEmployee.dentalPlanType}
                           </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{selectedEmployee.name}</h2>
                        <p className="text-orange-100 text-sm mt-1 flex items-center">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-white/80" />
                          Dados processados com sucesso
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-orange-100 font-medium mb-1">Total a Descontar</p>
                        <p className="text-3xl font-bold">{formatCurrency(selectedEmployee.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Stats Grid */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {/* Stat 1: Saude */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-orange-100 hover:shadow-md transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Saúde</span>
                            <CreditCard className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                         </div>
                         <p className="text-lg font-bold text-slate-800">{formatCurrency(selectedEmployee.monthlyFee)}</p>
                         <p className="text-xs text-slate-400 mt-1 truncate">{selectedEmployee.healthPlanType}</p>
                      </div>
                      
                      {/* Stat 2: Odonto (NEW) */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-orange-100 hover:shadow-md transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Odonto</span>
                            <Smile className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                         </div>
                         <p className="text-lg font-bold text-slate-800">{formatCurrency(selectedEmployee.dentalCost)}</p>
                         <p className="text-xs text-slate-400 mt-1 truncate">{selectedEmployee.dentalPlanType}</p>
                      </div>

                      {/* Stat 3: Dependentes */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-orange-100 hover:shadow-md transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dependentes</span>
                            <Users className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                         </div>
                         <p className="text-lg font-bold text-slate-800">{formatCurrency(selectedEmployee.dependentsCost)}</p>
                      </div>

                      {/* Stat 4: Copay */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-orange-100 hover:shadow-md transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Coparticipação</span>
                            <DollarSign className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                         </div>
                         <p className="text-lg font-bold text-slate-800">{formatCurrency(selectedEmployee.copay)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => generatePDF(selectedEmployee)}
                        className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Demonstrativo PDF
                      </button>
                      
                      <button
                        onClick={handleGenerateEmail}
                        disabled={aiLoading}
                        className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-slate-200 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {aiLoading ? (
                           <>
                             <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                             <span className="text-orange-600">Gerando...</span>
                           </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Criar E-mail com IA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Email Card */}
                {emailTemplate && (
                  <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-orange-900 font-semibold flex items-center">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm mr-3">
                           <Mail className="h-4 w-4 text-orange-500" />
                        </div>
                        Sugestão de E-mail
                      </h3>
                      <span className="text-xs font-medium px-2 py-1 bg-white rounded-md text-slate-500 border border-slate-100 shadow-sm">
                        Gerado por Gemini AI
                      </span>
                    </div>
                    
                    <div className="p-6 space-y-5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assunto</label>
                          <button 
                            onClick={() => copyToClipboard(emailTemplate.subject)}
                            className="text-xs flex items-center text-orange-600 hover:text-orange-800 font-medium transition-colors"
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copiar
                          </button>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-sm font-medium">
                          {emailTemplate.subject}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mensagem</label>
                          <button 
                            onClick={() => copyToClipboard(emailTemplate.body)}
                            className="text-xs flex items-center text-orange-600 hover:text-orange-800 font-medium transition-colors"
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copiar
                          </button>
                        </div>
                        <div className="relative">
                          <textarea 
                            readOnly 
                            rows={10}
                            value={emailTemplate.body} 
                            className="block w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 border font-mono leading-relaxed focus:ring-0 focus:border-slate-300 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Empty State
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="h-10 w-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum colaborador selecionado</h3>
                <p className="text-slate-500 max-w-md mb-8">
                  Carregue a planilha de faturamento e selecione um colaborador na lista ao lado para visualizar os detalhes e gerar documentos.
                </p>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full text-left transform transition-all hover:scale-105 duration-300">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-800">Modelo da Planilha</span>
                  </div>
                  <ul className="space-y-3">
                    {['Nome', 'Plano Saúde', 'Mensalidade', 'Dependentes', 'Coparticipação', 'Referência', 'Valor Odonto', 'Plano Odonto'].map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mr-2.5"></div>
                        Coluna {String.fromCharCode(65 + i)}: <span className="font-medium text-slate-800 ml-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;