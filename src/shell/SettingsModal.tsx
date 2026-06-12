import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { exportBackup, importBackup, wipeAllData } from '../storage/backup';
import { ConfirmDialog, Modal } from '../ui';
import { Database, Sliders, SlidersHorizontal, Trash2, Download, Upload, Info } from 'lucide-react';
import type { ThemeType } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    theme,
    setTheme,
    isAdaptive,
    setIsAdaptive,
    accentColor,
    setAccentColor,
    fontSizeScale,
    setFontSizeScale,
    addToast,
  } = useApp();

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
        bytes += ((localStorage[key] || '').length * 2);
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
      addToast('Резервная копия успешно экспортирована', 'success');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch {
      addToast('Не удалось экспортировать файл', 'error');
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
      addToast('Данные успешно импортированы!', 'success');
      setShowImportConfirm(false);
      setPendingImportFile(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Неизвестная ошибка валидации файла');
      addToast('Ошибка импорта резервной копии', 'error');
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
    addToast('Все данные были сброшены к начальным настройкам', 'success');
    setShowWipeConfirm(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  const footer = (
    <div className="settings-footer" style={{ width: '100%' }}>
      <button className="btn btn--primary" onClick={onClose}>
        Закрыть
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Настройки платформы"
      maxWidth="lg"
      className="settings-modal-container"
      footer={footer}
    >
      <div className="settings-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', padding: 0 }}>
          {/* Settings Section */}
          <div className="settings-grid-2">
            
            {/* LEFT COLUMN: Visual & Core Settings */}
            <div className="settings-col">
              <div>
                <h3 className="settings-section-title">
                  <Sliders size={14} /> Основные параметры
                </h3>
                
                {/* Theme mode */}
                <div className="settings-row-align">
                  <span>Автоматическая тема модулей</span>
                  <input
                    type="checkbox"
                    checked={isAdaptive}
                    onChange={e => setIsAdaptive(e.target.checked)}
                    className="settings-checkbox"
                  />
                </div>
                
                {!isAdaptive && (
                  <div className="settings-form-group">
                    <label className="settings-label">Тема оформления</label>
                    <select
                      value={theme}
                      onChange={e => setTheme(e.target.value as ThemeType)}
                      className="settings-select"
                    >
                      <option value="slate">Slate (Нейтрально-темная)</option>
                      <option value="mindveyz">MindVeyZ (Стеклянный фиолетовый)</option>
                      <option value="cyclist">Cyclist (Оранжевый спорт)</option>
                      <option value="reflect">Reflect (Минималистично-светлая)</option>
                    </select>
                  </div>
                )}

                {/* Accent Color switcher */}
                <div className="settings-form-group">
                  <label className="settings-label">Цветовой акцент</label>
                  <div className="settings-accents-row">
                    {(['purple', 'orange', 'green', 'blue', 'rose'] as const).map(color => {
                      const colorHex = 
                        color === 'purple' ? '#a855f7' :
                        color === 'orange' ? '#f97316' :
                        color === 'green' ? '#22c55e' :
                        color === 'blue' ? '#3b82f6' :
                        '#ec4899';
                      const isActive = accentColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAccentColor(color)}
                          className={`settings-accent-btn ${isActive ? 'active' : ''}`}
                          style={{ background: colorHex }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Font Scaling */}
                <div className="settings-form-group">
                  <label className="settings-slider-label">
                    <span>Масштаб шрифта</span>
                    <strong>{Math.round(fontSizeScale * 100)}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={fontSizeScale}
                    onChange={e => setFontSizeScale(Number(e.target.value))}
                    className="settings-slider"
                  />
                </div>

                {/* Week Start Day */}
                <div className="settings-form-group">
                  <label className="settings-label">Первый день недели</label>
                  <select
                    value={settings.weekStartDay}
                    onChange={e => handleWeekStartDayChange(Number(e.target.value) as 0 | 1)}
                    className="settings-select"
                  >
                    <option value={1}>Понедельник</option>
                    <option value={0}>Воскресенье</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Graph Algorithm tuning */}
            <div className="settings-col">
              <div>
                <h3 className="settings-section-title">
                  <SlidersHorizontal size={14} /> Настройка алгоритмов графа
                </h3>

                {/* Sensitivity */}
                <div className="settings-form-group">
                  <label className="settings-slider-label">
                    <span>Чувствительность графа</span>
                    <strong>{settings.graphSensitivity} / 10</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={settings.graphSensitivity}
                    onChange={e => handleGraphSensitivityChange(Number(e.target.value))}
                    className="settings-slider"
                  />
                </div>

                {/* Weights coefficients */}
                <div className="settings-weights-panel">
                  <span className="settings-weights-header">Коэффициенты силы связи</span>
                  
                  {/* Energy weight */}
                  <div>
                    <label className="settings-weight-label">
                      <span>Энергетический вклад</span>
                      <strong>{settings.graphWeights.energy.toFixed(2)}</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.graphWeights.energy}
                      onChange={e => handleGraphWeightChange('energy', Number(e.target.value))}
                      className="settings-weight-slider"
                    />
                  </div>

                  {/* Resonance weight */}
                  <div>
                    <label className="settings-weight-label">
                      <span>Интеллектуальный резонанс</span>
                      <strong>{settings.graphWeights.resonance.toFixed(2)}</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.graphWeights.resonance}
                      onChange={e => handleGraphWeightChange('resonance', Number(e.target.value))}
                      className="settings-weight-slider"
                    />
                  </div>

                  {/* Reciprocity weight */}
                  <div>
                    <label className="settings-weight-label">
                      <span>Взаимность общения</span>
                      <strong>{settings.graphWeights.reciprocity.toFixed(2)}</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.graphWeights.reciprocity}
                      onChange={e => handleGraphWeightChange('reciprocity', Number(e.target.value))}
                      className="settings-weight-slider"
                    />
                  </div>

                  {/* Volatility weight */}
                  <div>
                    <label className="settings-weight-label">
                      <span>Конфликтность/Изменчивость (-)</span>
                      <strong>{settings.graphWeights.volatility.toFixed(2)}</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.graphWeights.volatility}
                      onChange={e => handleGraphWeightChange('volatility', Number(e.target.value))}
                      className="settings-weight-slider"
                    />
                  </div>

                  {/* Recency weight */}
                  <div>
                    <label className="settings-weight-label">
                      <span>Штраф за давность контакта (-)</span>
                      <strong>{settings.graphWeights.recency.toFixed(2)}</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.graphWeights.recency}
                      onChange={e => handleGraphWeightChange('recency', Number(e.target.value))}
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
                <Database size={14} /> Статистика базы данных
              </h3>
              <div className="settings-db-stats-panel">
                <div className="settings-db-stats-row">
                  <span>Социальных контактов:</span>
                  <strong>{stats.people}</strong>
                </div>
                <div className="settings-db-stats-row">
                  <span>Активных задач:</span>
                  <strong>{stats.tasks}</strong>
                </div>
                <div className="settings-db-stats-row">
                  <span>Финансовых транзакций:</span>
                  <strong>{stats.transactions}</strong>
                </div>
                <div className="settings-db-stats-row">
                  <span>Велозаездов:</span>
                  <strong>{stats.rides}</strong>
                </div>
                <div className="settings-db-stats-row">
                  <span>Записей ТО / заметок:</span>
                  <strong>{stats.maintenance} / {stats.gallery}</strong>
                </div>
                <div className="settings-db-stats-row">
                  <span>Дневник / Привычки:</span>
                  <strong>{stats.journal} / {stats.habits}</strong>
                </div>
                <div className="settings-db-stats-row">
                  <span>Мыслей в музее / Знаний:</span>
                  <strong>{stats.thoughts} / {stats.knowledge}</strong>
                </div>
                <div className="settings-db-stats-row-total">
                  <span>Размер данных (localStorage):</span>
                  <span>{stats.sizeKB} КБ</span>
                </div>
              </div>
            </div>

            {/* Backups & Actions */}
            <div>
              <h3 className="settings-section-title">
                Резервное копирование и сброс
              </h3>
              
              <div className="settings-actions-panel">
                <div className="settings-actions-row">
                  <button 
                    className="btn btn--secondary settings-actions-btn" 
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    <Download size={14} /> {isExporting ? 'Экспорт...' : exportSuccess ? 'Готово!' : 'Экспорт JSON'}
                  </button>
                  
                  <button 
                    className="btn btn--secondary settings-actions-btn" 
                    onClick={handleImportClick}
                    disabled={isImporting}
                  >
                    <Upload size={14} /> {isImporting ? 'Импорт...' : 'Импорт JSON'}
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

                <div className="settings-wipe-panel">
                  <span className="settings-wipe-text">
                    Опасная зона: безвозвратно удаляет всю базу данных, включая велотренировки и контакты.
                  </span>
                  <button className="btn btn--danger btn--sm" onClick={handleWipeData}>
                    <Trash2 size={14} /> Сбросить всю базу данных
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Confirmation for Wipe operations */}
      <ConfirmDialog
        isOpen={showWipeConfirm}
        onConfirm={handleConfirmWipe}
        onCancel={() => setShowWipeConfirm(false)}
        title="Удаление всей базы данных"
        message="ВНИМАНИЕ: Это полностью очистит ваше локальное хранилище и удалит все велотренировки, контакты, задачи и записи капитала. Восстановление будет невозможно без файла резервной копии."
        confirmLabel="Сбросить всё"
        cancelLabel="Отмена"
        variant="danger"
        requireTyping="СБРОС"
      />

      {/* Confirmation for Import operations */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportFile(null);
        }}
        title="Импортировать резервную копию?"
        message="Вы уверены, что хотите импортировать этот файл? Все текущие данные будут заменены данными из резервной копии."
        confirmLabel="Импортировать"
        cancelLabel="Отмена"
        variant="danger"
      />
    </Modal>
  );
}
