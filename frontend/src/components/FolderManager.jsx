import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { FolderPlus, Edit2, Trash2, Palette, Type, X, Check } from 'lucide-react'

export const FolderManager = ({ userId, onFolderSelect, selectedFolderId }) => {
  const [folders, setFolders] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [newFolder, setNewFolder] = useState({
    name: '',
    color: '#667eea',
    icon: '📁',
    description: ''
  })

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      const data = await api.getFolders(userId)
      setFolders(data.folders || [])
    } catch (error) {
      console.error('Failed to load folders:', error)
    }
  }

  const handleCreateFolder = async () => {
    try {
      const result = await api.createFolder(
        userId,
        newFolder.name,
        newFolder.color,
        newFolder.icon,
        newFolder.description
      )
      if (result.success) {
        await loadFolders()
        setShowCreateModal(false)
        setNewFolder({ name: '', color: '#667eea', icon: '📁', description: '' })
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (confirm('Delete this folder? Items will not be deleted.')) {
      try {
        await api.deleteFolder(userId, folderId)
        await loadFolders()
      } catch (error) {
        console.error('Failed to delete folder:', error)
      }
    }
  }

  const colors = ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  const icons = ['📁', '📚', '📖', '🎓', '💡', '⭐', '🔥', '📝', '🔬', '📊']

  return (
    <>
      <div className="folder-manager">
        <div className="folder-header">
          <h3>My Workspaces</h3>
          <button 
            className="create-folder-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FolderPlus size={18} />
            <span>New Folder</span>
          </button>
        </div>

        <div className="folders-grid">
          {folders.map(folder => (
            <div 
              key={folder.id}
              className={`folder-card ${selectedFolderId === folder.id ? 'selected' : ''}`}
              onClick={() => onFolderSelect?.(folder.id)}
              style={{ borderColor: folder.color }}
            >
              <div className="folder-icon" style={{ backgroundColor: `${folder.color}20` }}>
                <span style={{ fontSize: '2rem' }}>{folder.icon}</span>
              </div>
              <div className="folder-info">
                <h4>{folder.name}</h4>
                {folder.description && <p>{folder.description}</p>}
                <div className="folder-stats">
                  <span>{folder.upload_ids?.length || 0} uploads</span>
                  <span>{folder.quiz_ids?.length || 0} quizzes</span>
                </div>
              </div>
              <div className="folder-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingFolder(folder)
                  }}
                  className="edit-btn"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(folder.id)
                  }}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFolder) && (
        <div className="folder-modal-overlay" onClick={() => {
          setShowCreateModal(false)
          setEditingFolder(null)
        }}>
          <div className="folder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingFolder ? 'Edit Folder' : 'Create New Folder'}</h3>
              <button onClick={() => {
                setShowCreateModal(false)
                setEditingFolder(null)
              }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  value={editingFolder?.name || newFolder.name}
                  onChange={(e) => editingFolder
                    ? setEditingFolder({ ...editingFolder, name: e.target.value })
                    : setNewFolder({ ...newFolder, name: e.target.value })
                  }
                  placeholder="e.g., Biology 101"
                />
              </div>

              <div className="form-group">
                <label>Icon</label>
                <div className="icon-selector">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      className={`icon-option ${(editingFolder?.icon || newFolder.icon) === icon ? 'selected' : ''}`}
                      onClick={() => editingFolder
                        ? setEditingFolder({ ...editingFolder, icon })
                        : setNewFolder({ ...newFolder, icon })
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-selector">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${(editingFolder?.color || newFolder.color) === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => editingFolder
                        ? setEditingFolder({ ...editingFolder, color })
                        : setNewFolder({ ...newFolder, color })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={editingFolder?.description || newFolder.description}
                  onChange={(e) => editingFolder
                    ? setEditingFolder({ ...editingFolder, description: e.target.value })
                    : setNewFolder({ ...newFolder, description: e.target.value })
                  }
                  placeholder="Describe this workspace..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingFolder(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={async () => {
                    if (editingFolder) {
                      await api.updateFolder(userId, editingFolder.id, editingFolder)
                      await loadFolders()
                      setEditingFolder(null)
                    } else {
                      await handleCreateFolder()
                    }
                  }}
                >
                  {editingFolder ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .folder-manager {
          margin-bottom: 2rem;
        }

        .folder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .folder-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .create-folder-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-folder-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .folder-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .folder-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .folder-card.selected {
          border-width: 3px;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }

        .folder-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .folder-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .folder-info p {
          margin: 0 0 1rem 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .folder-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .folder-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .delete-btn {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .folder-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .folder-modal {
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .modal-header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        .icon-selector,
        .color-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .icon-option,
        .color-option {
          width: 48px;
          height: 48px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .icon-option:hover,
        .color-option:hover {
          border-color: #667eea;
          transform: scale(1.1);
        }

        .icon-option.selected,
        .color-option.selected {
          border-color: #667eea;
          border-width: 3px;
          box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .cancel-btn,
        .save-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .save-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}


