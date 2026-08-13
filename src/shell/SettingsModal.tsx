import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useI18n } from '../i18n';
import { type Language } from '../i18n/language';
import {
  exportBackup,
  importBackup,
  wipeAllData,
  exportTransactionsCsv,
  exportRidesCsv,
  exportPeopleCsv,
  exportJournalMarkdown,
  exportKnowledgeMarkdown,
} from '../storage/backup';
import { ConfirmDialog, Modal } from '../ui';
import {
  Database,
  Sliders,
  SlidersHorizontal,
  Trash2,
  Download,
  Upload,
  Info,
  ExternalLink,
  User,
  ShieldAlert,
} from 'lucide-react';
import type { ThemeType, ThemeMode } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    theme,
    setTheme,
    themeMode,
    setThemeMode,
    userName,
    setUserName,
    accentColor,
    setAccentColor,
    fontSizeScale,
    setFontSizeScale,
    animations,
    setAnimations,
    graphicsMode,
    setGraphicsMode,
    addToast,
  } = useApp();
  const { t, lang, setLang } = useI18n();

  const { data, dispatch } = useData();

  const [importError, setImportError] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settings = data.settings;

  // DB Stats calculations
  const stats = useMemo(() => {
    // LocalStorage size in KB
    let bytes = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        bytes += (localStorage[key] || '').length * 2;
      }
    }
    const sizeKB = Math.round((bytes / 1024) * 100) / 100;

    return {
      people: data.people.length,
      tasks: data.tasks.length,
      transactions: data.transactions.length,
      reminders: data.reminders.length,
      rides: data.rides.length,
      routes: data.routes.length,
      maintenance: data.maintenance.length,
      gallery: data.galleryNotes.length,
      journal: data.journal.length,
      knowledge: data.knowledge.length,
      schedule: data.schedule.length,
      habits: data.habits.length,
      workouts: data.workouts.length,
      thoughts: data.thoughts.length,
      sizeKB,
    };
  }, [data]);

  // Settings update helpers
  const handleGraphSensitivityChange = (val: number) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settings,
          graphSensitivity: val,
        },
      },
    });
  };

  const handleGraphWeightChange = (key: keyof typeof settings.graphWeights, val: number) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settings,
          graphWeights: {
            ...settings.graphWeights,
            [key]: val,
          },
        },
      },
    });
  };

  const handleWeekStartDayChange = (val: 0 | 1) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settings,
          weekStartDay: val,
        },
      },
    });
  };

  // Backup handlers
  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportBackup(data);
      addToast(t('toast.export_success'), 'success');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch {
      addToast(t('toast.export_error'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setPendingImportFile(file);
    setShowImportConfirm(true);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return;
    setImportError(null);
    setIsImporting(true);
    try {
      const importedData = await importBackup(pendingImportFile);
      dispatch({ type: 'IMPORT', payload: importedData });
      addToast(t('toast.import_success'), 'success');
      setShowImportConfirm(false);
      setPendingImportFile(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t('error.import_validation'));
      addToast(t('toast.import_error'), 'error');
      setShowImportConfirm(false);
      setPendingImportFile(null);
    } finally {
      setIsImporting(false);
    }
  };

  const handleWipeData = () => {
    setShowWipeConfirm(true);
  };

  const handleConfirmWipe = () => {
    wipeAllData();
    addToast(t('toast.wipe_success'), 'success');
    setShowWipeConfirm(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  const footer = (
    <div className="settings-footer" style={{ width: '100%' }}>
      <button className="btn btn--primary" onClick={onClose}>
        {t('settings.close')}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t('settings.title')}
      maxWidth="lg"
      className="settings-modal-container"
      footer={footer}
    >
      <div
        className="settings-modal-body"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', padding: 0 }}
      >
        {/* Settings Section */}
        <div className="settings-grid-2">
          {/* LEFT COLUMN: Visual & Core Settings */}
          <div className="settings-col">
            <div>
              <h3 className="settings-section-title">
                <Sliders size={14} /> {t('settings.core_params')}
              </h3>

              {/* User name */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.user_name')}</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <User size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="settings-select"
                    placeholder={t('settings.user_name_placeholder')}
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Theme mode */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.theme_mode')}</label>
                <select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
                  className="settings-select"
                >
                  <option value="manual">{t('settings.theme_mode.manual')}</option>
                  <option value="adaptive">{t('settings.theme_mode.adaptive')}</option>
                  <option value="system">{t('settings.theme_mode.system')}</option>
                </select>
              </div>

              {themeMode === 'manual' && (
                <div className="settings-form-group">
                  <label className="settings-label">{t('settings.theme')}</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ThemeType)}
                    className="settings-select"
                  >
                    <option value="slate">{t('settings.theme.slate')}</option>
                    <option value="mindveyz">{t('settings.theme.mindveyz')}</option>
                    <option value="cyclist">{t('settings.theme.cyclist')}</option>
                    <option value="reflect">{t('settings.theme.reflect')}</option>
                  </select>
                </div>
              )}

              {themeMode === 'system' && (
                <p className="settings-hint">{t('settings.theme_system_hint')}</p>
              )}

              {/* Accent Color switcher */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.accent_color')}</label>
                <div className="settings-accents-row">
                  {(['purple', 'orange', 'green', 'blue', 'rose'] as const).map((color) => {
                    const isActive = accentColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAccentColor(color)}
                        className={`settings-accent-btn ${color} ${isActive ? 'active' : ''}`}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Font Scaling */}
              <div className="settings-form-group">
                <label className="settings-slider-label">
                  <span>{t('settings.font_scale')}</span>
                  <strong>{Math.round(fontSizeScale * 100)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={fontSizeScale}
                  onChange={(e) => setFontSizeScale(Number(e.target.value))}
                  className="settings-slider"
                />
              </div>

              {/* Week Start Day */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.week_start')}</label>
                <select
                  value={settings.weekStartDay}
                  onChange={(e) => handleWeekStartDayChange(Number(e.target.value) as 0 | 1)}
                  className="settings-select"
                >
                  <option value={1}>{t('settings.week_start.monday')}</option>
                  <option value={0}>{t('settings.week_start.sunday')}</option>
                </select>
              </div>

              {/* Language */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.language')}</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="settings-select"
                >
                  <option value="ru">{t('settings.language.ru')}</option>
                  <option value="en">{t('settings.language.en')}</option>
                </select>
              </div>

              {/* Animations */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.animations')}</label>
                <select
                  value={animations}
                  onChange={(e) => setAnimations(e.target.value as 'on' | 'off' | 'system')}
                  className="settings-select"
                >
                  <option value="system">{t('settings.animations.system')}</option>
                  <option value="on">{t('settings.animations.on')}</option>
                  <option value="off">{t('settings.animations.off')}</option>
                </select>
              </div>

              {/* Graphics Mode */}
              <div className="settings-form-group">
                <label className="settings-label">{t('settings.graphics')}</label>
                <select
                  value={graphicsMode}
                  onChange={(e) => setGraphicsMode(e.target.value as 'high' | 'low')}
                  className="settings-select"
                >
                  <option value="high">{t('settings.graphics.high')}</option>
                  <option value="low">{t('settings.graphics.low')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Graph Algorithm tuning */}
          <div className="settings-col">
            <div>
              <h3 className="settings-section-title">
                <SlidersHorizontal size={14} /> {t('settings.graph_tuning')}
              </h3>

              {/* Sensitivity */}
              <div className="settings-form-group">
                <label className="settings-slider-label">
                  <span>{t('settings.graph_sensitivity')}</span>
                  <strong>{settings.graphSensitivity} / 10</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.graphSensitivity}
                  onChange={(e) => handleGraphSensitivityChange(Number(e.target.value))}
                  className="settings-slider"
                />
              </div>

              {/* Weights coefficients */}
              <div className="settings-weights-panel">
                <span className="settings-weights-header">{t('settings.graph_weights')}</span>

                {/* Energy weight */}
                <div>
                  <label className="settings-weight-label">
                    <span>{t('settings.weight.energy')}</span>
                    <strong>{settings.graphWeights.energy.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.graphWeights.energy}
                    onChange={(e) => handleGraphWeightChange('energy', Number(e.target.value))}
                    className="settings-weight-slider"
                  />
                </div>

                {/* Resonance weight */}
                <div>
                  <label className="settings-weight-label">
                    <span>{t('settings.weight.resonance')}</span>
                    <strong>{settings.graphWeights.resonance.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.graphWeights.resonance}
                    onChange={(e) => handleGraphWeightChange('resonance', Number(e.target.value))}
                    className="settings-weight-slider"
                  />
                </div>

                {/* Reciprocity weight */}
                <div>
                  <label className="settings-weight-label">
                    <span>{t('settings.weight.reciprocity')}</span>
                    <strong>{settings.graphWeights.reciprocity.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.graphWeights.reciprocity}
                    onChange={(e) => handleGraphWeightChange('reciprocity', Number(e.target.value))}
                    className="settings-weight-slider"
                  />
                </div>

                {/* Volatility weight */}
                <div>
                  <label className="settings-weight-label">
                    <span>{t('settings.weight.volatility')}</span>
                    <strong>{settings.graphWeights.volatility.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.graphWeights.volatility}
                    onChange={(e) => handleGraphWeightChange('volatility', Number(e.target.value))}
                    className="settings-weight-slider"
                  />
                </div>

                {/* Recency weight */}
                <div>
                  <label className="settings-weight-label">
                    <span>{t('settings.weight.recency')}</span>
                    <strong>{settings.graphWeights.recency.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.graphWeights.recency}
                    onChange={(e) => handleGraphWeightChange('recency', Number(e.target.value))}
                    className="settings-weight-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database stats */}
        <div className="settings-db-stats-grid">
          <div>
            <h3 className="settings-section-title">
              <Database size={14} /> {t('settings.db_stats')}
            </h3>
            <div className="settings-db-stats-panel">
              <div className="settings-db-stats-row">
                <span>{t('settings.db.social_contacts')}</span>
                <strong>{stats.people}</strong>
              </div>
              <div className="settings-db-stats-row">
                <span>{t('settings.db.active_tasks')}</span>
                <strong>{stats.tasks}</strong>
              </div>
              <div className="settings-db-stats-row">
                <span>{t('settings.db.finance_transactions')}</span>
                <strong>{stats.transactions}</strong>
              </div>
              <div className="settings-db-stats-row">
                <span>{t('settings.db.cycling_rides')}</span>
                <strong>{stats.rides}</strong>
              </div>
              <div className="settings-db-stats-row">
                <span>{t('settings.db.maintenance_notes')}</span>
                <strong>
                  {stats.maintenance} / {stats.gallery}
                </strong>
              </div>
              <div className="settings-db-stats-row">
                <span>{t('settings.db.journal_habits')}</span>
                <strong>
                  {stats.journal} / {stats.habits}
                </strong>
              </div>
              <div className="settings-db-stats-row">
                <span>{t('settings.db.thoughts_knowledge')}</span>
                <strong>
                  {stats.thoughts} / {stats.knowledge}
                </strong>
              </div>
              <div className="settings-db-stats-row-total">
                <span>{t('settings.db.storage_size')}</span>
                <span>
                  {stats.sizeKB} {t('settings.db.kb')}
                </span>
              </div>
            </div>
          </div>

          {/* Backups & Actions */}
          <div>
            <h3 className="settings-section-title">{t('settings.backup_title')}</h3>

            <div className="settings-actions-panel">
              <div className="settings-actions-row">
                <button
                  className="btn btn--secondary settings-actions-btn"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download size={14} />{' '}
                  {isExporting
                    ? t('settings.exporting')
                    : exportSuccess
                      ? t('settings.export_done')
                      : t('settings.export_json')}
                </button>

                <button
                  className="btn btn--secondary settings-actions-btn"
                  onClick={handleImportClick}
                  disabled={isImporting}
                >
                  <Upload size={14} />{' '}
                  {isImporting ? t('settings.importing') : t('settings.import_json')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
              </div>

              {importError && (
                <p className="settings-import-error">
                  <Info size={12} /> {importError}
                </p>
              )}

              <div className="settings-csv-section">
                <span className="settings-csv-title">{t('settings.csv_export')}</span>
                <div className="settings-actions-row">
                  <button
                    className="btn btn--secondary settings-actions-btn"
                    onClick={() => {
                      exportTransactionsCsv(data);
                      addToast(t('toast.transactions_exported'), 'success');
                    }}
                  >
                    <Download size={14} /> {t('settings.csv.transactions')}
                  </button>
                  <button
                    className="btn btn--secondary settings-actions-btn"
                    onClick={() => {
                      exportRidesCsv(data);
                      addToast(t('toast.rides_exported'), 'success');
                    }}
                  >
                    <Download size={14} /> {t('settings.csv.rides')}
                  </button>
                  <button
                    className="btn btn--secondary settings-actions-btn"
                    onClick={() => {
                      exportPeopleCsv(data);
                      addToast(t('toast.contacts_exported'), 'success');
                    }}
                  >
                    <Download size={14} /> {t('settings.csv.contacts')}
                  </button>
                </div>
                <div className="settings-actions-row" style={{ marginTop: '8px' }}>
                  <button
                    className="btn btn--secondary settings-actions-btn"
                    onClick={() => {
                      exportJournalMarkdown(data);
                      addToast(t('reflect.journal.toast_exported_md'), 'success');
                    }}
                  >
                    <Download size={14} /> {t('reflect.journal.export_md')} (Journal)
                  </button>
                  <button
                    className="btn btn--secondary settings-actions-btn"
                    onClick={() => {
                      exportKnowledgeMarkdown(data);
                      addToast(t('reflect.knowledge.toast_exported_md'), 'success');
                    }}
                  >
                    <Download size={14} /> {t('reflect.knowledge.export_md')} (Zettelkasten)
                  </button>
                </div>
              </div>

              <div className="settings-wipe-panel">
                <span className="settings-wipe-text">{t('settings.danger_zone')}</span>
                <button className="btn btn--danger btn--sm" onClick={handleWipeData}>
                  <Trash2 size={14} /> {t('settings.wipe_all')}
                </button>
              </div>

              <div
                style={{
                  marginTop: 'var(--sp-4)',
                  padding: 'var(--sp-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: 'var(--sp-2)',
                  alignItems: 'flex-start',
                }}
              >
                <ShieldAlert
                  size={16}
                  style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }}
                />
                <span>{t('settings.security_notice')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About section */}
        <div className="settings-about">
          <div className="settings-about-content">
            <strong>LifeOS</strong> — open-source platform for managing social connections, finance,
            cycling, reflection, and habits.
          </div>
          <div className="settings-about-author">
            Created by{' '}
            <a href="https://github.com/m0rvey" target="_blank" rel="noopener noreferrer">
              m0rvey <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation for Wipe operations */}
      <ConfirmDialog
        isOpen={showWipeConfirm}
        onConfirm={handleConfirmWipe}
        onCancel={() => setShowWipeConfirm(false)}
        title={t('confirm.wipe_title')}
        message={t('confirm.wipe_message')}
        confirmLabel={t('confirm.wipe_confirm')}
        cancelLabel={t('action.cancel')}
        variant="danger"
        requireTyping={t('confirm.wipe_require_typing')}
      />

      {/* Confirmation for Import operations */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportFile(null);
        }}
        title={t('confirm.import_title')}
        message={t('confirm.import_message')}
        confirmLabel={t('confirm.import_confirm')}
        cancelLabel={t('action.cancel')}
        variant="danger"
      />
    </Modal>
  );
}
