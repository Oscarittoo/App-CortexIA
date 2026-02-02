import { useState } from 'react';
import { Plus, X, Edit2, Trash2, Check } from 'lucide-react';

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'
];

export default function TagManager({ tags = [], onAddTag, onRemoveTag, onUpdateTag }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [tagColors, setTagColors] = useState({});

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim());
      setNewTagName('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (tag) => {
    setEditingTag(tag);
    setEditName(tag);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editingTag) {
      onUpdateTag(editingTag, editName.trim());
      setEditingTag(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditName('');
  };

  const getTagColor = (tag, index) => {
    return tagColors[tag] || TAG_COLORS[index % TAG_COLORS.length];
  };

  return (
    <div className="tag-manager">
      <div className="tag-manager-header">
        <h3>Manage Tags</h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={16} />
          Add Tag
        </button>
      </div>

      {isAdding && (
        <div className="tag-input-row">
          <input
            type="text"
            className="input"
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleAddTag}>
            <Check size={16} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setIsAdding(false);
              setNewTagName('');
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="tags-list">
        {tags.map((tag, index) => (
          <div key={tag} className="tag-item">
            {editingTag === tag ? (
              <div className="tag-edit-row">
                <input
                  type="text"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                  <Check size={14} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div
                  className="tag-badge"
                  style={{ backgroundColor: getTagColor(tag, index) }}
                >
                  {tag}
                </div>
                <div className="tag-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleStartEdit(tag)}
                    title="Edit tag"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onRemoveTag(tag)}
                    title="Delete tag"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {tags.length === 0 && !isAdding && (
          <div className="empty-state">
            <p>No tags yet. Create your first tag to organize sessions.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .tag-manager {
          width: 100%;
        }

        .tag-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .tag-manager-header h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }

        .tag-input-row,
        .tag-edit-row {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          align-items: center;
        }

        .tag-input-row input,
        .tag-edit-row input {
          flex: 1;
        }

        .tags-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .tag-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3);
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .tag-item:hover {
          background-color: var(--color-bg-hover);
        }

        .tag-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-1) var(--space-3);
          color: white;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-radius: var(--radius-full);
        }

        .tag-actions {
          display: flex;
          gap: var(--space-1);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-8);
          color: var(--color-text-tertiary);
        }

        .empty-state p {
          margin: 0;
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
}
