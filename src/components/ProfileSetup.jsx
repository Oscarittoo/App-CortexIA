import { useState } from 'react';
import logo from '../assets/logo_brain_circuit.svg';
import toast from './Toast';

const PLAN_LABELS = { free: 'Free', pro: 'Pro', business: 'Business', expert: 'Expert' };
const PLAN_COLORS = { free: '#64748b', pro: '#38bdf8', business: '#818cf8', expert: '#f59e0b' };

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const SECTORS = [
  'Technologie / SaaS', 'Conseil / Audit', 'Finance / Banque', 'Santé / Médical',
  'Immobilier', 'Industrie / Manufacture', 'Commerce / Retail', 'Éducation',
  'Médias / Communication', 'Juridique', 'RH / Recrutement', 'Logistique',
  'Restauration / Hôtellerie', 'Architecture / BTP', 'Assurance', 'Autre',
];

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#e2e8f0',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: '500',
  marginBottom: '6px',
};

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ProfileSetup({ onComplete, onBack, selectedPlan, currentUser }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    phone: '',
    companyName: '',
    siret: '',
    vatNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    companySize: '',
    sector: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const getFocusStyle = (field) => focusedField === field
    ? { ...inputStyle, border: `1px solid ${PLAN_COLORS[selectedPlan] || '#667eea'}` }
    : inputStyle;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['firstName', 'lastName', 'phone', 'companyName', 'siret'];
    const missing = required.filter(k => !form[k].trim());
    if (missing.length > 0) {
      toast.error('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    if (form.siret.replace(/\s/g, '').length !== 14) {
      toast.error('Le numéro SIRET doit contenir 14 chiffres');
      return;
    }
    setIsSubmitting(true);
    try {
      const profileData = {
        ...form,
        email: currentUser?.email,
        plan: selectedPlan,
        userId: currentUser?.id,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`meetizy_profile_${currentUser?.id}`, JSON.stringify(profileData));
      onComplete(profileData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a19',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <img src={logo} alt="Meetizy" width="44" height="44" />
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '800', fontSize: '22px', letterSpacing: '2px', color: '#fff' }}>MEETIZY</span>
      </div>

      {/* Plan badge */}
      <div style={{
        background: `${PLAN_COLORS[selectedPlan]}20`,
        border: `1px solid ${PLAN_COLORS[selectedPlan]}40`,
        borderRadius: '20px', padding: '4px 18px', marginBottom: '20px',
      }}>
        <span style={{ color: PLAN_COLORS[selectedPlan], fontSize: '13px', fontWeight: '600' }}>
          Plan {PLAN_LABELS[selectedPlan] || selectedPlan}
        </span>
      </div>

      <h1 style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
        Complétez votre profil
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '36px', textAlign: 'center', maxWidth: '520px' }}>
        Ces informations personnalisent votre espace et gèrent votre facturation. Elles restent confidentielles.
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '680px' }}>

        {/* ─── Section : Identité ─── */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#667eea', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👤 Identité personnelle
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Prénom" required>
              <input style={getFocusStyle('firstName')} value={form.firstName} onChange={set('firstName')}
                onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)}
                placeholder="Jean" />
            </Field>
            <Field label="Nom" required>
              <input style={getFocusStyle('lastName')} value={form.lastName} onChange={set('lastName')}
                onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)}
                placeholder="Dupont" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Intitulé du poste">
              <input style={getFocusStyle('jobTitle')} value={form.jobTitle} onChange={set('jobTitle')}
                onFocus={() => setFocusedField('jobTitle')} onBlur={() => setFocusedField(null)}
                placeholder="Directeur commercial" />
            </Field>
            <Field label="Téléphone" required>
              <input style={getFocusStyle('phone')} value={form.phone} onChange={set('phone')} type="tel"
                onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                placeholder="+33 6 12 34 56 78" />
            </Field>
          </div>
        </div>

        {/* ─── Section : Entreprise ─── */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#667eea', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            🏢 Informations entreprise
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Nom de l'entreprise" required>
              <input style={getFocusStyle('companyName')} value={form.companyName} onChange={set('companyName')}
                onFocus={() => setFocusedField('companyName')} onBlur={() => setFocusedField(null)}
                placeholder="ACME SAS" />
            </Field>
            <Field label="Numéro SIRET" required>
              <input style={getFocusStyle('siret')} value={form.siret} onChange={set('siret')}
                onFocus={() => setFocusedField('siret')} onBlur={() => setFocusedField(null)}
                placeholder="12345678901234" maxLength={17} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Numéro TVA (optionnel)">
              <input style={getFocusStyle('vatNumber')} value={form.vatNumber} onChange={set('vatNumber')}
                onFocus={() => setFocusedField('vatNumber')} onBlur={() => setFocusedField(null)}
                placeholder="FR12345678901" />
            </Field>
            <Field label="Site web (optionnel)">
              <input style={getFocusStyle('website')} value={form.website} onChange={set('website')} type="url"
                onFocus={() => setFocusedField('website')} onBlur={() => setFocusedField(null)}
                placeholder="https://monentreprise.fr" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Taille de l'entreprise">
              <select style={{ ...getFocusStyle('companySize'), cursor: 'pointer' }} value={form.companySize}
                onChange={set('companySize')} onFocus={() => setFocusedField('companySize')} onBlur={() => setFocusedField(null)}>
                <option value="">Sélectionner…</option>
                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employés</option>)}
              </select>
            </Field>
            <Field label="Secteur d'activité">
              <select style={{ ...getFocusStyle('sector'), cursor: 'pointer' }} value={form.sector}
                onChange={set('sector')} onFocus={() => setFocusedField('sector')} onBlur={() => setFocusedField(null)}>
                <option value="">Sélectionner…</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* ─── Section : Adresse ─── */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ color: '#667eea', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            📍 Adresse de facturation
          </h3>
          <Field label="Adresse">
            <input style={getFocusStyle('address')} value={form.address} onChange={set('address')}
              onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)}
              placeholder="12 rue de la Paix" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Ville">
              <input style={getFocusStyle('city')} value={form.city} onChange={set('city')}
                onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)}
                placeholder="Paris" />
            </Field>
            <Field label="Code postal">
              <input style={getFocusStyle('postalCode')} value={form.postalCode} onChange={set('postalCode')}
                onFocus={() => setFocusedField('postalCode')} onBlur={() => setFocusedField(null)}
                placeholder="75001" maxLength={10} />
            </Field>
            <Field label="Pays">
              <input style={getFocusStyle('country')} value={form.country} onChange={set('country')}
                onFocus={() => setFocusedField('country')} onBlur={() => setFocusedField(null)}
                placeholder="France" />
            </Field>
          </div>
        </div>

        {/* ─── Submit ─── */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '16px',
            background: isSubmitting ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '14px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 28px rgba(102,126,234,0.4)',
            transition: 'all 0.2s',
            marginBottom: '16px',
          }}
        >
          {isSubmitting ? '⏳ Enregistrement…' : 'Continuer vers l\'installation →'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
          >
            ← Retour au choix du plan
          </button>
        </div>
      </form>
    </div>
  );
}
