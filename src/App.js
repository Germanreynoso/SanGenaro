import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import {
  FileText,
  LogOut,
  Plus,
  Search,
  Save,
  Printer,
  Activity,
  ChevronLeft,
  Lock,
  Sparkles,
  Loader2,
  Lightbulb,
  ShieldAlert,
  HeartHandshake,
  RefreshCw,
  Settings,
  FolderOpen
} from 'lucide-react';

// --- CONFIGURACION IA (Groq API) ---
const groqKey = process.env.REACT_APP_GROQ_API_KEY || "";

const callGemini = async (prompt) => {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const payload = {
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2048
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Groq API error:", errorBody);
      throw new Error(`Error API: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No se pudo generar el contenido.";
  } catch (error) {
    console.error("Error calling AI:", error);
    return "Error al conectar con el asistente de IA. Por favor intente nuevamente.";
  }
};

// --- CONSTANTES ---

const ROLES = {
  ADMIN: 'admin',
  NUTRICION: 'nutricion',
  PSICOLOGIA: 'psicologia',
  ENFERMERIA: 'enfermeria',
  EDUCACION_FISICA: 'educacion_fisica',
  ORIENTADORA: 'orientadora',
  TRABAJO_SOCIAL: 'trabajo_social',
  PSIQUIATRIA: 'psiquiatria',
  FONOAUDIOLOGIA: 'fonoaudiologia',
  TERAPIA_OCUPACIONAL: 'terapia_ocupacional',
  TALLER_PLASTICA: 'taller_plastica',
  TALLER_RADIO: 'taller_radio',
  TALLER_MUSICA: 'taller_musica',
  TALLER_EXPRESION: 'taller_expresion',
  TALLER_PSICOMOTRICIDAD: 'taller_psicomotricidad'
};

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.NUTRICION]: 'Nutrición',
  [ROLES.PSICOLOGIA]: 'Psicología',
  [ROLES.ENFERMERIA]: 'Clínica Médica / Enfermería',
  [ROLES.EDUCACION_FISICA]: 'Educación Física (EFA)',
  [ROLES.ORIENTADORA]: 'Orientadora',
  [ROLES.TRABAJO_SOCIAL]: 'Trabajo Social',
  [ROLES.PSIQUIATRIA]: 'Psiquiatría',
  [ROLES.FONOAUDIOLOGIA]: 'Fonoaudiología',
  [ROLES.TERAPIA_OCUPACIONAL]: 'Terapia Ocupacional',
  [ROLES.TALLER_PLASTICA]: 'Taller de Plástica',
  [ROLES.TALLER_RADIO]: 'Taller de Radio',
  [ROLES.TALLER_MUSICA]: 'Taller de Música',
  [ROLES.TALLER_EXPRESION]: 'Taller Expresión Corporal',
  [ROLES.TALLER_PSICOMOTRICIDAD]: 'Taller Psicomotricidad'
};

const FORM_TYPES = {
  EVOLUCION: 'Evolución Bimestral',
  ADMISION: 'Admisión Integral',
  SEMESTRAL: 'Informe Semestral',
  PLANIFICACION: 'Planificación Semestral'
};

// --- COMPONENTES UI ---

const FileViewer = ({ folderId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    if (!folderId || !window.gapi?.client?.drive) return;
    setLoading(true);
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, webViewLink, iconLink, mimeType)',
      });
      setFiles(response.result.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFiles(); }, [folderId]);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <FolderOpen size={16} /> Documentos en Drive del Paciente
      </h4>
      {loading ? <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin" size={14} /> Cargando archivos...</div> : (
        <div className="space-y-2">
          {files.length === 0 ? <p className="text-xs text-gray-400 italic">No se encontraron archivos en esta carpeta.</p> :
            files.map(file => (
              <a key={file.id} href={file.webViewLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-white rounded border hover:border-teal-500 transition-colors group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={file.iconLink} alt="icon" className="w-4 h-4" />
                  <span className="text-sm text-gray-600 truncate">{file.name}</span>
                </div>
                <FileText size={14} className="text-gray-400 group-hover:text-teal-600" />
              </a>
            ))
          }
        </div>
      )}
      <Button variant="ghost" onClick={fetchFiles} className="mt-2 !text-[10px] !p-0 text-teal-600 font-bold uppercase">Actualizar archivos</Button>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
    danger: "bg-red-100 text-red-700 hover:bg-red-200",
    ghost: "hover:bg-gray-100 text-gray-600",
    ai: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200",
    ai_alert: "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200",
    ai_soft: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// Componente de Botón Inteligente
const GeminiButton = ({ type, contextData, contextExtra, onResult, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    // Validación: si no hay datos de contexto (texto escrito) y no es una sugerencia inicial, pedir input.
    if (!contextData && type === 'improve') return alert("Por favor escribe algo primero para que la IA pueda mejorarlo.");

    setLoading(true);
    let prompt = "";

    if (type === 'improve') {
      prompt = `Reescribe y mejora el siguiente texto para un informe médico/terapéutico. Corrige ortografía, gramática y haz que el tono sea formal, objetivo y profesional. Mantén el sentido original. Texto a mejorar: "${contextData}"`;
    } else if (type === 'summarize') {
      prompt = `Genera una 'Conclusión General Interdisciplinaria' resumida (máx 100 palabras) y coherente basada en los siguientes datos de un paciente. Integra los puntos clave de las diferentes áreas (Psicología, Social, Médica, etc.). Datos: ${JSON.stringify(contextData)}`;
    } else if (type === 'objectives') {
      prompt = `Basado en el diagnóstico "${contextExtra}" y el proyecto "${contextData}", sugiere 3 objetivos generales (tipo SMART) para trabajar en el semestre. Devuelve solo la lista.`;
    } else if (type === 'activities') {
      prompt = `Basado en el diagnóstico "${contextExtra}", sugiere 3 actividades concretas, creativas y adaptadas para el área de "${contextData}". Devuelve una lista breve con la actividad y su beneficio terapéutico.`;
    } else if (type === 'risks') {
      prompt = `Basado en estos antecedentes y diagnóstico: "${contextExtra}", y esta evaluación inicial: "${JSON.stringify(contextData)}", identifica 3 posibles riesgos latentes (ej. caídas, broncoaspiración, abandono, etc.) y sugiere una medida preventiva para cada uno. Sé conciso.`;
    } else if (type === 'family') {
      prompt = `Basado en el diagnóstico "${contextExtra}" y la evaluación "${contextData}", escribe 3 recomendaciones o "tips" prácticos y sencillos para que la familia aplique en casa para mejorar la calidad de vida del paciente. Usa lenguaje coloquial y motivador, no técnico.`;
    }

    const result = await callGemini(prompt);
    onResult(result);
    setLoading(false);
  };

  const icons = {
    improve: <Sparkles size={14} />,
    summarize: <FileText size={14} />,
    objectives: <Activity size={14} />,
    activities: <Lightbulb size={14} />,
    risks: <ShieldAlert size={14} />,
    family: <HeartHandshake size={14} />
  };

  const labels = {
    improve: "Mejorar Redacción",
    summarize: "Generar Conclusión",
    objectives: "Sugerir Objetivos",
    activities: "Sugerir Actividades",
    risks: "Detectar Riesgos",
    family: "Tips para Familia"
  };

  const styles = {
    risks: "ai_alert",
    family: "ai_soft",
    default: "ai"
  };

  return (
    <Button
      variant={styles[type] || styles.default}
      onClick={handleClick}
      disabled={loading || disabled}
      className="text-xs px-3 py-1 h-8 whitespace-nowrap"
    >
      {loading ? <Loader2 className="animate-spin" size={14} /> : icons[type]}
      <span className="hidden sm:inline ml-1">{loading ? "Generando..." : labels[type]}</span>
    </Button>
  );
};

const Input = ({ label, value, onChange, type = "text", disabled = false, placeholder = "" }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-50"
    />
  </div>
);

const TextArea = ({ label, value, onChange, disabled = false, rows = 4, placeholder = "", showAiImprove = false }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between items-end mb-1">
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
        <span>{label}</span>
        {disabled && <span className="text-red-400 font-normal normal-case flex items-center gap-1"><Lock size={10} /> Solo lectura</span>}
      </label>}
      {showAiImprove && !disabled && (
        <GeminiButton type="improve" contextData={value} onResult={(text) => onChange({ target: { value: text } })} />
      )}
    </div>
    <textarea
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      placeholder={placeholder}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-y disabled:bg-gray-50"
    />
  </div>
);

const Select = ({ label, value, onChange, options, disabled = false }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>}
    <select value={value} onChange={onChange} disabled={disabled} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white disabled:bg-gray-50">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);


// --- FORMULARIOS ---

const canEdit = (userRole, targetRole) => {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true;
  return userRole === targetRole;
};

const FormEvolucion = ({ data, onChange, userRole, readOnly = false }) => {
  const areas = [
    { key: 'area_orientadora', label: 'Área Orientadora', role: ROLES.ORIENTADORA },
    { key: 'area_psicologia', label: 'Área Psicología', role: ROLES.PSICOLOGIA },
    { key: 'area_trabajo_social', label: 'Área Trabajo Social', role: ROLES.TRABAJO_SOCIAL },
    { key: 'area_psiquiatria', label: 'Área Psiquiatría', role: ROLES.PSIQUIATRIA },
    { key: 'area_clinica', label: 'Área Clínica Médica', role: ROLES.ENFERMERIA },
    { key: 'area_nutricion', label: 'Área Nutrición', role: ROLES.NUTRICION },
    { key: 'area_fonoaudiologia', label: 'Área Fonoaudiología', role: ROLES.FONOAUDIOLOGIA },
    { key: 'area_terapia_ocupacional', label: 'Área Terapia Ocupacional', role: ROLES.TERAPIA_OCUPACIONAL },
    { key: 'taller_plastica', label: 'Taller de Plástica', role: ROLES.TALLER_PLASTICA },
    { key: 'taller_radio', label: 'Taller de Radio', role: ROLES.TALLER_RADIO },
    { key: 'taller_efa', label: 'Taller de Educación Física Adaptada', role: ROLES.EDUCACION_FISICA },
    { key: 'taller_expresion', label: 'Taller de Expresión Corporal', role: ROLES.TALLER_EXPRESION },
    { key: 'taller_musica', label: 'Taller de Música', role: ROLES.TALLER_MUSICA },
    { key: 'taller_psicomotricidad', label: 'Taller Psicomotricidad', role: ROLES.TALLER_PSICOMOTRICIDAD },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
        <Input label="Período" value={data.periodo || ''} onChange={e => onChange('periodo', e.target.value)} disabled={readOnly} placeholder="Ej: Septiembre-Octubre 2025" />
        <Input label="Diagnóstico" value={data.diagnostico || ''} onChange={e => onChange('diagnostico', e.target.value)} disabled={readOnly} />
      </div>
      {areas.map(area => (
        <div key={area.key} className={`p-4 rounded-lg border ${canEdit(userRole, area.role) ? 'bg-white border-teal-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
          <TextArea label={area.label} value={data[area.key] || ''} onChange={e => onChange(area.key, e.target.value)} disabled={readOnly || !canEdit(userRole, area.role)} placeholder={`Evolución del ${area.label}...`} rows={5} showAiImprove={true} />
        </div>
      ))}
    </div>
  );
};

const FormAdmision = ({ data, onChange, userRole, readOnly = false }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
      <Input label="Fecha Admisión" type="date" value={data.fecha_admision || ''} onChange={e => onChange('fecha_admision', e.target.value)} disabled={readOnly} />
      <Input label="Afiliado N°" value={data.afiliado || ''} onChange={e => onChange('afiliado', e.target.value)} disabled={readOnly} />
      <Input label="Diagnóstico (CIE-10)" value={data.diagnostico_cie || ''} onChange={e => onChange('diagnostico_cie', e.target.value)} disabled={readOnly} />
    </div>
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Antecedentes</h3>
      <TextArea label="Anamnesis General" value={data.anamnesis || ''} onChange={e => onChange('anamnesis', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.PSICOLOGIA)} rows={6} showAiImprove={true} />
    </div>
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-bold text-lg text-teal-700">Psicología</h3>
      <TextArea label="Estado Actual" value={data.psico_estado || ''} onChange={e => onChange('psico_estado', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.PSICOLOGIA)} showAiImprove={true} />
      <TextArea label="Conclusión" value={data.psico_conclusion || ''} onChange={e => onChange('psico_conclusion', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.PSICOLOGIA)} />
    </div>
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-bold text-lg text-teal-700">Trabajo Social</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextArea label="Dinámica Familiar" value={data.social_familia || ''} onChange={e => onChange('social_familia', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.TRABAJO_SOCIAL)} showAiImprove={true} />
        <TextArea label="Situación Económica" value={data.social_economica || ''} onChange={e => onChange('social_economica', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.TRABAJO_SOCIAL)} showAiImprove={true} />
      </div>
    </div>
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-bold text-lg text-teal-700">Terapia Ocupacional</h3>
      <TextArea label="AVD Básicas" value={data.to_avd || ''} onChange={e => onChange('to_avd', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.TERAPIA_OCUPACIONAL)} showAiImprove={true} />
      <TextArea label="AVD Instrumentales" value={data.to_aivd || ''} onChange={e => onChange('to_aivd', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.TERAPIA_OCUPACIONAL)} showAiImprove={true} />
    </div>
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-bold text-lg text-teal-700">Nutrición</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Input label="Peso (kg)" value={data.nutri_peso || ''} onChange={e => onChange('nutri_peso', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.NUTRICION)} />
        <Input label="Talla (m)" value={data.nutri_talla || ''} onChange={e => onChange('nutri_talla', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.NUTRICION)} />
        <Input label="IMC" value={data.nutri_imc || ''} onChange={e => onChange('nutri_imc', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.NUTRICION)} />
        <Input label="Diagnóstico Nutricional" value={data.nutri_dx || ''} onChange={e => onChange('nutri_dx', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.NUTRICION)} />
      </div>
      <TextArea label="Plan Alimentario" value={data.nutri_plan || ''} onChange={e => onChange('nutri_plan', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.NUTRICION)} />
    </div>

    <div className="space-y-4 border-t pt-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-orange-800 flex items-center gap-2"><ShieldAlert size={20} /> Análisis de Riesgos (IA)</h3>
        {!readOnly && (
          <GeminiButton type="risks" contextData={data} contextExtra={data.diagnostico_cie} onResult={(text) => onChange('analisis_riesgos', text)} />
        )}
      </div>
      <TextArea label="Riesgos Detectados y Medidas Preventivas" value={data.analisis_riesgos || ''} onChange={e => onChange('analisis_riesgos', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.ENFERMERIA)} rows={3} />
    </div>

    <div className="space-y-4 border-t pt-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">Conclusión Interdisciplinaria</h3>
        {!readOnly && (
          <GeminiButton type="summarize" contextData={data} onResult={(text) => onChange('conclusion_final', text)} />
        )}
      </div>
      <TextArea label="Resumen" value={data.conclusion_final || ''} onChange={e => onChange('conclusion_final', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.ORIENTADORA)} rows={4} showAiImprove={true} />
    </div>
  </div>
);

const FormSemestral = ({ data, onChange, userRole, readOnly = false }) => {
  const areasCif = [
    { key: 'cif_orientadora', label: 'Área Orientadora', role: ROLES.ORIENTADORA },
    { key: 'cif_psicologia', label: 'Área Psicología', role: ROLES.PSICOLOGIA },
    { key: 'cif_social', label: 'Trabajo Social', role: ROLES.TRABAJO_SOCIAL },
    { key: 'cif_medica', label: 'Clínica Médica', role: ROLES.ENFERMERIA },
    { key: 'cif_nutricion', label: 'Nutrición', role: ROLES.NUTRICION },
    { key: 'cif_fono', label: 'Fonoaudiología', role: ROLES.FONOAUDIOLOGIA },
    { key: 'cif_to', label: 'Terapia Ocupacional', role: ROLES.TERAPIA_OCUPACIONAL },
    { key: 'cif_efa', label: 'Educación Física', role: ROLES.EDUCACION_FISICA },
    { key: 'cif_plastica', label: 'Taller de Plástica', role: ROLES.TALLER_PLASTICA },
    { key: 'cif_musica', label: 'Taller de Música', role: ROLES.TALLER_MUSICA },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm text-blue-800 mb-4">
        <strong>Nota:</strong> Formato CIF (Funciones, Estructuras, Actividad y Participación).
      </div>
      {areasCif.map(area => (
        <div key={area.key} className={`p-4 rounded-lg border ${canEdit(userRole, area.role) ? 'bg-white border-teal-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
          <TextArea label={area.label} value={data[area.key] || ''} onChange={e => onChange(area.key, e.target.value)} disabled={readOnly || !canEdit(userRole, area.role)} placeholder={`Evaluación CIF...`} rows={5} showAiImprove={true} />
        </div>
      ))}

      <div className="space-y-4 border-t pt-6 bg-emerald-50 p-4 rounded-lg border border-emerald-100 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-emerald-800 flex items-center gap-2"><HeartHandshake size={20} /> Guía para la Familia (IA)</h3>
          {!readOnly && (
            <GeminiButton type="family" contextData={JSON.stringify(data)} contextExtra={"Paciente en Centro de Día"} onResult={(text) => onChange('guia_familia', text)} />
          )}
        </div>
        <p className="text-xs text-emerald-600 mb-2">Genera recomendaciones prácticas basadas en el informe técnico para compartir con la familia.</p>
        <TextArea label="Recomendaciones para el Hogar" value={data.guia_familia || ''} onChange={e => onChange('guia_familia', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.ORIENTADORA)} rows={4} />
      </div>
    </div>
  );
};

const FormPlanificacion = ({ data, diagnosis, onChange, userRole, readOnly = false }) => {
  const areasPlan = [
    { key: 'obj_psicologia', label: 'Obj. Psicología', role: ROLES.PSICOLOGIA },
    { key: 'obj_social', label: 'Obj. Trabajo Social', role: ROLES.TRABAJO_SOCIAL },
    { key: 'obj_to', label: 'Obj. Terapia Ocupacional', role: ROLES.TERAPIA_OCUPACIONAL },
    { key: 'obj_fono', label: 'Obj. Fonoaudiología', role: ROLES.FONOAUDIOLOGIA },
    { key: 'obj_nutricion', label: 'Obj. Nutrición', role: ROLES.NUTRICION },
    { key: 'obj_medica', label: 'Obj. Médica', role: ROLES.ENFERMERIA },
    { key: 'obj_plastica', label: 'Obj. Taller Plástica', role: ROLES.TALLER_PLASTICA },
    { key: 'obj_cocina', label: 'Obj. Taller Cocina', role: ROLES.TERAPIA_OCUPACIONAL },
    { key: 'obj_radio', label: 'Obj. Taller Radio', role: ROLES.TALLER_RADIO },
    { key: 'obj_efa', label: 'Obj. Educ. Física', role: ROLES.EDUCACION_FISICA },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
        <Input label="Período Planificación" value={data.periodo || ''} onChange={e => onChange('periodo', e.target.value)} disabled={readOnly} placeholder="Julio-Diciembre 2025" />
        <Input label="Proyecto de Sala" value={data.proyecto || ''} onChange={e => onChange('proyecto', e.target.value)} disabled={readOnly} />
      </div>
      <div className="p-4 bg-white border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Objetivo General</label>
          {!readOnly && (
            <GeminiButton type="objectives" contextData={data.proyecto} contextExtra={diagnosis} onResult={(text) => onChange('obj_general', text)} />
          )}
        </div>
        <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={data.obj_general || ''} onChange={e => onChange('obj_general', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.ORIENTADORA)} rows={3} />
      </div>
      <div className="p-4 bg-white border rounded-lg">
        <TextArea label="Objetivos Específicos" value={data.obj_especificos || ''} onChange={e => onChange('obj_especificos', e.target.value)} disabled={readOnly || !canEdit(userRole, ROLES.ORIENTADORA)} rows={5} showAiImprove={true} />
      </div>
      <h3 className="font-bold text-lg mt-6 mb-2 px-2 border-b">Objetivos por Áreas</h3>
      <div className="grid grid-cols-1 gap-4">
        {areasPlan.map(area => (
          <div key={area.key} className="relative">
            {!readOnly && canEdit(userRole, area.role) && area.label.includes('Taller') && (
              <div className="absolute right-0 top-0 z-10">
                <GeminiButton type="activities" contextData={area.label} contextExtra={diagnosis} onResult={(text) => onChange(area.key, (data[area.key] || '') + '\n' + text)} />
              </div>
            )}
            <TextArea label={area.label} value={data[area.key] || ''} onChange={e => onChange(area.key, e.target.value)} disabled={readOnly || !canEdit(userRole, area.role)} rows={3} showAiImprove={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- VISTA IMPRESIÓN ---

const PrintView = ({ report, onClose }) => {
  useEffect(() => { setTimeout(() => window.print(), 2000); }, []);
  const renderFields = () => {
    return Object.entries(report.content).map(([key, value]) => {
      let title = key.replace(/_/g, ' ').toUpperCase();
      if (key.includes('area_')) title = key.replace('area_', 'ÁREA ').toUpperCase();
      if (key.includes('taller_')) title = key.replace('taller_', 'TALLER DE ').toUpperCase();
      if (key.includes('cif_')) title = key.replace('cif_', 'ÁREA ').toUpperCase();
      if (key.includes('obj_')) title = key.replace('obj_', 'OBJETIVOS ').toUpperCase();
      if (key === 'analisis_riesgos') title = 'ANÁLISIS DE RIESGOS (AUDITORÍA)';
      if (key === 'guia_familia') title = 'GUÍA DE RECOMENDACIONES PARA LA FAMILIA';
      if (key === 'psico_estado') title = 'ESTADO ACTUAL';
      if (key === 'psico_conclusion') title = 'CONCLUSIÓN';
      if (key === 'social_familia') title = 'DINÁMICA FAMILIAR';
      if (key === 'social_economica') title = 'SITUACIÓN ECONÓMICA';
      if (key === 'to_avd') title = 'AVD BÁSICAS';
      if (key === 'to_aivd') title = 'AVD INSTRUMENTALES';
      if (key === 'nutri_peso') title = 'PESO (kg)';
      if (key === 'nutri_talla') title = 'TALLA (m)';
      if (key === 'nutri_imc') title = 'IMC';
      if (key === 'nutri_dx') title = 'DIAGNÓSTICO NUTRICIONAL';
      if (key === 'nutri_plan') title = 'PLAN ALIMENTARIO';
      if (key === 'conclusion_final') title = 'RESUMEN';

      return (
        <div key={key} className="mb-6 break-inside-avoid">
          <h4 className="font-bold text-gray-800 border-b border-gray-300 mb-2 text-sm">{title}</h4>
          <p className="text-gray-700 text-sm whitespace-pre-wrap text-justify leading-relaxed">{value || 'No especificado'}</p>
        </div>
      )
    })
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[210mm] mx-auto p-[20mm] bg-white print-content">
        <div className="text-center mb-6">
          <img src="/logo-sangenaro.png" alt="San Gennaro" className="h-16 mx-auto" />
        </div>
        <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase">{FORM_TYPES[report.type]}</h1>
            <h2 className="text-lg">{report.patientName}</h2>
          </div>
          <div className="text-right text-sm">
            <p><strong>DNI:</strong> {report.patientDni}</p>
            <p><strong>Fecha:</strong> {report.date}</p>
            <p><strong>Obra Social:</strong> {report.socialSecurity}</p>
          </div>
        </div>
        <div className="mb-6 p-4 bg-gray-50 border rounded print:border-none print:p-0">
          <p className="text-sm"><strong>Diagnóstico:</strong> {report.patientDiagnosis}</p>
          {report.content.periodo && <p className="text-sm"><strong>Período:</strong> {report.content.periodo}</p>}
        </div>
        <div>{renderFields()}</div>
        <div className="mt-12 pt-8 border-t border-gray-300 flex justify-around print:flex">
          <div className="text-center">
            <div className="w-40 border-b border-black mb-2"></div>
            <p className="text-xs">Firma Profesional</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-black mb-2"></div>
            <p className="text-xs">Firma Dirección</p>
          </div>
        </div>
      </div>
      <div className="fixed top-4 right-4 print:hidden flex gap-2">
        <Button onClick={onClose} variant="secondary">Cerrar</Button>
        <Button onClick={async () => {
          let logoBase64 = '';
          try {
            const logoRes = await fetch('/logo-sangenaro.png');
            const logoBlob = await logoRes.blob();
            logoBase64 = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(logoBlob);
            });
          } catch (e) { /* sin logo */ }

          const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;font-size:12pt}h1{font-size:18pt}h4{font-size:13pt;border-bottom:1px solid #ccc;padding-bottom:4px}p{text-align:justify;line-height:1.6}.logo{text-align:center;margin-bottom:20px}</style></head>
            <body>
              <div class='logo'>${logoBase64 ? `<img src='${logoBase64}' width='300'/>` : ''}</div>
              <h1>${FORM_TYPES[report.type]}</h1>
              <h2>${report.patientName || ''}</h2>
              <p><b>DNI:</b> ${report.patientDni || ''} | <b>Fecha:</b> ${report.date || ''} | <b>Obra Social:</b> ${report.socialSecurity || ''}</p>
              <p><b>Diagnostico:</b> ${report.patientDiagnosis || ''}</p>
              <hr/>
              ${Object.entries(report.content || {}).map(([k, v]) => {
            return `<h4>${k.replace(/_/g, ' ')}</h4><p>${v || 'No especificado'}</p>`;
          }).join('')}
              <br/><br/>
              <table width='100%'><tr><td align='center'>___________________<br/><small>Firma Profesional</small></td><td align='center'>___________________<br/><small>Firma Direccion</small></td></tr></table>
            </body></html>`;
          const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
          saveAs(blob, `${report.patientName || 'informe'}_${report.type}.doc`);
        }} variant="primary"><FileText size={16} /> Descargar Word</Button>
        <Button onClick={() => window.print()} variant="primary"><Printer size={16} /> Imprimir</Button>
      </div>
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; }
          .print-content { width: 100%; max-width: none; margin: 0; padding: 20mm; box-shadow: none; }
          button, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- APP PRINCIPAL ---

const App = () => {
  const [appUser, setAppUserState] = useState(() => {
    const saved = localStorage.getItem('appUser');
    return saved ? JSON.parse(saved) : null;
  });

  const setAppUser = (user) => {
    if (user) {
      localStorage.setItem('appUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('appUser');
    }
    setAppUserState(user);
  };
  const [view, setView] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showPrint, setShowPrint] = useState(false);
  const [newReportMeta, setNewReportMeta] = useState({
    patientId: '', type: 'EVOLUCION'
  });
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [tempPatient, setTempPatient] = useState({ name: '', dni: '', dob: '', socialSecurity: '', diagnosis: '', room_id: '' });

  // Cargar datos iniciales
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: roomsData } = await supabase.from('rooms').select('*').order('name');
    const { data: patientsData } = await supabase.from('patients').select('*, rooms(name)').order('name');
    const { data: reportsData } = await supabase.from('reports').select('*, patients(*)').order('created_at', { ascending: false });

    if (roomsData) setRooms(roomsData);
    if (patientsData) setPatients(patientsData);
    if (reportsData) setReports(reportsData.map(r => ({
      ...r,
      patientName: r.patients?.name,
      patientDni: r.patients?.dni,
      patientDiagnosis: r.patients?.diagnosis,
      socialSecurity: r.patients?.social_security,
      date: new Date(r.created_at).toLocaleDateString()
    })));
  };

  const handleCreateReport = async () => {
    let patientId = newReportMeta.patientId;

    if (isNewPatient) {
      if (!tempPatient.name) return alert('Nombre de paciente requerido');
      const { data, error } = await supabase.from('patients').insert([tempPatient]).select().single();
      if (error) return alert("Error al crear paciente: " + error.message);
      patientId = data.id;
    }

    if (!patientId) return alert('Seleccione un paciente');

    const newDoc = {
      patient_id: patientId,
      type: newReportMeta.type,
      content: {},
      creator_name: appUser.name,
      status: 'draft'
    };

    const { data, error } = await supabase.from('reports').insert([newDoc]).select('*, patients(*)').single();

    if (error) return alert("Error al crear reporte: " + error.message);

    const formattedDoc = {
      ...data,
      patientName: data.patients?.name,
      patientDni: data.patients?.dni,
      patientDiagnosis: data.patients?.diagnosis,
      socialSecurity: data.patients?.social_security,
      date: new Date(data.created_at).toLocaleDateString()
    };

    setReports([formattedDoc, ...reports]);
    setCurrentReport(formattedDoc);
    setView('edit');
    setIsNewPatient(false);
    setTempPatient({ name: '', dni: '', dob: '', socialSecurity: '', diagnosis: '', room_id: '' });
  };

  const handleSaveReport = async () => {
    if (!currentReport) return;

    const { error } = await supabase
      .from('reports')
      .update({
        content: currentReport.content,
        updated_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', currentReport.id);

    if (error) return alert("Error al guardar: " + error.message);

    alert("Informe guardado correctamente");
    fetchInitialData();
    setView('dashboard');
  };
  const downloadReportAsWord = async (report) => {
    let logoBase64 = '';
    try {
      const logoRes = await fetch('/logo-sangenaro.png');
      const logoBlob = await logoRes.blob();
      logoBase64 = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });
    } catch (e) { /* sin logo */ }

    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;font-size:12pt}h1{font-size:18pt}h4{font-size:13pt;border-bottom:1px solid #ccc;padding-bottom:4px}p{text-align:justify;line-height:1.6}.logo{text-align:center;margin-bottom:20px}</style></head>
      <body>
        <div class='logo'>${logoBase64 ? `<img src='${logoBase64}' width='300'/>` : ''}</div>
        <h1>${FORM_TYPES[report.type]}</h1>
        <h2>${report.patientName || ''}</h2>
        <p><b>DNI:</b> ${report.patientDni || ''} | <b>Fecha:</b> ${report.date || ''} | <b>Obra Social:</b> ${report.socialSecurity || ''}</p>
        <p><b>Diagnostico:</b> ${report.patientDiagnosis || ''}</p>
        <hr/>
        ${Object.entries(report.content || {}).map(([k, v]) => {
      return `<h4>${k.replace(/_/g, ' ')}</h4><p>${v || 'No especificado'}</p>`;
    }).join('')}
        <br/><br/>
        <table width='100%'><tr><td align='center'>___________________<br/><small>Firma Profesional</small></td><td align='center'>___________________<br/><small>Firma Direccion</small></td></tr></table>
      </body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    saveAs(blob, `${report.patientName || 'informe'}_${report.type}.doc`);
  };

  // --- Helper: obtener token de Google con GIS ---
  const getGoogleToken = () => {
    return new Promise((resolve, reject) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            reject(tokenResponse);
          } else {
            resolve(tokenResponse);
          }
        },
      });
      tokenClient.requestAccessToken();
    });
  };

  // --- Helper: inicializar gapi.client con Drive ---
  const initGapiClient = async (accessToken) => {
    await new Promise((resolve) => window.gapi.load('client', resolve));
    await window.gapi.client.init({});
    window.gapi.client.setToken({ access_token: accessToken });
    await window.gapi.client.load('drive', 'v3');
  };

  const syncRoomWithDrive = async (roomId, driveFolderId) => {
    if (!driveFolderId) return;
    try {
      const tokenResponse = await getGoogleToken();
      await initGapiClient(tokenResponse.access_token);

      const response = await window.gapi.client.drive.files.list({
        q: `'${driveFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
      });

      const driveFolders = response.result.files || [];
      for (const folder of driveFolders) {
        await supabase.from('patients').upsert({
          name: folder.name,
          room_id: roomId,
          drive_folder_id: folder.id
        }, { onConflict: 'name' });
      }

      fetchInitialData();
    } catch (error) {
      console.error("Error sincronizando con Drive:", error);
    }
  };

  const syncMasterFolder = async (masterFolderId) => {
    if (!masterFolderId) return;
    try {
      const tokenResponse = await getGoogleToken();
      const accessToken = tokenResponse.access_token;
      await initGapiClient(accessToken);

      // 1. Listar Salas
      const response = await window.gapi.client.drive.files.list({
        q: `'${masterFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
      });

      const driveSalas = response.result.files || [];
      if (driveSalas.length === 0) return;

      let totalPacientes = 0;

      for (const dSala of driveSalas) {
        const { data: room } = await supabase
          .from('rooms')
          .upsert({ name: dSala.name, drive_folder_id: dSala.id }, { onConflict: 'name' })
          .select()
          .single();

        if (room) {
          // 2. Buscar la carpeta "inf. finalis 2025" dentro de la Sala
          const resSubfolders = await window.gapi.client.drive.files.list({
            q: `'${dSala.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)',
          });

          const subfolders = resSubfolders.result.files || [];
          const infFolder = subfolders.find(f =>
            f.name.toLowerCase().includes('inf') && f.name.toLowerCase().includes('final')
          );

          if (infFolder) {
            // 3. Listar Google Docs dentro de la carpeta
            const resFiles = await window.gapi.client.drive.files.list({
              q: `'${infFolder.id}' in parents and trashed = false`,
              fields: 'files(id, name, mimeType)',
            });

            const files = resFiles.result.files || [];
            for (const file of files) {
              try {
                let docText = '';
                const isGoogleDoc = file.mimeType === 'application/vnd.google-apps.document';

                if (isGoogleDoc) {
                  // Google Doc nativo: exportar como texto
                  const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
                  const res = await fetch(exportUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                  if (res.ok) docText = await res.text();
                } else {
                  // Archivo .docx subido: descargar y parsear con mammoth
                  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
                  const res = await fetch(downloadUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                  if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    docText = result.value;
                  }
                }

                if (!docText) continue;

                // 5. Extraer datos con busqueda de patrones (sin IA)
                const extractField = (text, patterns) => {
                  for (const p of patterns) {
                    const match = text.match(p);
                    if (match && match[1]) return match[1].trim();
                  }
                  return '';
                };

                const nombre = extractField(docText, [
                  /(?:nombre\s*(?:y\s*apellido|completo)?)\s*[:|-]\s*(.+)/i,
                  /(?:apellido\s*y\s*nombre)\s*[:|-]\s*(.+)/i,
                  /(?:paciente)\s*[:|-]\s*(.+)/i
                ]) || file.name.replace(/\.(docx?|pdf|xlsx?)$/i, '').trim();

                const dni = extractField(docText, [
                  /(?:d\.?n\.?i\.?|documento)\s*[:|\-\s]\s*([\d.]+)/i,
                  /(?:n[°ºo]?\s*(?:de\s*)?(?:doc|documento))\s*[:|-]\s*([\d.]+)/i
                ]);

                const obraSocial = extractField(docText, [
                  /(?:obra\s*social|prepaga|cobertura)\s*[:|-]\s*(.+)/i,
                  /(?:o\.?\s*s\.?)\s*[:|-]\s*(.+)/i
                ]);

                const diagnostico = extractField(docText, [
                  /(?:diagn[oó]stico|dx)\s*[:|-]\s*(.+)/i,
                  /(?:motivo\s*de\s*(?:internaci[oó]n|ingreso|consulta))\s*[:|-]\s*(.+)/i
                ]);

                if (nombre) {
                  await supabase.from('patients').upsert({
                    name: nombre,
                    dni: dni || null,
                    social_security: obraSocial || null,
                    diagnosis: diagnostico || null,
                    room_id: room.id,
                    drive_folder_id: infFolder.id
                  }, { onConflict: 'name' });
                  totalPacientes++;
                }
              } catch (fileError) {
                console.error(`Error procesando ${file.name}:`, fileError);
              }
            }
          }
        }
      }

      console.log(`Sincronizacion completada: ${totalPacientes} pacientes procesados`);
      fetchInitialData();
      setView('dashboard');
    } catch (error) {
      console.error("Error en sincronizacion:", error);
    }
  };

  const updateRoomDriveId = async (roomId, folderId) => {
    const { error } = await supabase.from('rooms').update({ drive_folder_id: folderId }).eq('id', roomId);
    if (error) alert("Error: " + error.message);
    else fetchInitialData();
  };

  const filteredReports = useMemo(() => {
    if (!filterText) return reports;
    const lower = filterText.toLowerCase();
    return reports.filter(r => {
      const patient = patients.find(p => p.id === r.patient_id);
      const roomName = patient ? (rooms.find(rm => rm.id === patient.room_id)?.name || '') : '';
      return (
        r.patientName?.toLowerCase().includes(lower) ||
        r.type?.toLowerCase().includes(lower) ||
        (FORM_TYPES[r.type] || '').toLowerCase().includes(lower) ||
        (patient?.dni || '').toLowerCase().includes(lower) ||
        (patient?.social_security || '').toLowerCase().includes(lower) ||
        (patient?.diagnosis || '').toLowerCase().includes(lower) ||
        roomName.toLowerCase().includes(lower)
      );
    });
  }, [reports, filterText, patients, rooms]);


  if (showPrint && currentReport) return <PrintView report={currentReport} onClose={() => setShowPrint(false)} />;

  if (!appUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-teal-600 text-white p-3 rounded-xl inline-block mb-4">
              <Activity className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">ClinicaConnect</h1>
            <p className="text-gray-500 text-sm mt-1">Gestion Interdisciplinaria</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.userName.value.trim();
            const role = e.target.userRole.value;
            if (!name) return;
            setAppUser({ id: Date.now().toString(), name, role });
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input name="userName" type="text" required placeholder="Ej: Dra. Maria Lopez"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol profesional</label>
              <select name="userRole" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-teal-600 text-white p-2 rounded-lg"><Activity className="w-6 h-6" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">ClínicaConnect</h1>
              <span className="text-xs text-gray-500">Gestión Interdisciplinaria</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('manage-rooms')} className="text-gray-500" title="Configurar Salas">
              <Settings size={20} />
            </Button>
            <div className="text-right hidden md:block border-l pl-4">
              <p className="text-sm font-medium text-gray-700">{appUser.name}</p>
              <p className="text-xs text-teal-600 font-bold uppercase">{ROLE_LABELS[appUser.role]}</p>
            </div>
            <Button variant="secondary" onClick={() => setAppUser(null)} className="!p-2">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar por nombre, DNI, sala u obra social..." className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 outline-none" value={filterText} onChange={e => setFilterText(e.target.value)} />
              </div>
              <Button onClick={() => setView('create')}><Plus size={18} /> Nuevo Informe</Button>
            </div>
            <div className="grid gap-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-2 opacity-20" />
                  <p>No hay informes recientes</p>
                </div>
              ) : (
                filteredReports.map(report => (
                  <div key={report.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-full h-fit ${report.type === 'EVOLUCION' ? 'bg-blue-100 text-blue-600' : report.type === 'ADMISION' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{report.patients?.name || report.patientName}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="font-medium text-gray-700">{FORM_TYPES[report.type]}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Por: {report.creator_name || report.creatorName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="secondary" className="flex-1 md:flex-none text-xs" onClick={() => { setCurrentReport(report); setShowPrint(true); }}><Printer size={14} /> PDF</Button>
                      <Button variant="secondary" className="flex-1 md:flex-none text-xs" onClick={() => downloadReportAsWord(report)}><FileText size={14} /> Word</Button>
                      <Button variant="primary" className="flex-1 md:flex-none text-xs" onClick={() => { setCurrentReport(report); setView('edit'); }}>Ver / Editar</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-2">
              <Button variant="ghost" onClick={() => setView('dashboard')} className="!p-1 mr-2"><ChevronLeft /></Button>
              <h2 className="font-bold text-lg">Crear Nuevo Informe</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Button variant={!isNewPatient ? 'primary' : 'secondary'} className="flex-1 text-xs" onClick={() => setIsNewPatient(false)}>Paciente Existente</Button>
                <Button variant={isNewPatient ? 'primary' : 'secondary'} className="flex-1 text-xs" onClick={() => setIsNewPatient(true)}>Nuevo Paciente</Button>
              </div>

              {!isNewPatient ? (
                <>
                  <Select
                    label="Seleccionar Paciente"
                    value={newReportMeta.patientId}
                    onChange={e => setNewReportMeta({ ...newReportMeta, patientId: e.target.value })}
                    options={[{ value: '', label: 'Seleccione...' }, ...patients.map(p => ({ value: p.id, label: `${p.name} (DNI: ${p.dni || 'S/D'})` }))]}
                  />
                  {newReportMeta.patientId && (() => {
                    const p = patients.find(x => x.id === newReportMeta.patientId);
                    if (!p) return null;
                    const room = rooms.find(r => r.id === p.room_id);
                    return (
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm space-y-1">
                        <p><strong>Nombre:</strong> {p.name}</p>
                        <p><strong>DNI:</strong> {p.dni || 'No registrado'}</p>
                        <p><strong>Obra Social:</strong> {p.social_security || 'No registrada'}</p>
                        <p><strong>Diagnostico:</strong> {p.diagnosis || 'No registrado'}</p>
                        <p><strong>Sala:</strong> {room?.name || 'Sin asignar'}</p>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="space-y-4 p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <Input label="Nombre Completo" value={tempPatient.name} onChange={e => setTempPatient({ ...tempPatient, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="DNI" value={tempPatient.dni} onChange={e => setTempPatient({ ...tempPatient, dni: e.target.value })} />
                    <Input label="Fecha Nacimiento" type="date" value={tempPatient.dob} onChange={e => setTempPatient({ ...tempPatient, dob: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Obra Social" value={tempPatient.socialSecurity} onChange={e => setTempPatient({ ...tempPatient, socialSecurity: e.target.value })} />
                    <Select
                      label="Sala / Pabellón"
                      value={tempPatient.room_id}
                      onChange={e => setTempPatient({ ...tempPatient, room_id: e.target.value })}
                      options={[{ value: '', label: 'Seleccione Sala...' }, ...rooms.map(r => ({ value: r.id, label: r.name }))]}
                    />
                  </div>
                  <Input label="Diagnóstico de Base" value={tempPatient.diagnosis} onChange={e => setTempPatient({ ...tempPatient, diagnosis: e.target.value })} />
                </div>
              )}

              <div className="border-t pt-4">
                <Select
                  label="Tipo de Formulario"
                  value={newReportMeta.type}
                  onChange={e => setNewReportMeta({ ...newReportMeta, type: e.target.value })}
                  options={Object.entries(FORM_TYPES).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setView('dashboard')}>Cancelar</Button>
                <Button className="flex-1" onClick={handleCreateReport}>Crear y Editar</Button>
              </div>
            </div>
          </div>
        )}

        {view === 'edit' && currentReport && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh] flex flex-col">
            <div className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setView('dashboard')} className="!p-1"><ChevronLeft /></Button>
                <div>
                  <h2 className="font-bold text-gray-800">{FORM_TYPES[currentReport.type]}</h2>
                  <p className="text-xs text-gray-500">{currentReport.patientName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowPrint(true)}><Printer size={16} /> <span className="hidden sm:inline">Imprimir</span></Button>
                <Button variant="secondary" onClick={() => downloadReportAsWord(currentReport)}><FileText size={16} /> <span className="hidden sm:inline">Word</span></Button>
                <Button onClick={handleSaveReport}><Save size={16} /> <span className="hidden sm:inline">Guardar</span></Button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
              <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow-sm min-h-full">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-gray-500 block text-xs">Paciente</span><strong>{currentReport.patientName || '-'}</strong></div>
                  <div><span className="text-gray-500 block text-xs">DNI</span><strong>{currentReport.patientDni || '-'}</strong></div>
                  <div><span className="text-gray-500 block text-xs">Obra Social</span><strong>{currentReport.socialSecurity || '-'}</strong></div>
                  <div><span className="text-gray-500 block text-xs">Diagnostico</span><strong>{currentReport.patientDiagnosis || '-'}</strong></div>
                </div>
                {currentReport.type === 'EVOLUCION' && <FormEvolucion data={currentReport.content} onChange={(key, val) => setCurrentReport(prev => ({ ...prev, content: { ...prev.content, [key]: val } }))} userRole={appUser.role} />}
                {currentReport.type === 'ADMISION' && <FormAdmision data={currentReport.content} onChange={(key, val) => setCurrentReport(prev => ({ ...prev, content: { ...prev.content, [key]: val } }))} userRole={appUser.role} />}
                {currentReport.type === 'SEMESTRAL' && <FormSemestral data={currentReport.content} onChange={(key, val) => setCurrentReport(prev => ({ ...prev, content: { ...prev.content, [key]: val } }))} userRole={appUser.role} />}
                {/* Pasamos el diagnóstico para que la IA tenga contexto en los talleres */}
                {currentReport.type === 'PLANIFICACION' && <FormPlanificacion data={currentReport.content} diagnosis={currentReport.diagnosis} onChange={(key, val) => setCurrentReport(prev => ({ ...prev, content: { ...prev.content, [key]: val } }))} userRole={appUser.role} />}

                {/* VISOR DE DRIVE PARA EL PACIENTE */}
                {currentReport.patient_id && (
                  <FileViewer folderId={patients.find(p => p.id === currentReport.patient_id)?.drive_folder_id} />
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'manage-rooms' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Button variant="ghost" onClick={() => setView('dashboard')} className="!p-1"><ChevronLeft /></Button>
                Configuración de Salas y Drive
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-teal-500">
              <h3 className="font-bold text-teal-700 mb-2 flex items-center gap-2">
                <RefreshCw size={20} className="text-teal-500" /> Sincronización Inteligente 2025
              </h3>
              <p className="text-sm text-gray-600 mb-4">Pega el ID de la carpeta principal que contiene todas las salas para importar todo automáticamente.</p>
              <div className="flex gap-2">
                <input
                  id="master-folder-input"
                  type="text"
                  className="flex-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ID de Carpeta Maestra"
                  defaultValue="1CgbJ2abIpjUGweYtyYJ9drTbru8pvjlk"
                />
                <Button onClick={() => syncMasterFolder(document.getElementById('master-folder-input').value)}>
                  Escanear Todo
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {rooms.map(room => (
                <div key={room.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-teal-700">{room.name}</h3>
                      <div className="mt-2 flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Google Drive Folder ID</label>
                          <input
                            type="text"
                            className="w-full text-sm border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="Ej: 1By_xabcde123..."
                            defaultValue={room.drive_folder_id || ''}
                            onBlur={(e) => updateRoomDriveId(room.id, e.target.value)}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          className="mt-4 !py-1 text-xs h-8"
                          onClick={() => syncRoomWithDrive(room.id, room.drive_folder_id)}
                        >
                          <RefreshCw size={14} /> Sincronizar
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border text-center min-w-[120px]">
                      <span className="text-2xl font-bold text-gray-700">
                        {patients.filter(p => p.room_id === room.id).length}
                      </span>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Pacientes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
              <FolderOpen className="text-blue-500 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold">¿Cómo funciona la sincronización?</p>
                <p>Al hacer clic en "Sincronizar", el sistema buscará todas las subcarpetas dentro del enlace de Drive. Cada carpeta se convertirá en un paciente en este sistema.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
