import React, { useState, useEffect } from 'react';
import { Plus, Layout, X, Save, Trash2, Edit } from 'lucide-react';
import toast from '../Toast';

export default function TemplatesLibrary() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'Général',
    sections: ['']
  });

  // Charger le template sélectionné au montage
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      try {
        setSelectedTemplate(JSON.parse(savedTemplate));
      } catch (error) {
        console.error('Erreur chargement template:', error);
      }
    }
  }, []);

  const handleUseTemplate = (template) => {
    // Toggle : si le template est déjà sélectionné, le désélectionner
    if (selectedTemplate?.id === template.id) {
      localStorage.removeItem('selectedTemplate');
      toast.info('Template désélectionné');
      setSelectedTemplate(null);
    } else {
      // Sauvegarder le template sélectionné dans localStorage
      localStorage.setItem('selectedTemplate', JSON.stringify(template));
      toast.success(`Template "${template.name}" sélectionné ! Il sera appliqué à votre prochaine session.`);
      setSelectedTemplate(template);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast.error('Le nom et la description sont requis');
      return;
    }
    
    if (newTemplate.sections.filter(s => s.trim()).length === 0) {
      toast.error('Ajoutez au moins une section');
      return;
    }

    // Sauvegarder le nouveau template
    const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
    const template = {
      ...newTemplate,
      id: `custom-${Date.now()}`,
      sections: newTemplate.sections.filter(s => s.trim()),
      color: 'blue'
    };
    
    customTemplates.push(template);
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
    
    toast.success('Template créé avec succès !');
    setShowCreateModal(false);
    setNewTemplate({ name: '', description: '', category: 'Général', sections: [''] });
  };

  const addSection = () => {
    setNewTemplate({
      ...newTemplate,
      sections: [...newTemplate.sections, '']
    });
  };

  const updateSection = (index, value) => {
    const sections = [...newTemplate.sections];
    sections[index] = value;
    setNewTemplate({ ...newTemplate, sections });
  };

  const removeSection = (index) => {
    const sections = newTemplate.sections.filter((_, i) => i !== index);
    setNewTemplate({ ...newTemplate, sections });
  };
  // Mock data based on the service structure
  const templates = [
      {
        id: 'standard',
        name: 'Standard Reporting',
        description: 'Format classique pour les réunions de suivi et les comités de pilotage.',
        sections: ['Résumé Exécutif', 'Points Clés', 'Décisions', 'Actions', 'Prochaines étapes'],
        category: 'Général',
        color: 'blue'
      },
      {
        id: 'sprint-planning',
        name: 'Sprint Planning',
        description: 'Template Agile pour planifier le travail de l\'équipe sur la prochaine itération.',
        sections: ['Objectif du Sprint', 'User Stories', 'Tâches Techniques', 'Estimations', 'Risques'],
        category: 'Agile',
        color: 'purple'
      },
      {
        id: 'one-on-one',
        name: 'Entretien 1:1',
        description: ' tructure pour les points hebdomadaires manager-collaborateur.',
        sections: ['Succès de la semaine', 'Challenges', 'Feedback', 'Plan de développement'],
        category: 'RH',
        color: 'green'
      },
      {
        id: 'brainstorm',
        name: 'Brainstorming',
        description: 'Session créative pour générer et structurer de nouvelles idées.',
        sections: ['Contexte', 'Idées Brutes', 'Top 3', 'Plan d\'expérimentation'],
        category: 'Créatif',
        color: 'orange'
      },
      {
        id: 'sales-disco',
        name: 'Découverte Commerciale',
        description: 'Qualification des besoins client et identification des opportunités.',
        sections: ['Contexte Client', 'Pain Points', 'Budget & Timeline', 'Décideurs'],
        category: 'Vente',
        color: 'pink'
      },
  ];

  return (
    <div className="screen templates-library">
      <div className="page-header-simple">
        <div className="header-content">
          <h2>Templates de Réunion</h2>
          <p>Standardisez vos comptes-rendus avec nos modèles professionnels</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedTemplate && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--accent)'
            }}>
              <Layout size={16} />
              <span>{selectedTemplate.name}</span>
              <button 
                onClick={() => handleUseTemplate(selectedTemplate)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Désélectionner ce template"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Créer un template
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className={`template-icon ${template.color}`}>
              <Layout size={24} />
            </div>
            
            <div className="template-body">
              <span className="template-category">{template.category}</span>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              
              <div className="template-sections">
                <h4>Sections incluses :</h4>
                <div className="sections-list">
                  {template.sections.slice(0, 3).map((s, i) => (
                    <span key={i} className="section-tag">{s}</span>
                  ))}
                  {template.sections.length > 3 && (
                    <span className="section-tag more">+{template.sections.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="template-footer">
              <button 
                className={`btn-outline-sm ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleUseTemplate(template)}
              >
                {selectedTemplate?.id === template.id ? '✓ Sélectionné' : 'Utiliser ce modèle'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Créer un template personnalisé</h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nom du template</label>
                <input
                  type="text"
                  placeholder="ex: Réunion Client"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Décrivez l'usage de ce template..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Catégorie</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  <option value="Général">Général</option>
                  <option value="Agile">Agile</option>
                  <option value="RH">RH</option>
                  <option value="Créatif">Créatif</option>
                  <option value="Vente">Vente</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sections du rapport</label>
                {newTemplate.sections.map((section, index) => (
                  <div key={index} className="section-input">
                    <input
                      type="text"
                      placeholder={`Section ${index + 1}`}
                      value={section}
                      onChange={(e) => updateSection(index, e.target.value)}
                    />
                    {newTemplate.sections.length > 1 && (
                      <button
                        className="btn-remove"
                        onClick={() => removeSection(index)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn-add-section" onClick={addSection}>
                  <Plus size={16} /> Ajouter une section
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleCreateTemplate}>
                <Save size={16} style={{ marginRight: '8px' }} />
                Créer le template
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .templates-library {
          padding: 24px;
          height: 100%;
          overflow-y: auto;
        }

        .page-header-simple {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .header-content h2 {
          font-family: 'Orbitron', sans-serif;
          font-size: 36px;
          margin-bottom: 8px;
          color: var(--text-primary);
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .header-content p {
          color: var(--text-secondary);
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .template-card {
           background: rgba(30, 41, 59, 0.4);
           border: 1px solid var(--border);
           border-radius: 16px;
           padding: 24px;
           transition: all 0.3s;
           display: flex;
           flex-direction: column;
        }

        .template-card:hover {
           transform: translateY(-5px);
           border-color: var(--accent);
           background: rgba(30, 41, 59, 0.7);
        }

        .template-icon {
           width: 48px;
           height: 48px;
           border-radius: 12px;
           display: flex;
           align-items: center;
           justify-content: center;
           margin-bottom: 20px;
        }

        .template-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .template-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .template-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .template-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
        .template-icon.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }

        .template-category {
           font-size: 11px;
           text-transform: uppercase;
           letter-spacing: 1px;
           font-weight: 600;
           color: var(--text-secondary);
           margin-bottom: 8px;
           display: block;
        }

        .template-card h3 {
           font-size: 18px;
           color: var(--text-primary);
           margin-bottom: 8px;
        }

        .template-card p {
           font-size: 14px;
           color: var(--text-secondary);
           line-height: 1.5;
           margin-bottom: 24px;
           flex: 1;
        }

        .template-sections h4 {
           font-size: 12px;
           color: var(--text-tertiary);
           margin-bottom: 12px;
        }

        .sections-list {
           display: flex;
           flex-wrap: wrap;
           gap: 8px;
           margin-bottom: 24px;
        }

        .section-tag {
           font-size: 11px;
           padding: 4px 8px;
           background: rgba(255, 255, 255, 0.05);
           border-radius: 4px;
           color: var(--text-secondary);
        }
        
        .section-tag.more {
           background: rgba(255, 255, 255, 0.1);
           color: var(--text-primary);
        }

        .btn-outline-sm {
           width: 100%;
           padding: 8px;
           border: 1px solid var(--border);
           background: transparent;
           color: var(--text-primary);
           border-radius: 8px;
           cursor: pointer;
           transition: all 0.2s;
           font-size: 13px;
        }

        .btn-outline-sm:hover {
           background: rgba(255, 255, 255, 0.05);
           border-color: var(--text-primary);
        }

        .btn-outline-sm.selected {
          background: linear-gradient(135deg, var(--color-primary-branding), var(--color-accent-branding));
          color: white;
          border-color: var(--color-primary-branding);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-medium);
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--color-border-medium);
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 700;
          font-family: 'Orbitron', sans-serif;
          color: var(--color-text-primary);
          margin: 0;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-medium);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--color-primary-branding);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
        }

        .section-input {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .section-input input {
          flex: 1;
        }

        .btn-remove {
          background: var(--color-error);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-remove:hover {
          background: #c92a2a;
        }

        .btn-add-section {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px dashed var(--color-border-medium);
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-add-section:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-primary-branding);
          color: var(--color-primary-branding);
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 24px;
          border-top: 1px solid var(--color-border-medium);
        }

        .btn-secondary {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-medium);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--color-bg-tertiary);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          background: var(--color-primary-branding);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.5);
        }
      `}</style>
    </div>
  );
}
