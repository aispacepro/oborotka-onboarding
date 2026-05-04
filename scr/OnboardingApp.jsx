import { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle, ChevronRight, ChevronLeft, Building2, Users, FileText, Shield, Send,
  Plus, Trash2, AlertCircle, Info, Loader2, Mail, Phone, Hash, Calendar, MapPin,
  X, Check, User, Briefcase, FileSignature, Sparkles, Clock, Eye, Download,
  ArrowRight, Search, ShieldCheck, KeyRound, Globe, BadgeCheck, AlertTriangle,
  HelpCircle, Pen, Archive, CircleDot
} from "lucide-react";

/* ============================================================================
   OBOROTKA.BY — ОНБОРДИНГ КЛИЕНТА (КРЕДИТОРА / ДОЛЖНИКА)
   Идентификация по факторингу для ЗАО «Нео Банк Азия»
   ----------------------------------------------------------------------------
   На основе:
   • Приложение 12 — Вопросник клиента-организации (ПОД/ФТ/FATCA, 5 разделов)
   • Согласие на проверку ОАИС/ФСЗН (персональные данные физлиц)
   • Согласие на сведения о правонарушениях (МВД)
   • Согласие БКИ (Кредитный регистр НБРБ)
   ============================================================================ */

const B = {
  accent: "#3B82F6", accentL: "#DBEAFE", accentD: "#2563EB",
  purple: "#8B5CF6", purpleL: "#EDE9FE",
  green: "#10B981", greenL: "#D1FAE5", greenD: "#059669",
  yellow: "#F59E0B", yellowL: "#FEF3C7",
  red: "#EF4444", redL: "#FEE2E2",
  orange: "#F97316", orangeL: "#FFEDD5",
  sidebar: "#0F172A",
  bg: "#F8FAFC", white: "#FFFFFF", border: "#E2E8F0",
  t1: "#0F172A", t2: "#475569", t3: "#94A3B8",
};

const BANK = { name: 'ЗАО «Нео Банк Азия»', address: 'г. Минск, ул. В. Хоружей, 20-2' };

/* ============================================================================
   STEPS - 7 ЭТАПОВ ОНБОРДИНГА
   ============================================================================ */
const STEPS = [
  { id: "start",        num: 1, title: "Начало",            shortTitle: "УНП",          icon: KeyRound,      desc: "Базовые данные компании" },
  { id: "company",      num: 2, title: "Анкета компании",   shortTitle: "Анкета",       icon: Building2,     desc: "Сведения об организации" },
  { id: "management",   num: 3, title: "Руководство",       shortTitle: "Руководство",  icon: Briefcase,     desc: "Директор, бухгалтер, представители" },
  { id: "owners",       num: 4, title: "Бенефициары",       shortTitle: "Владельцы",    icon: Users,         desc: "Учредители и бенефициарные владельцы" },
  { id: "fatca",        num: 5, title: "FATCA",             shortTitle: "FATCA",        icon: Globe,         desc: "Налоговая идентификация" },
  { id: "consents",     num: 6, title: "Согласия",          shortTitle: "Согласия",     icon: ShieldCheck,   desc: "Согласия физлиц на обработку данных" },
  { id: "sign",         num: 7, title: "Подписание ЭЦП",    shortTitle: "Подпись",      icon: FileSignature, desc: "Подписание анкеты ЭЦП" },
];

/* ============================================================================
   ОКЭД-СПРАВОЧНИК (часть популярных кодов)
   ============================================================================ */
const OKED_LIST = [
  { code: "23610", name: "Производство бетонных изделий" },
  { code: "46730", name: "Оптовая торговля стройматериалами" },
  { code: "41200", name: "Строительство зданий" },
  { code: "46900", name: "Неспециализированная оптовая торговля" },
  { code: "47190", name: "Розничная торговля" },
  { code: "49410", name: "Грузовые автоперевозки" },
  { code: "62010", name: "Разработка ПО" },
  { code: "62020", name: "Консультирование в области IT" },
  { code: "68200", name: "Аренда недвижимости" },
  { code: "70220", name: "Консультирование по управлению" },
  { code: "10110", name: "Производство мяса и мясопродуктов" },
  { code: "10510", name: "Производство молочных продуктов" },
];

/* ============================================================================
   COMPONENTS
   ============================================================================ */

const Card = ({ children, className = "", style }) => (
  <div className={`bg-white rounded-2xl border shadow-sm ${className}`} style={{ borderColor: B.border, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", size = "md", onClick, disabled, icon: Icon, className = "", type = "button" }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap";
  const sz = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" }[size];
  const vars = {
    primary: `text-white shadow-sm ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:-translate-y-0.5"}`,
    secondary: `bg-slate-100 text-slate-700 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200"}`,
    ghost: `text-slate-600 ${disabled ? "opacity-50" : "hover:bg-slate-100"}`,
    success: `text-white ${disabled ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-md"}`,
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: `border-2 ${disabled ? "opacity-50" : "hover:bg-slate-50"}`,
  }[variant];
  const bg =
    variant === "primary" ? { background: B.accent } :
    variant === "success" ? { background: B.green } :
    variant === "outline" ? { borderColor: B.border, color: B.t1 } :
    undefined;
  return (
    <button type={type} onClick={disabled ? undefined : onClick} className={`${base} ${sz} ${vars} ${className}`} style={bg}>
      {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />}
      {children}
    </button>
  );
};

const Field = ({ label, required, error, hint, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: B.t2 }}>
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="ml-1.5 font-normal text-[11px]" style={{ color: B.t3 }}>{hint}</span>}
    </label>
    {children}
    {error && <div className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</div>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", error, icon: Icon, suffix, ...p }) => (
  <div className="relative">
    {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: B.t3 }} />}
    <input
      type={type} value={value || ""} onChange={onChange} placeholder={placeholder}
      className={`w-full ${Icon ? "pl-10" : "pl-3.5"} ${suffix ? "pr-12" : "pr-3.5"} py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition`}
      style={{ borderColor: error ? B.red : B.border, color: B.t1 }}
      {...p}
    />
    {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: B.t3 }}>{suffix}</span>}
  </div>
);

const Select = ({ value, onChange, options, placeholder, error }) => (
  <select value={value || ""} onChange={onChange}
    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
    style={{ borderColor: error ? B.red : B.border, color: B.t1 }}>
    <option value="">{placeholder || "Выберите..."}</option>
    {options.map(o => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
  </select>
);

const Radio = ({ value, onChange, options, name }) => (
  <div className="flex flex-col gap-2">
    {options.map(o => {
      const v = typeof o === "string" ? o : o.value;
      const l = typeof o === "string" ? o : o.label;
      const checked = value === v;
      return (
        <label key={v} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition ${checked ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
          <input type="radio" name={name} checked={checked} onChange={() => onChange(v)} className="w-4 h-4" style={{ accentColor: B.accent }} />
          <span className="text-sm" style={{ color: B.t1 }}>{l}</span>
        </label>
      );
    })}
  </div>
);

const Checkbox = ({ checked, onChange, label, description }) => (
  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${checked ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: B.accent }} />
    <div className="flex-1">
      <div className="text-sm font-medium" style={{ color: B.t1 }}>{label}</div>
      {description && <div className="text-xs mt-0.5" style={{ color: B.t2 }}>{description}</div>}
    </div>
  </label>
);

const Hint = ({ children, type = "info" }) => {
  const cfg = {
    info:    { bg: B.accentL, c: B.accentD,  Icon: Info },
    warning: { bg: B.yellowL, c: B.yellow,   Icon: AlertTriangle },
    success: { bg: B.greenL,  c: B.greenD,   Icon: CheckCircle },
  }[type];
  const Icon = cfg.Icon;
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs" style={{ background: cfg.bg, color: cfg.c }}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
};

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? B.green : type === "error" ? B.red : B.accent;
  return (
    <div className="fixed top-6 right-6 z-[100]">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg" style={{ background: bg }}>
        {type === "success" ? <CheckCircle size={18} /> : <Info size={18} />}{message}
      </div>
    </div>
  );
};

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "auto", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px" }} onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl ${wide ? "w-full max-w-3xl" : "w-full max-w-xl"} flex flex-col`} style={{ maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold" style={{ color: B.t1 }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={20} style={{ color: B.t3 }} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

/* ============================================================================
   ШАПКА ОНБОРДИНГА
   ============================================================================ */
const Header = ({ savedAt }) => (
  <header className="bg-white border-b sticky top-0 z-30" style={{ borderColor: B.border }}>
    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: B.accent }}>O</div>
        <div>
          <div className="font-bold text-base" style={{ color: B.t1 }}>Oborotka.by</div>
          <div className="text-[11px] -mt-0.5" style={{ color: B.t3 }}>Факторинговая платформа · {BANK.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {savedAt && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: B.t3 }}>
            <CheckCircle size={13} style={{ color: B.green }} />Сохранено {savedAt}
          </div>
        )}
        <a href="#" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: B.accent }}>
          <HelpCircle size={14} /> Помощь
        </a>
      </div>
    </div>
  </header>
);

/* ============================================================================
   ПРОГРЕСС-БАР (top, под шапкой)
   ============================================================================ */
const ProgressBar = ({ currentIdx, completedSteps, onStepClick }) => {
  return (
    <div className="bg-white border-b" style={{ borderColor: B.border }}>
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = idx === currentIdx;
            const isDone = completedSteps.includes(step.id);
            const isClickable = isDone || idx < currentIdx;
            const colorBg = isDone ? B.green : isCurrent ? B.accent : "#F1F5F9";
            const colorText = isDone || isCurrent ? "white" : B.t3;
            return (
              <div key={step.id} className="flex items-center shrink-0">
                <button
                  onClick={() => isClickable && onStepClick(idx)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-1.5 ${isClickable ? "cursor-pointer" : "cursor-default"}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ background: colorBg, color: colorText }}>
                    {isDone ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <div className="text-[10px] font-semibold text-center max-w-[80px]" style={{ color: isCurrent ? B.t1 : B.t3 }}>
                    {step.shortTitle}
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="w-6 sm:w-12 h-0.5 mx-1 rounded-full transition-all -mt-5" style={{ background: completedSteps.includes(step.id) ? B.green : "#E2E8F0" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   STEP 1 — НАЧАЛО (УНП и роль)
   ============================================================================ */
const StepStart = ({ data, setData, errors, inviteFrom }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>
          {inviteFrom ? `Вас пригласили на платформу Oborotka.by — ${inviteFrom.name}` : "Регистрация на платформе"}
        </h2>
        <p className="text-sm" style={{ color: B.t2 }}>
          {inviteFrom
            ? `Компания ${inviteFrom.name} приглашает вас присоединиться к факторинговой платформе. Заполните анкету — это займёт 15-20 минут.`
            : "Заполните анкету для подключения к факторинговой платформе. Все данные передаются в зашифрованном виде в банк-партнёр."}
        </p>
      </div>

      {inviteFrom && (
        <Hint type="info">
          <strong>Кто вас пригласил:</strong> {inviteFrom.name} (УНП {inviteFrom.unp})<br />
          <strong>Тип отношений:</strong> вы будете {inviteFrom.role === "creditor" ? "получателем оплаты (кредитор)" : "плательщиком (должник)"} в факторинговых сделках.
        </Hint>
      )}

      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <KeyRound size={16} style={{ color: B.accent }} />Базовые данные
        </h3>
        <div className="space-y-4">
          <Field label="УНП организации" required error={errors.unp} hint="9 цифр">
            <Input value={data.unp} onChange={(e) => setData({ ...data, unp: e.target.value.replace(/\D/g, "").slice(0, 9) })} placeholder="690666116" icon={Hash} error={errors.unp} />
          </Field>

          <Field label="Email для уведомлений" required error={errors.email} hint="на этот email придёт ссылка на ЭЦП-подписание">
            <Input value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="info@company.by" type="email" icon={Mail} error={errors.email} />
          </Field>

          <Field label="Телефон для связи" required error={errors.phone}>
            <Input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="+375 (XX) XXX-XX-XX" icon={Phone} error={errors.phone} />
          </Field>

          <Field label="Какую роль вы планируете на платформе?" required>
            <Radio
              name="role"
              value={data.role}
              onChange={(v) => setData({ ...data, role: v })}
              options={[
                { value: "creditor", label: "Поставщик товаров/услуг (кредитор) — получаю финансирование под уступку требований" },
                { value: "debtor",   label: "Покупатель (должник) — получаю отсрочку платежа от поставщиков" },
                { value: "both",     label: "И то, и другое — продаём и покупаем с разными контрагентами" },
              ]}
            />
          </Field>
        </div>
      </Card>

      <Hint type="warning">
        <strong>Внимание:</strong> Платформа доступна только для резидентов Республики Беларусь. Все расчёты — в белорусских рублях (BYN).
      </Hint>
    </div>
  );
};

/* ============================================================================
   STEP 2 — АНКЕТА КОМПАНИИ (Раздел 1-2 Приложения 12)
   ============================================================================ */
const StepCompany = ({ data, setData, errors }) => {
  const [okedSearch, setOkedSearch] = useState("");
  const [showOkedPicker, setShowOkedPicker] = useState(false);
  const filteredOked = OKED_LIST.filter(o => o.code.includes(okedSearch) || o.name.toLowerCase().includes(okedSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>Сведения о компании</h2>
        <p className="text-sm" style={{ color: B.t2 }}>Раздел 1-2 анкеты. Поля помечены * — обязательны для заполнения.</p>
      </div>

      {data.unp && (
        <Hint type="success">
          Данные по УНП <strong>{data.unp}</strong> найдены в ЕГР. Проверьте и при необходимости уточните.
        </Hint>
      )}

      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <Building2 size={16} style={{ color: B.accent }} />Наименование и реквизиты
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Полное наименование" required hint="с указанием организационно-правовой формы" className="md:col-span-2" error={errors.fullName}>
            <Input value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} placeholder='ООО «Ромашка»' error={errors.fullName} />
          </Field>
          <Field label="Сокращённое наименование">
            <Input value={data.shortName} onChange={(e) => setData({ ...data, shortName: e.target.value })} placeholder="Ромашка" />
          </Field>
          <Field label="Наименование на английском">
            <Input value={data.nameEn} onChange={(e) => setData({ ...data, nameEn: e.target.value })} placeholder="Romashka LLC" />
          </Field>
          <Field label="УНП" required>
            <Input value={data.unp} onChange={(e) => setData({ ...data, unp: e.target.value.replace(/\D/g, "").slice(0, 9) })} placeholder="690666116" disabled />
          </Field>
          <Field label="Дата первоначальной регистрации" required error={errors.regDate}>
            <Input type="date" value={data.regDate} onChange={(e) => setData({ ...data, regDate: e.target.value })} icon={Calendar} error={errors.regDate} />
          </Field>
          <Field label="Регистрирующий орган" required error={errors.regOrgan}>
            <Input value={data.regOrgan} onChange={(e) => setData({ ...data, regOrgan: e.target.value })} placeholder="Минский облисполком" error={errors.regOrgan} />
          </Field>
          <Field label="Регистрационный номер">
            <Input value={data.regNumber} onChange={(e) => setData({ ...data, regNumber: e.target.value })} placeholder="690666116" />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <MapPin size={16} style={{ color: B.accent }} />Юридический адрес
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Страна" required>
            <Input value={data.country || "Республика Беларусь"} onChange={(e) => setData({ ...data, country: e.target.value })} disabled />
          </Field>
          <Field label="Почтовый индекс">
            <Input value={data.zip} onChange={(e) => setData({ ...data, zip: e.target.value })} placeholder="220000" />
          </Field>
          <Field label="Область / район">
            <Input value={data.region} onChange={(e) => setData({ ...data, region: e.target.value })} placeholder="Минская область" />
          </Field>
          <Field label="Населённый пункт" required error={errors.city}>
            <Input value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="г. Минск" error={errors.city} />
          </Field>
          <Field label="Улица" required error={errors.street} className="md:col-span-2">
            <Input value={data.street} onChange={(e) => setData({ ...data, street: e.target.value })} placeholder="ул. Ленина" error={errors.street} />
          </Field>
          <Field label="Дом" required error={errors.building}>
            <Input value={data.building} onChange={(e) => setData({ ...data, building: e.target.value })} placeholder="1" error={errors.building} />
          </Field>
          <Field label="Корпус">
            <Input value={data.korpus} onChange={(e) => setData({ ...data, korpus: e.target.value })} placeholder="А" />
          </Field>
          <Field label="Офис / помещение">
            <Input value={data.office} onChange={(e) => setData({ ...data, office: e.target.value })} placeholder="305" />
          </Field>
        </div>
        <div className="mt-4">
          <Checkbox
            checked={data.factualSameAsLegal !== false}
            onChange={(v) => setData({ ...data, factualSameAsLegal: v })}
            label="Фактический адрес совпадает с юридическим"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <Briefcase size={16} style={{ color: B.accent }} />Деятельность
        </h3>
        <div className="space-y-4">
          <Field label="Основной вид деятельности (ОКЭД)" required hint="5 цифр" error={errors.okedMain}>
            {data.okedMain ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border" style={{ borderColor: B.border, background: B.greenL }}>
                <div className="text-sm" style={{ color: B.t1 }}>
                  <strong>{data.okedMain}</strong> — {data.okedMainName}
                </div>
                <button onClick={() => setData({ ...data, okedMain: "", okedMainName: "" })} className="text-xs hover:underline" style={{ color: B.accent }}>Изменить</button>
              </div>
            ) : (
              <button onClick={() => setShowOkedPicker(true)} className="w-full px-3.5 py-2.5 rounded-xl border text-left text-sm flex items-center justify-between hover:border-blue-400 transition" style={{ borderColor: errors.okedMain ? B.red : B.border, color: B.t3 }}>
                <span>Выбрать код ОКЭД...</span>
                <Search size={15} />
              </button>
            )}
          </Field>

          <Field label="Дополнительные виды деятельности" hint="через запятую">
            <Input value={data.okedOther} onChange={(e) => setData({ ...data, okedOther: e.target.value })} placeholder="46730, 41200" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Среднесписочная численность" required error={errors.employees}>
              <Input value={data.employees} onChange={(e) => setData({ ...data, employees: e.target.value.replace(/\D/g, "") })} placeholder="47" suffix="чел." error={errors.employees} />
            </Field>
            <Field label="Размер уставного фонда" required error={errors.capital}>
              <Input value={data.capital} onChange={(e) => setData({ ...data, capital: e.target.value })} placeholder="15 000" suffix="BYN" error={errors.capital} />
            </Field>
          </div>

          <Field label="Цели и характер отношений с банком" required error={errors.goal}>
            <Radio
              name="goal"
              value={data.goal || "factoring"}
              onChange={(v) => setData({ ...data, goal: v })}
              options={[
                { value: "factoring", label: "Факторинговое обслуживание" },
                { value: "rko_factoring", label: "РКО + факторинг" },
              ]}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <Globe size={16} style={{ color: B.accent }} />Контакты
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Сайт компании">
            <Input value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })} placeholder="https://company.by" />
          </Field>
          <Field label="Корпоративный email">
            <Input value={data.companyEmail || data.email} onChange={(e) => setData({ ...data, companyEmail: e.target.value })} placeholder="info@company.by" type="email" />
          </Field>
          <Field label="Телефон руководителя">
            <Input value={data.directorPhone} onChange={(e) => setData({ ...data, directorPhone: e.target.value })} placeholder="+375 (XX) XXX-XX-XX" />
          </Field>
          <Field label="Телефон главного бухгалтера">
            <Input value={data.accountantPhone} onChange={(e) => setData({ ...data, accountantPhone: e.target.value })} placeholder="+375 (XX) XXX-XX-XX" />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <ShieldCheck size={16} style={{ color: B.accent }} />Санкционные списки
        </h3>
        <div className="space-y-3">
          <Field label="Включена ли ваша организация в санкционные списки?" required>
            <Radio name="sanctions" value={data.sanctions || "no"} onChange={(v) => setData({ ...data, sanctions: v })} options={[
              { value: "no", label: "Нет" },
              { value: "yes", label: "Да" },
            ]} />
          </Field>
          {data.sanctions === "yes" && (
            <Field label="Укажите, какой именно список">
              <Input value={data.sanctionsList} onChange={(e) => setData({ ...data, sanctionsList: e.target.value })} placeholder="Опишите..." />
            </Field>
          )}
          <Field label="Имеете ли вы контрагентов из санкционных списков?" required>
            <Radio name="sanctionsContacts" value={data.sanctionsContacts || "no"} onChange={(v) => setData({ ...data, sanctionsContacts: v })} options={[
              { value: "no", label: "Нет" },
              { value: "yes", label: "Да" },
            ]} />
          </Field>
        </div>
      </Card>

      {/* OKED PICKER MODAL */}
      <Modal open={showOkedPicker} onClose={() => setShowOkedPicker(false)} title="Выберите код ОКЭД">
        <Input value={okedSearch} onChange={(e) => setOkedSearch(e.target.value)} placeholder="Поиск по коду или названию..." icon={Search} />
        <div className="mt-4 space-y-1 max-h-[400px] overflow-y-auto">
          {filteredOked.map(o => (
            <button key={o.code} onClick={() => { setData({ ...data, okedMain: o.code, okedMainName: o.name }); setShowOkedPicker(false); setOkedSearch(""); }}
              className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 flex items-center gap-3 transition">
              <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: B.accentL, color: B.accentD }}>{o.code}</span>
              <span className="text-sm" style={{ color: B.t1 }}>{o.name}</span>
            </button>
          ))}
          {filteredOked.length === 0 && <div className="text-center py-8 text-sm" style={{ color: B.t3 }}>Ничего не найдено</div>}
        </div>
      </Modal>
    </div>
  );
};

/* ============================================================================
   STEP 3 — РУКОВОДСТВО (Раздел 3 Приложения 12)
   ============================================================================ */
const PersonForm = ({ person, setPerson, prefix = "", required = false }) => {
  const update = (k, v) => setPerson({ ...person, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Фамилия" required={required}>
          <Input value={person.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Иванов" />
        </Field>
        <Field label="Имя" required={required}>
          <Input value={person.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Иван" />
        </Field>
        <Field label="Отчество">
          <Input value={person.middleName} onChange={(e) => update("middleName", e.target.value)} placeholder="Иванович" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Должность" required={required}>
          <Input value={person.position} onChange={(e) => update("position", e.target.value)} placeholder="Директор" />
        </Field>
        <Field label="Гражданство" required={required}>
          <Select value={person.citizenship || "BY"} onChange={(e) => update("citizenship", e.target.value)} options={[
            { value: "BY", label: "Республика Беларусь" },
            { value: "RU", label: "Россия" },
            { value: "UA", label: "Украина" },
            { value: "KZ", label: "Казахстан" },
            { value: "OTHER", label: "Иное" },
          ]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Дата рождения" required={required}>
          <Input type="date" value={person.birthDate} onChange={(e) => update("birthDate", e.target.value)} icon={Calendar} />
        </Field>
        <Field label="Место рождения">
          <Input value={person.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} placeholder="г. Минск" />
        </Field>
      </div>

      <Field label="Адрес регистрации" required={required}>
        <Input value={person.address} onChange={(e) => update("address", e.target.value)} placeholder="г. Минск, ул. Ленина, 1, кв. 5" />
      </Field>

      <div className="rounded-xl p-4 space-y-4" style={{ background: "#F8FAFC" }}>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: B.t3 }}>Документ, удостоверяющий личность</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Вид документа" required={required}>
            <Select value={person.docType || "passport"} onChange={(e) => update("docType", e.target.value)} options={[
              { value: "passport", label: "Паспорт гражданина РБ" },
              { value: "id_card", label: "ID-карта гражданина РБ" },
              { value: "residence", label: "Вид на жительство" },
              { value: "foreign_passport", label: "Иностранный паспорт" },
            ]} />
          </Field>
          <Field label="Серия и номер" required={required}>
            <Input value={person.docNumber} onChange={(e) => update("docNumber", e.target.value)} placeholder="MP 2345678" />
          </Field>
          <Field label="Кем выдан" required={required}>
            <Input value={person.docIssuer} onChange={(e) => update("docIssuer", e.target.value)} placeholder="Московское РУВД г. Минска" />
          </Field>
          <Field label="Дата выдачи" required={required}>
            <Input type="date" value={person.docDate} onChange={(e) => update("docDate", e.target.value)} icon={Calendar} />
          </Field>
          <Field label="Идентификационный (личный) номер" required={required} hint="14 символов, например 1234567A123BC4">
            <Input value={person.idNumber} onChange={(e) => update("idNumber", e.target.value.toUpperCase())} placeholder="1234567A123BC4" />
          </Field>
          <Field label="Срок действия">
            <Input type="date" value={person.docExpire} onChange={(e) => update("docExpire", e.target.value)} icon={Calendar} />
          </Field>
        </div>
      </div>
    </div>
  );
};

const StepManagement = ({ data, setData }) => {
  const setDirector = (p) => setData({ ...data, director: p });
  const setAccountant = (p) => setData({ ...data, accountant: p });
  const reps = data.representatives || [];
  const setReps = (r) => setData({ ...data, representatives: r });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>Руководство компании</h2>
        <p className="text-sm" style={{ color: B.t2 }}>Раздел 3 анкеты. Сведения о руководителе, главном бухгалтере и иных уполномоченных лицах.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: B.t1 }}>
            <User size={16} style={{ color: B.accent }} />Руководитель организации
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: B.redL, color: B.red }}>Обязательно</span>
        </div>
        <PersonForm person={data.director || {}} setPerson={setDirector} required />
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: B.t1 }}>
            <User size={16} style={{ color: B.accent }} />Лицо, осуществляющее руководство бухгалтерским учётом
          </h3>
          <Checkbox
            checked={data.accountantSameAsDirector || false}
            onChange={(v) => setData({ ...data, accountantSameAsDirector: v, accountant: v ? data.director : data.accountant })}
            label="Те же данные, что у директора"
          />
        </div>
        {!data.accountantSameAsDirector && <PersonForm person={data.accountant || {}} setPerson={setAccountant} required />}
        {data.accountantSameAsDirector && (
          <Hint type="success">
            Учёт ведёт сам руководитель: <strong>{[data.director?.lastName, data.director?.firstName, data.director?.middleName].filter(Boolean).join(" ") || "директор"}</strong>
          </Hint>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: B.t1 }}>
              <Users size={16} style={{ color: B.accent }} />Иные уполномоченные лица
            </h3>
            <p className="text-xs mt-1" style={{ color: B.t3 }}>Лица с правом подписи документов от имени организации (если есть)</p>
          </div>
          <Btn size="sm" variant="outline" icon={Plus} onClick={() => setReps([...reps, {}])}>Добавить</Btn>
        </div>
        {reps.length === 0 ? (
          <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: B.border, color: B.t3 }}>
            <div className="text-sm">Уполномоченные лица не добавлены</div>
            <div className="text-xs mt-1">Если кроме руководителя другие лица не подписывают документы, оставьте пустым</div>
          </div>
        ) : (
          <div className="space-y-4">
            {reps.map((r, i) => (
              <div key={i} className="rounded-xl p-4 border" style={{ borderColor: B.border, background: "#FAFBFC" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{ color: B.t2 }}>Представитель #{i + 1}</span>
                  <button onClick={() => setReps(reps.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: B.red }}><Trash2 size={14} /></button>
                </div>
                <PersonForm person={r} setPerson={(p) => setReps(reps.map((rr, j) => j === i ? p : rr))} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ============================================================================
   STEP 4 — БЕНЕФИЦИАРЫ И УЧРЕДИТЕЛИ (Раздел 4)
   ============================================================================ */
const StepOwners = ({ data, setData }) => {
  const beneficiaries = data.beneficiaries || [];
  const founders = data.founders || [];

  const addBeneficiary = () => setData({ ...data, beneficiaries: [...beneficiaries, { type: "person" }] });
  const updateBeneficiary = (i, patch) => setData({ ...data, beneficiaries: beneficiaries.map((b, j) => j === i ? { ...b, ...patch } : b) });
  const removeBeneficiary = (i) => setData({ ...data, beneficiaries: beneficiaries.filter((_, j) => j !== i) });

  const addFounder = (type) => setData({ ...data, founders: [...founders, { type }] });
  const updateFounder = (i, patch) => setData({ ...data, founders: founders.map((f, j) => j === i ? { ...f, ...patch } : f) });
  const removeFounder = (i) => setData({ ...data, founders: founders.filter((_, j) => j !== i) });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>Бенефициарные владельцы и учредители</h2>
        <p className="text-sm" style={{ color: B.t2 }}>Раздел 4 анкеты. Информация о реальных владельцах и собственниках бизнеса.</p>
      </div>

      <Hint type="info">
        <strong>Бенефициарный владелец</strong> — физическое лицо, которое прямо или косвенно владеет долей более 10% в капитале или контролирует деятельность компании. Указывается всегда (даже если совпадает с учредителем).
      </Hint>

      {/* Бенефициары */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: B.t1 }}>
              <BadgeCheck size={16} style={{ color: B.accent }} />Бенефициарные владельцы
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: B.redL, color: B.red }}>Обязательно</span>
            </h3>
            <p className="text-xs mt-1" style={{ color: B.t3 }}>Только физические лица — реальные владельцы бизнеса</p>
          </div>
          <Btn size="sm" variant="primary" icon={Plus} onClick={addBeneficiary}>Добавить бенефициара</Btn>
        </div>

        {beneficiaries.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: B.red, background: B.redL + "40" }}>
            <AlertCircle size={28} className="mx-auto mb-2" style={{ color: B.red }} />
            <div className="text-sm font-semibold" style={{ color: B.red }}>Не указан ни один бенефициарный владелец</div>
            <div className="text-xs mt-1" style={{ color: B.t2 }}>Добавьте хотя бы одного — это требование банка</div>
          </div>
        ) : (
          <div className="space-y-4">
            {beneficiaries.map((b, i) => (
              <div key={i} className="rounded-xl p-4 border" style={{ borderColor: B.border, background: "#FAFBFC" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: B.accentL, color: B.accentD }}>Бенефициар #{i + 1}</span>
                    <Field label="" className="!mb-0">
                      <Input value={b.share} onChange={(e) => updateBeneficiary(i, { share: e.target.value.replace(/[^\d.]/g, "") })} placeholder="100" suffix="%" />
                    </Field>
                  </div>
                  <button onClick={() => removeBeneficiary(i)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: B.red }}><Trash2 size={14} /></button>
                </div>
                <PersonForm person={b} setPerson={(p) => updateBeneficiary(i, p)} required />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Учредители */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: B.t1 }}>
              <Users size={16} style={{ color: B.accent }} />Учредители (участники)
            </h3>
            <p className="text-xs mt-1" style={{ color: B.t3 }}>Юридические или физические лица — участники уставного фонда</p>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" variant="outline" icon={Plus} onClick={() => addFounder("person")}>Физ. лицо</Btn>
            <Btn size="sm" variant="outline" icon={Plus} onClick={() => addFounder("org")}>Юр. лицо</Btn>
          </div>
        </div>

        {founders.length === 0 ? (
          <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: B.border, color: B.t3 }}>
            <div className="text-sm">Учредители не добавлены</div>
          </div>
        ) : (
          <div className="space-y-4">
            {founders.map((f, i) => (
              <div key={i} className="rounded-xl p-4 border" style={{ borderColor: B.border, background: "#FAFBFC" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: f.type === "person" ? B.purpleL : B.accentL, color: f.type === "person" ? B.purple : B.accentD }}>
                      Учредитель #{i + 1} · {f.type === "person" ? "Физ. лицо" : "Юр. лицо"}
                    </span>
                    <Field label="" className="!mb-0">
                      <Input value={f.share} onChange={(e) => updateFounder(i, { share: e.target.value.replace(/[^\d.]/g, "") })} placeholder="0" suffix="%" />
                    </Field>
                  </div>
                  <button onClick={() => removeFounder(i)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: B.red }}><Trash2 size={14} /></button>
                </div>

                {f.type === "person" ? (
                  <PersonForm person={f} setPerson={(p) => updateFounder(i, p)} required />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Полное наименование" required>
                        <Input value={f.orgName} onChange={(e) => updateFounder(i, { orgName: e.target.value })} placeholder='ООО «ТехноИнвест»' />
                      </Field>
                      <Field label="УНП" required>
                        <Input value={f.orgUnp} onChange={(e) => updateFounder(i, { orgUnp: e.target.value.replace(/\D/g, "").slice(0, 9) })} placeholder="190456789" />
                      </Field>
                      <Field label="Страна регистрации" required>
                        <Input value={f.orgCountry || "Республика Беларусь"} onChange={(e) => updateFounder(i, { orgCountry: e.target.value })} />
                      </Field>
                      <Field label="Дата регистрации">
                        <Input type="date" value={f.orgRegDate} onChange={(e) => updateFounder(i, { orgRegDate: e.target.value })} icon={Calendar} />
                      </Field>
                      <Field label="Регистрационный номер">
                        <Input value={f.orgRegNumber} onChange={(e) => updateFounder(i, { orgRegNumber: e.target.value })} />
                      </Field>
                      <Field label="Регистрирующий орган">
                        <Input value={f.orgRegOrgan} onChange={(e) => updateFounder(i, { orgRegOrgan: e.target.value })} placeholder="Минский облисполком" />
                      </Field>
                    </div>
                    <Field label="Юридический адрес">
                      <Input value={f.orgAddress} onChange={(e) => updateFounder(i, { orgAddress: e.target.value })} placeholder="г. Минск, ул. Ленина, 1" />
                    </Field>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Доп. вопросы по разделам 5.1-5.3 */}
      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <Info size={16} style={{ color: B.accent }} />Дополнительные сведения
        </h3>
        <div className="space-y-4">
          <Field label="Имеются ли филиалы, представительства, дочерние организации?" required>
            <Radio name="branches" value={data.hasBranches || "no"} onChange={(v) => setData({ ...data, hasBranches: v })} options={[
              { value: "no", label: "Нет" }, { value: "yes", label: "Да" },
            ]} />
          </Field>
          {data.hasBranches === "yes" && (
            <Field label="Перечислите филиалы">
              <Input value={data.branchesList} onChange={(e) => setData({ ...data, branchesList: e.target.value })} placeholder="Названия и адреса филиалов" />
            </Field>
          )}

          <Field label="Являются ли руководители или главбух учредителями других организаций (доля &gt;25%)?" required>
            <Radio name="manageOther" value={data.manageOtherOrgs || "no"} onChange={(v) => setData({ ...data, manageOtherOrgs: v })} options={[
              { value: "no", label: "Нет" }, { value: "yes", label: "Да" },
            ]} />
          </Field>

          <Field label="Являются ли учредители (с долей &gt;25%) руководителями или участниками других организаций?" required>
            <Radio name="ownersOther" value={data.ownersOtherOrgs || "no"} onChange={(v) => setData({ ...data, ownersOtherOrgs: v })} options={[
              { value: "no", label: "Нет" }, { value: "yes", label: "Да" },
            ]} />
          </Field>
        </div>
      </Card>
    </div>
  );
};

/* ============================================================================
   STEP 5 — FATCA
   ============================================================================ */
const StepFatca = ({ data, setData }) => {
  const isUsRelated = data.fatcaIsUsTaxpayer === "yes" || data.fatcaHasUsBeneficiary === "yes" || data.fatcaIsFinInst === "yes";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>FATCA — налоговая идентификация</h2>
        <p className="text-sm" style={{ color: B.t2 }}>Раздел 2.4 анкеты. Закон США «О налоговом контроле счетов в иностранных финансовых учреждениях».</p>
      </div>

      <Hint type="info">
        В большинстве случаев белорусские компании отвечают <strong>«Нет»</strong> на все три вопроса. Если у вас есть учредители — граждане США или вы сами являетесь финансовым учреждением, потребуется дополнительная форма самосертификации.
      </Hint>

      <Card className="p-6">
        <div className="space-y-5">
          <Field label="Является ли ваша организация налогоплательщиком США?" required>
            <Radio name="fatca1" value={data.fatcaIsUsTaxpayer || "no"} onChange={(v) => setData({ ...data, fatcaIsUsTaxpayer: v })} options={[
              { value: "no", label: "Нет" }, { value: "yes", label: "Да" },
            ]} />
          </Field>

          <Field label="Имеются ли бенефициарные владельцы — налогоплательщики США?" required>
            <Radio name="fatca2" value={data.fatcaHasUsBeneficiary || "no"} onChange={(v) => setData({ ...data, fatcaHasUsBeneficiary: v })} options={[
              { value: "no", label: "Нет" }, { value: "yes", label: "Да" },
            ]} />
          </Field>

          <Field label="Является ли ваша организация финансовым учреждением для целей FATCA?" required hint="банк, страховая, инвестфонд и т.п.">
            <Radio name="fatca3" value={data.fatcaIsFinInst || "no"} onChange={(v) => setData({ ...data, fatcaIsFinInst: v })} options={[
              { value: "no", label: "Нет" }, { value: "yes", label: "Да" },
            ]} />
          </Field>
        </div>
      </Card>

      {isUsRelated && (
        <Hint type="warning">
          <strong>Потребуется дополнительная форма FATCA-самосертификации.</strong> После завершения онбординга наш менеджер свяжется с вами для оформления формы W-8BEN-E или W-9.
        </Hint>
      )}
    </div>
  );
};

/* ============================================================================
   STEP 6 — СОГЛАСИЯ ФИЗЛИЦ
   ============================================================================ */
const ConsentDoc = ({ title, description, expanded, onToggle, accepted, onAccept, onPreview }) => (
  <div className="rounded-2xl border" style={{ borderColor: accepted ? B.green : B.border, background: accepted ? B.greenL + "40" : "white" }}>
    <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 p-4 text-left">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accepted ? B.green : B.accentL, color: accepted ? "white" : B.accent }}>
          {accepted ? <Check size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: B.t1 }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: B.t2 }}>{description}</div>
        </div>
      </div>
      <ChevronRight size={18} className={`shrink-0 transition ${expanded ? "rotate-90" : ""}`} style={{ color: B.t3 }} />
    </button>
    {expanded && (
      <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: B.border }}>
        <div className="mt-3 flex items-center gap-2">
          <Btn size="sm" variant="outline" icon={Eye} onClick={onPreview}>Просмотреть полный текст</Btn>
          <Btn size="sm" variant="outline" icon={Download}>Скачать PDF</Btn>
        </div>
        <div className="mt-3">
          <Checkbox checked={accepted} onChange={onAccept} label="Я ознакомлен(а) и даю согласие" description="Документ будет подписан моей ЭЦП на следующем шаге" />
        </div>
      </div>
    )}
  </div>
);

const StepConsents = ({ data, setData }) => {
  const persons = useMemo(() => {
    const arr = [];
    if (data.director?.lastName) arr.push({ ...data.director, role: "Директор" });
    if (data.accountant?.lastName && !data.accountantSameAsDirector) arr.push({ ...data.accountant, role: "Главный бухгалтер" });
    (data.representatives || []).forEach((r, i) => {
      if (r.lastName) arr.push({ ...r, role: `Представитель #${i + 1}` });
    });
    (data.beneficiaries || []).forEach((b, i) => {
      const exists = arr.find((p) => p.idNumber && p.idNumber === b.idNumber);
      if (!exists && b.lastName) arr.push({ ...b, role: `Бенефициар (${b.share || "?"}%)` });
    });
    (data.founders || []).forEach((f, i) => {
      if (f.type !== "person" || !f.lastName) return;
      const exists = arr.find((p) => p.idNumber && p.idNumber === f.idNumber);
      if (!exists) arr.push({ ...f, role: `Учредитель (${f.share || "?"}%)` });
    });
    return arr;
  }, [data]);

  const consents = data.consents || {};
  const setConsent = (personIdx, type, val) => {
    const key = `${personIdx}_${type}`;
    setData({ ...data, consents: { ...consents, [key]: val } });
  };

  const [activePersonIdx, setActivePersonIdx] = useState(0);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const allConsentsForPerson = (idx) => ["bki", "oeb_fszn", "mvd", "pd"].every((t) => consents[`${idx}_${t}`]);
  const totalDone = persons.filter((_, i) => allConsentsForPerson(i)).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>Согласия физических лиц</h2>
        <p className="text-sm" style={{ color: B.t2 }}>
          Для каждого физического лица из руководства и владельцев нужно собрать 4 согласия на проверку в государственных базах данных.
        </p>
      </div>

      {persons.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: B.yellow }} />
          <div className="text-sm font-semibold" style={{ color: B.t1 }}>Сначала укажите руководство и владельцев</div>
          <div className="text-xs mt-1" style={{ color: B.t2 }}>Вернитесь к шагам 3-4</div>
        </Card>
      ) : (
        <>
          <Hint type="info">
            <strong>Всего физлиц для согласий: {persons.length}.</strong> {totalDone === persons.length ? "Все согласия собраны ✓" : `Осталось: ${persons.length - totalDone}`}
          </Hint>

          {/* Список физлиц */}
          <Card className="p-2">
            <div className="flex flex-wrap gap-2">
              {persons.map((p, i) => {
                const done = allConsentsForPerson(i);
                const isActive = i === activePersonIdx;
                return (
                  <button key={i} onClick={() => setActivePersonIdx(i)} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${isActive ? "shadow-sm" : ""}`}
                    style={{ background: isActive ? B.accent : done ? B.greenL : "#F1F5F9", color: isActive ? "white" : done ? B.greenD : B.t2 }}>
                    {done && <Check size={12} />}
                    {p.lastName} {p.firstName?.[0]}.{p.middleName?.[0] && p.middleName?.[0] + "."}
                    <span className="opacity-70">· {p.role}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Согласия для активного лица */}
          {persons[activePersonIdx] && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: B.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: B.purple }}>
                  {persons[activePersonIdx].firstName?.[0]}{persons[activePersonIdx].lastName?.[0]}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: B.t1 }}>
                    {[persons[activePersonIdx].lastName, persons[activePersonIdx].firstName, persons[activePersonIdx].middleName].filter(Boolean).join(" ")}
                  </div>
                  <div className="text-xs" style={{ color: B.t2 }}>
                    {persons[activePersonIdx].role} · ИН {persons[activePersonIdx].idNumber || "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <ConsentDoc
                  title="Согласие на обработку ПД (общее)"
                  description="Для обработки персональных данных банком и платформой"
                  expanded={expandedDoc === "pd"}
                  onToggle={() => setExpandedDoc(expandedDoc === "pd" ? null : "pd")}
                  accepted={!!consents[`${activePersonIdx}_pd`]}
                  onAccept={(v) => setConsent(activePersonIdx, "pd", v)}
                  onPreview={() => setPreviewDoc("pd")}
                />
                <ConsentDoc
                  title="Согласие на запрос в БКИ (Кредитный регистр НБРБ)"
                  description="Для проверки кредитной истории через Национальный банк РБ"
                  expanded={expandedDoc === "bki"}
                  onToggle={() => setExpandedDoc(expandedDoc === "bki" ? null : "bki")}
                  accepted={!!consents[`${activePersonIdx}_bki`]}
                  onAccept={(v) => setConsent(activePersonIdx, "bki", v)}
                  onPreview={() => setPreviewDoc("bki")}
                />
                <ConsentDoc
                  title="Согласие на проверку ОАИС / ФСЗН"
                  description="АИС «Паспорт» и Реестр индивидуальных лицевых счетов ФСЗН — для оценки кредитоспособности"
                  expanded={expandedDoc === "oeb_fszn"}
                  onToggle={() => setExpandedDoc(expandedDoc === "oeb_fszn" ? null : "oeb_fszn")}
                  accepted={!!consents[`${activePersonIdx}_oeb_fszn`]}
                  onAccept={(v) => setConsent(activePersonIdx, "oeb_fszn", v)}
                  onPreview={() => setPreviewDoc("oeb_fszn")}
                />
                <ConsentDoc
                  title="Согласие на сведения о правонарушениях (МВД)"
                  description="О судимости, уголовном преследовании, привлечении к административной ответственности"
                  expanded={expandedDoc === "mvd"}
                  onToggle={() => setExpandedDoc(expandedDoc === "mvd" ? null : "mvd")}
                  accepted={!!consents[`${activePersonIdx}_mvd`]}
                  onAccept={(v) => setConsent(activePersonIdx, "mvd", v)}
                  onPreview={() => setPreviewDoc("mvd")}
                />
              </div>

              {/* Навигация между лицами */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: B.border }}>
                <Btn size="sm" variant="ghost" icon={ChevronLeft} disabled={activePersonIdx === 0} onClick={() => setActivePersonIdx(activePersonIdx - 1)}>
                  Предыдущее лицо
                </Btn>
                <span className="text-xs" style={{ color: B.t3 }}>{activePersonIdx + 1} из {persons.length}</span>
                <Btn size="sm" variant="primary" icon={ChevronRight} disabled={activePersonIdx === persons.length - 1 || !allConsentsForPerson(activePersonIdx)}
                  onClick={() => setActivePersonIdx(activePersonIdx + 1)}>
                  Следующее лицо
                </Btn>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Preview модал */}
      <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} title={
        previewDoc === "pd" ? "Согласие на обработку персональных данных" :
        previewDoc === "bki" ? "Согласие на запрос в БКИ (НБРБ)" :
        previewDoc === "oeb_fszn" ? "Согласие на проверку ОАИС / ФСЗН" :
        previewDoc === "mvd" ? "Согласие на сведения о правонарушениях" : ""
      } wide>
        <ConsentText type={previewDoc} bank={BANK} />
      </Modal>
    </div>
  );
};

const ConsentText = ({ type, bank }) => {
  if (type === "oeb_fszn") return (
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: B.t1 }}>
      <p>Я, ___________________________ (ФИО, дата рождения, идентификационный номер), даю согласие <strong>{bank.name}</strong>, расположенному по адресу: {bank.address} (далее — Оператор), на обработку моих персональных данных:</p>
      <p>содержащихся в государственной информационной системе (ресурсе) ОАИС «Паспорт» — фамилия, имя, отчество, идентификационный номер или номер документа, удостоверяющего личность, дата рождения;</p>
      <p>содержащихся в Реестре индивидуальных лицевых счетов застрахованных лиц ФСЗН — страховая дата, УНП и наименование плательщика, сведения о датах приёма и увольнения застрахованного лица, суммы выплат, на которые начислены страховые взносы, сумм пособий, периодов работы по гражданско-правовому договору, для цели оценки способности должника исполнить свои обязательства.</p>
      <p>В рамках получения электронных услуг ОАИС: 3.09.01, 3.25.02, 3.25.03.</p>
      <p>Настоящее согласие даётся на 3 месяца, а в случае заключения кредитного договора — на срок до полного исполнения обязательств.</p>
    </div>
  );
  if (type === "mvd") return (
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: B.t1 }}>
      <p>Я, ___________________________ (ФИО, дата и место рождения, идентификационный номер), в соответствии со статьёй 5 Закона Республики Беларусь «О защите персональных данных» даю согласие на обработку моих персональных данных <strong>Министерством внутренних дел Республики Беларусь</strong>, г. Минск, ул. Городской Вал, 4, в целях предоставления <strong>{bank.name}</strong>, {bank.address}, сведений о правонарушениях в отношении меня либо информации об отсутствии таких сведений в едином государственном банке данных о правонарушениях в следующем объёме: <strong>о судимости, уголовном преследовании, привлечении к административной ответственности</strong>.</p>
      <p>Согласен на сбор, хранение, использование, уточнение, предоставление сведений о правонарушениях, а также другие действия, необходимые для достижения указанной цели.</p>
      <p>Согласие действует в течение одного месяца с момента его предоставления. В случае одобрения и заключения договора согласие сохраняет силу на весь срок действия договора.</p>
    </div>
  );
  if (type === "bki") return (
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: B.t1 }}>
      <p>Я, ___________________________ (ФИО, идентификационный номер), даю согласие <strong>{bank.name}</strong>, расположенному по адресу: {bank.address}, на получение моего кредитного отчёта из Кредитного регистра Национального банка Республики Беларусь.</p>
      <p>Цель: оценка кредитоспособности и принятие решения о предоставлении факторингового финансирования.</p>
      <p>Согласие действует 3 месяца с момента подписания, а в случае заключения договора — на весь срок его действия.</p>
    </div>
  );
  return (
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: B.t1 }}>
      <p>Согласие на обработку персональных данных оператором — <strong>{bank.name}</strong> — для целей идентификации клиента, проверки достоверности предоставленных сведений, заключения и исполнения договора факторинга.</p>
      <p>Перечень персональных данных: ФИО, дата и место рождения, гражданство, реквизиты документа, удостоверяющего личность, идентификационный номер, должность, контактные данные.</p>
      <p>Срок действия согласия: до полного исполнения обязательств по договору + 3 года для целей хранения.</p>
    </div>
  );
};

/* ============================================================================
   STEP 7 — ПОДПИСАНИЕ ЭЦП
   ============================================================================ */
const StepSign = ({ data, onSubmit, submitting, signed }) => {
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [confirmRules, setConfirmRules] = useState(false);
  const [confirmAct, setConfirmAct] = useState(false);

  const personsCount = useMemo(() => {
    let n = 0;
    if (data.director?.lastName) n++;
    if (data.accountant?.lastName && !data.accountantSameAsDirector) n++;
    n += (data.representatives || []).filter((r) => r.lastName).length;
    n += (data.beneficiaries || []).filter((b) => b.lastName).length;
    n += (data.founders || []).filter((f) => f.type === "person" && f.lastName).length;
    return n;
  }, [data]);

  const consentsCount = Object.values(data.consents || {}).filter(Boolean).length;

  if (signed) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5" style={{ background: B.greenL }}>
            <CheckCircle size={48} style={{ color: B.green }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>Анкета успешно подписана!</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: B.t2 }}>
            Ваша анкета и согласия отправлены в банк на проверку и скоринг. Мы пришлём результат на email <strong>{data.email}</strong> в течение 1-3 рабочих дней.
          </p>

          <div className="rounded-2xl p-5 max-w-md mx-auto mb-6 text-left" style={{ background: "#F8FAFC" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: B.t3 }}>Что дальше?</div>
            <div className="space-y-3">
              {[
                { icon: Search, title: "Аналитик банка проверит данные", time: "1-2 дня" },
                { icon: Shield, title: "Скоринг и установление лимита", time: "автоматически" },
                { icon: Mail, title: "Уведомление о результате на email", time: "сразу после решения" },
                { icon: Sparkles, title: "Активация — создание уступок", time: "после одобрения" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: B.accentL }}>
                      <Icon size={14} style={{ color: B.accent }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{ color: B.t1 }}>{s.title}</div>
                      <div className="text-[10px]" style={{ color: B.t3 }}>{s.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Btn variant="primary" size="lg" icon={ArrowRight}>Перейти в личный кабинет</Btn>
            <Btn variant="outline" size="lg" icon={Download}>Скачать копию анкеты</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: B.t1 }}>Подписание анкеты ЭЦП</h2>
        <p className="text-sm" style={{ color: B.t2 }}>Финальный шаг. Проверьте сводку и подпишите электронной цифровой подписью.</p>
      </div>

      {/* Сводка */}
      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <CircleDot size={16} style={{ color: B.accent }} />Сводка анкеты
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: B.t3 }}>Компания</div>
            <div className="text-sm font-semibold" style={{ color: B.t1 }}>{data.fullName || "—"}</div>
            <div className="text-xs" style={{ color: B.t2 }}>УНП {data.unp}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: B.t3 }}>Роль</div>
            <div className="text-sm font-semibold" style={{ color: B.t1 }}>
              {data.role === "creditor" ? "Кредитор" : data.role === "debtor" ? "Должник" : "Кредитор + Должник"}
            </div>
            <div className="text-xs" style={{ color: B.t2 }}>в системе</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: B.t3 }}>Физических лиц</div>
            <div className="text-sm font-semibold" style={{ color: B.t1 }}>{personsCount}</div>
            <div className="text-xs" style={{ color: B.t2 }}>в анкете</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: B.t3 }}>Согласий</div>
            <div className="text-sm font-semibold" style={{ color: B.green }}>{consentsCount}</div>
            <div className="text-xs" style={{ color: B.t2 }}>собрано</div>
          </div>
        </div>
      </Card>

      {/* Документы к подписанию */}
      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <FileText size={16} style={{ color: B.accent }} />Документы для подписи
        </h3>
        <div className="space-y-2">
          {[
            { name: "Анкета клиента-организации (Приложение 12)", desc: "5 разделов · 18 пунктов · ~12 страниц", icon: Building2 },
            { name: `Согласия физических лиц (${consentsCount} док.)`, desc: `Для ${personsCount} физлиц · 4 типа на каждого`, icon: Users },
            { name: "Заявка на подключение к платформе", desc: "Договор-оферта на использование Oborotka.by", icon: FileSignature },
          ].map((doc, i) => {
            const Icon = doc.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: B.border }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: B.accentL }}>
                  <Icon size={16} style={{ color: B.accent }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: B.t1 }}>{doc.name}</div>
                  <div className="text-xs" style={{ color: B.t2 }}>{doc.desc}</div>
                </div>
                <button className="text-xs font-medium hover:underline" style={{ color: B.accent }}>Просмотреть</button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Подтверждения */}
      <Card className="p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: B.t1 }}>
          <ShieldCheck size={16} style={{ color: B.accent }} />Подтверждения
        </h3>
        <div className="space-y-3">
          <Checkbox
            checked={confirmAccuracy} onChange={setConfirmAccuracy}
            label="Подтверждаю достоверность и полноту предоставленных сведений"
            description="При выявлении несоответствия данные могут быть отклонены, договор расторгнут"
          />
          <Checkbox
            checked={confirmRules} onChange={setConfirmRules}
            label="Согласен(а) с Правилами факторингового обслуживания и Тарифами"
            description={`${BANK.name} · политика обработки персональных данных`}
          />
          <Checkbox
            checked={confirmAct} onChange={setConfirmAct}
            label="Не возражаю против проверки сообщённых сведений банком"
            description="Способами, не противоречащими законодательству Республики Беларусь"
          />
        </div>
      </Card>

      {/* ЭЦП кнопка */}
      <Card className="p-6 text-center" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" }}>
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: "white" }}>
          <KeyRound size={28} style={{ color: B.accent }} />
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: B.t1 }}>Подписать всё одной ЭЦП</h3>
        <p className="text-sm mb-5" style={{ color: B.t2 }}>
          Подключите носитель ЭЦП (флешка или AvSt) или используйте мобильную ЭЦП через МСИ
        </p>
        <Btn
          variant="primary" size="lg" icon={submitting ? Loader2 : FileSignature}
          disabled={!confirmAccuracy || !confirmRules || !confirmAct || submitting}
          onClick={onSubmit}
          className={submitting ? "" : ""}
        >
          {submitting ? "Подписание..." : "Подписать ЭЦП и отправить"}
        </Btn>
        <div className="flex items-center justify-center gap-4 mt-4 text-[11px]" style={{ color: B.t3 }}>
          <div className="flex items-center gap-1"><Shield size={11} />Защищённое соединение</div>
          <div className="flex items-center gap-1"><CheckCircle size={11} />Соответствует ЗоЭДиЭЦП</div>
        </div>
      </Card>
    </div>
  );
};

/* ============================================================================
   ROOT COMPONENT
   ============================================================================ */
export default function OnboardingApp() {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState({
    unp: "", email: "", phone: "", role: "creditor",
    country: "Республика Беларусь",
    factualSameAsLegal: true,
    accountantSameAsDirector: false,
    director: {}, accountant: {}, representatives: [],
    beneficiaries: [], founders: [],
    consents: {},
  });
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showExitGuard, setShowExitGuard] = useState(false);

  // Имитация приглашения от другой компании (по URL вида /register/{unp})
  const inviteFrom = useMemo(() => ({
    name: 'ООО «СитиБетонСтрой»',
    unp: '690666116',
    role: 'debtor',
  }), []);

  // Автосохранение каждые 5 секунд
  useEffect(() => {
    const id = setInterval(() => {
      setSavedAt(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Инициализация: подгрузка данных по УНП после первого шага (имитация)
  useEffect(() => {
    if (data.unp.length === 9 && !data.fullName && stepIdx >= 1) {
      setData(d => ({
        ...d,
        fullName: 'ООО «Тестовая Компания»',
        shortName: 'Тестовая Компания',
        regOrgan: 'Минский городской исполнительный комитет',
        regNumber: data.unp,
        regDate: '2018-05-15',
        city: 'г. Минск',
      }));
    }
  }, [stepIdx, data.unp, data.fullName]);

  const validateStep = (idx) => {
    const e = {};
    const stepId = STEPS[idx].id;
    if (stepId === "start") {
      if (!data.unp || data.unp.length !== 9) e.unp = "УНП должен содержать 9 цифр";
      if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) e.email = "Некорректный email";
      if (!data.phone) e.phone = "Укажите телефон";
    }
    if (stepId === "company") {
      if (!data.fullName) e.fullName = "Укажите полное наименование";
      if (!data.regDate) e.regDate = "Укажите дату регистрации";
      if (!data.regOrgan) e.regOrgan = "Укажите регистрирующий орган";
      if (!data.city) e.city = "Укажите населённый пункт";
      if (!data.street) e.street = "Укажите улицу";
      if (!data.building) e.building = "Укажите номер дома";
      if (!data.okedMain) e.okedMain = "Выберите ОКЭД";
      if (!data.employees) e.employees = "Укажите численность";
      if (!data.capital) e.capital = "Укажите уставный фонд";
    }
    if (stepId === "owners") {
      if ((data.beneficiaries || []).length === 0) e.beneficiaries = "Добавьте минимум одного бенефициара";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(stepIdx)) {
      setToast({ type: "error", msg: "Заполните обязательные поля" });
      return;
    }
    if (!completedSteps.includes(STEPS[stepIdx].id)) {
      setCompletedSteps([...completedSteps, STEPS[stepIdx].id]);
    }
    setStepIdx(Math.min(stepIdx + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setStepIdx(Math.max(stepIdx - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSigned(true);
      setCompletedSteps([...STEPS.map(s => s.id)]);
      setToast({ type: "success", msg: "Анкета подписана и отправлена в банк" });
    }, 2200);
  };

  const currentStep = STEPS[stepIdx];

  return (
    <div className="min-h-screen" style={{ background: B.bg, fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <Header savedAt={savedAt} />
      <ProgressBar currentIdx={stepIdx} completedSteps={completedSteps} onStepClick={setStepIdx} />

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* Step content */}
        {currentStep.id === "start" && <StepStart data={data} setData={setData} errors={errors} inviteFrom={inviteFrom} />}
        {currentStep.id === "company" && <StepCompany data={data} setData={setData} errors={errors} />}
        {currentStep.id === "management" && <StepManagement data={data} setData={setData} />}
        {currentStep.id === "owners" && <StepOwners data={data} setData={setData} />}
        {currentStep.id === "fatca" && <StepFatca data={data} setData={setData} />}
        {currentStep.id === "consents" && <StepConsents data={data} setData={setData} />}
        {currentStep.id === "sign" && <StepSign data={data} onSubmit={handleSubmit} submitting={submitting} signed={signed} />}
      </main>

      {/* Bottom nav (sticky) */}
      {!signed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg" style={{ borderColor: B.border }}>
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <Btn variant="ghost" icon={ChevronLeft} disabled={stepIdx === 0} onClick={goPrev}>Назад</Btn>
            <div className="text-xs text-center" style={{ color: B.t3 }}>
              Шаг <strong style={{ color: B.t1 }}>{stepIdx + 1}</strong> из {STEPS.length} · {currentStep.title}
            </div>
            {stepIdx < STEPS.length - 1 ? (
              <Btn variant="primary" icon={ChevronRight} onClick={goNext}>Далее</Btn>
            ) : (
              <div style={{ width: 100 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
