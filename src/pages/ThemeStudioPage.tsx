import React, { useState } from 'react';
import { useTheme, THEME_PRESETS } from '../context/ThemeContext';
import { playGentleChime } from '../services/audio';
import {
  isValidHex,
  normalizeHex,
  checkTextContrast,
} from '../utils/colorUtils';
import type {
  HeadingFont,
  BodyFont,
  AppearanceMode,
  CardStyle,
  SidebarStyle,
  BackgroundPattern,
} from '../types';
import {
  Palette,
  Type,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Flame,
  Sun,
  Moon,
  Laptop,
  Save,
  Undo2,
  ShieldAlert,
  Layers,
  Layout,
} from 'lucide-react';

export const ThemeStudioPage: React.FC = () => {
  const {
    draftTheme,
    hasUnsavedChanges,
    isSaving,
    saveSuccess,
    setPreset,
    setAppearanceMode,
    updateColors,
    setHeadingFont,
    setBodyFont,
    setCardRadius,
    setCardStyle,
    setSidebarStyle,
    setBackgroundPattern,
    toggleSound,
    toggleConfetti,
    applyAndSaveTheme,
    undoChanges,
    resetTheme,
  } = useTheme();

  // Local state for hex text inputs to allow typing before blur/submit
  const [hexInputs, setHexInputs] = useState<Record<string, string>>({});
  const [interactiveCheck, setInteractiveCheck] = useState<boolean>(true);

  const headingFonts: HeadingFont[] = [
    'Fraunces',
    'Cormorant Garamond',
    'Playfair Display',
    'Plus Jakarta Sans',
    'Outfit',
  ];

  const bodyFonts: BodyFont[] = ['Plus Jakarta Sans', 'Inter', 'Outfit'];

  const radiusOptions: { value: string; label: string }[] = [
    { value: '4px', label: 'Sharp (4px)' },
    { value: '10px', label: 'Subtle (10px)' },
    { value: '18px', label: 'Soft (18px)' },
    { value: '26px', label: 'Rounded (26px)' },
    { value: '36px', label: 'Pill (36px)' },
  ];

  const cardStyleOptions: { id: CardStyle; label: string; desc: string }[] = [
    { id: 'subtle-shadow', label: 'Subtle Shadow', desc: 'Soft gentle elevation' },
    { id: 'flat', label: 'Clean Flat', desc: 'Minimal border, no shadow' },
    { id: 'glassmorphic', label: 'Frosted Glass', desc: 'Translucent backdrop blur' },
    { id: 'bordered', label: 'Defined Border', desc: 'Crisp 2px clean outline' },
  ];

  const sidebarOptions: { id: SidebarStyle; label: string; desc: string }[] = [
    { id: 'solid', label: 'Solid', desc: 'Clean opaque canvas' },
    { id: 'glass', label: 'Glassmorphic', desc: 'Frosted blur overlay' },
    { id: 'accented', label: 'Gradient Glow', desc: 'Delicate brand tint' },
  ];

  const patternOptions: { id: BackgroundPattern; label: string; desc: string }[] = [
    { id: 'none', label: 'None', desc: 'Solid serene surface' },
    { id: 'paper', label: 'Handmade Paper', desc: 'Stationery paper grain' },
    { id: 'dots', label: 'Micro Dots', desc: 'Gentle bullet grid' },
    { id: 'grid', label: 'Drafting Grid', desc: 'Refined architectural lines' },
    { id: 'floral', label: 'Botanical Leaves', desc: 'Whispering floral contours' },
    { id: 'wavy', label: 'Calming Waves', desc: 'Flowing harmonic ripples' },
  ];

  const colorFields: { key: keyof typeof draftTheme.colors; label: string; desc: string }[] = [
    { key: 'bgCanvas', label: 'Canvas Background', desc: 'Main webpage surface color' },
    { key: 'primary', label: 'Primary Brand Tone', desc: 'Main brand highlights & accents' },
    { key: 'secondary', label: 'Secondary Tone', desc: 'Subtle badges & supporting accents' },
    { key: 'accent', label: 'Interactive Accent', desc: 'Buttons, checkboxes & progress bars' },
    { key: 'cardBg', label: 'Card Surface', desc: 'Planner cards & module background' },
    { key: 'cardBorder', label: 'Card Border', desc: 'Dividers & container outline' },
    { key: 'textMain', label: 'Primary Text', desc: 'Headings & prominent text' },
    { key: 'textMuted', label: 'Muted Text', desc: 'Subtitles & gentle metadata' },
    { key: 'sidebarBg', label: 'Sidebar Background', desc: 'Navigation drawer background' },
  ];

  // Handle color change from native picker or hex text
  const handleHexChange = (key: keyof typeof draftTheme.colors, val: string) => {
    setHexInputs(prev => ({ ...prev, [key]: val }));
    if (isValidHex(val)) {
      updateColors({ [key]: normalizeHex(val) });
    }
  };

  // Contrast calculations for readability validation
  const canvasContrast = checkTextContrast(draftTheme.colors.textMain, draftTheme.colors.bgCanvas);
  const cardContrast = checkTextContrast(draftTheme.colors.textMain, draftTheme.colors.cardBg);

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            Theme Studio & Sanctuary
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Curate every shade, curve, and texture. Changes synchronize across all your devices.
          </p>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={resetTheme}
            className="btn btn-outline btn-sm"
            title="Restore original Blush Diary theme"
          >
            <RotateCcw size={14} />
            <span>Restore Default</span>
          </button>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={undoChanges}
              className="btn btn-outline btn-sm"
              title="Revert draft changes to last saved theme"
            >
              <Undo2 size={14} />
              <span>Undo Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={applyAndSaveTheme}
            disabled={isSaving}
            className="btn btn-primary btn-sm"
            style={{
              backgroundColor: saveSuccess ? 'var(--success)' : 'var(--primary)',
              boxShadow: saveSuccess
                ? '0 4px 12px rgba(136, 183, 149, 0.4)'
                : '0 4px 12px rgba(217, 155, 170, 0.4)',
            }}
          >
            {saveSuccess ? (
              <>
                <Check size={14} />
                <span>Theme Saved!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Apply & Save Theme'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div
          style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(217, 155, 170, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>
              You have active custom modifications. Your workspace reflects them live below!
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={undoChanges}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Undo
            </button>
            <button
              type="button"
              onClick={applyAndSaveTheme}
              disabled={isSaving}
              className="btn btn-primary btn-sm"
            >
              {isSaving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Studio Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="theme-studio-columns"
      >
        {/* Left Column: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Appearance Mode (Light / Dark / System) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sun size={17} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Appearance Mode</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(
                [
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'system', label: 'System Sync', icon: Laptop },
                ] as const
              ).map(opt => {
                const isSelected = draftTheme.appearanceMode === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAppearanceMode(opt.id as AppearanceMode)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <IconComponent size={20} />
                    <span style={{ fontSize: '0.84rem' }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Curated Starter Presets */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Curated Starter Presets</h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Editable base palettes
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                const isSelected = draftTheme.presetId === key;
                return (
                  <div
                    key={key}
                    onClick={() => setPreset(key)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(217, 155, 170, 0.25)' : 'none',
                    }}
                  >
                    {/* Swatches */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: preset.colors.bgCanvas,
                          border: '1px solid rgba(0,0,0,0.12)',
                        }}
                        title="Canvas Background"
                      />
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: preset.colors.primary,
                        }}
                        title="Primary Color"
                      />
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: preset.colors.secondary,
                        }}
                        title="Secondary Color"
                      />
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: preset.colors.accent,
                        }}
                        title="Accent Color"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            fontWeight: 600,
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.35 }}>
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Fine-Tune Colors with Pickers & HEX Inputs */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Custom Palette Studio</h3>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                HEX & Color Picker
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {colorFields.map(field => {
                const currentColor = draftTheme.colors[field.key] || '#FFFFFF';
                const inputValue = hexInputs[field.key] ?? currentColor;
                const isInvalid = !isValidHex(inputValue);

                return (
                  <div
                    key={field.key}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-canvas-subtle)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {field.label}
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Native Color Picker */}
                      <input
                        type="color"
                        value={isValidHex(currentColor) ? currentColor : '#D99BAA'}
                        onChange={e => {
                          const newHex = e.target.value.toUpperCase();
                          setHexInputs(prev => ({ ...prev, [field.key]: newHex }));
                          updateColors({ [field.key]: newHex });
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid var(--card-border)',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          padding: 0,
                        }}
                        title={`Select ${field.label}`}
                      />

                      {/* HEX text input */}
                      <input
                        type="text"
                        value={inputValue}
                        onChange={e => handleHexChange(field.key, e.target.value)}
                        placeholder="#RRGGBB"
                        maxLength={7}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: isInvalid ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                          backgroundColor: 'var(--card-bg)',
                          fontSize: '0.86rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-main)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      {field.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contrast Meter Warnings */}
            <div
              style={{
                marginTop: '18px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: canvasContrast.isCompliant ? 'var(--success-light)' : 'var(--danger-light)',
                border: canvasContrast.isCompliant
                  ? '1px solid rgba(136, 183, 149, 0.4)'
                  : '1px solid rgba(223, 123, 123, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ShieldAlert
                size={18}
                color={canvasContrast.isCompliant ? 'var(--success)' : 'var(--danger)'}
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: canvasContrast.isCompliant ? '#2E5A36' : 'var(--danger)',
                  }}
                >
                  Readability Contrast Check: {canvasContrast.ratio}:1 ({canvasContrast.level})
                </span>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                  {canvasContrast.message} Card contrast is {cardContrast.ratio}:1.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Typography & Lettering */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Type size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Typography & Lettering</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Heading Fonts */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  Serif Heading Font
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {headingFonts.map(font => {
                    const isSelected = draftTheme.headingFont === font;
                    return (
                      <button
                        key={font}
                        type="button"
                        onClick={() => setHeadingFont(font)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                          color: 'var(--text-main)',
                          fontFamily: font,
                          fontSize: '1.02rem',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                        }}
                      >
                        {font}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body Fonts */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  Sans-Serif Body Font
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {bodyFonts.map(font => {
                    const isSelected = draftTheme.bodyFont === font;
                    return (
                      <button
                        key={font}
                        type="button"
                        onClick={() => setBodyFont(font)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                          color: 'var(--text-main)',
                          fontFamily: font,
                          fontSize: '0.92rem',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                        }}
                      >
                        {font}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Card Shape & Visual Style */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Card Shape & Visual Style</h3>
            </div>

            {/* Radius */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Corner Roundness
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {radiusOptions.map(opt => {
                  const isSelected = draftTheme.cardRadius === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCardRadius(opt.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: opt.value,
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Style */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Elevation & Border Style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {cardStyleOptions.map(opt => {
                  const isSelected = draftTheme.cardStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCardStyle(opt.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1.8px solid var(--primary)' : '1px solid var(--card-border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Sidebar & Background Patterns */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Layout size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Sidebar & Background Patterns</h3>
            </div>

            {/* Sidebar Style */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Sidebar Surface Style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {sidebarOptions.map(opt => {
                  const isSelected = draftTheme.sidebarStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSidebarStyle(opt.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1.8px solid var(--primary)' : '1px solid var(--card-border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Pattern */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Subtle Background Pattern Overlay
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                {patternOptions.map(opt => {
                  const isSelected = draftTheme.backgroundPattern === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBackgroundPattern(opt.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1.8px solid var(--primary)' : '1px solid var(--card-border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7. Sensory Experience Toggles */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '14px' }}>
              Sensory Feedback
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Completion Chimes (Audio)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Soft harmonic chime when completing habits.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => playGentleChime(true)}
                    className="btn btn-ghost btn-sm"
                    title="Test audio chime"
                  >
                    Test ♫
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={draftTheme.soundEnabled ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  >
                    {draftTheme.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Confetti Celebrations
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Soft pastel sparkles on completing all routines for today.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleConfetti}
                  className={draftTheme.confettiEnabled ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                >
                  {draftTheme.confettiEnabled ? 'Enabled' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div
            className="card"
            style={{
              border: '2px solid var(--primary)',
              boxShadow: 'var(--card-shadow-hover)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--primary)" />
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--primary)',
                  }}
                >
                  Live Interactive Sanctuary Preview
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}
              >
                {draftTheme.colorMode.toUpperCase()}
              </span>
            </div>

            {/* Embedded Preview Canvas */}
            <div
              style={{
                backgroundColor: draftTheme.colors.bgCanvas,
                padding: '20px',
                borderRadius: draftTheme.cardRadius,
                border: `1px solid ${draftTheme.colors.cardBorder}`,
                marginBottom: '16px',
                transition: 'all 0.25s ease',
              }}
            >
              {/* Header preview with user fonts */}
              <h2
                style={{
                  fontFamily: draftTheme.headingFont,
                  fontSize: '1.5rem',
                  color: draftTheme.colors.textMain,
                  marginBottom: '4px',
                  lineHeight: 1.2,
                }}
              >
                Good morning, Muse ✨
              </h2>
              <p
                style={{
                  fontSize: '0.84rem',
                  color: draftTheme.colors.textMuted,
                  fontFamily: draftTheme.bodyFont,
                  marginBottom: '16px',
                }}
              >
                "Every conscious ritual shapes your story."
              </p>

              {/* Sample Habit Routine Card */}
              <div
                style={{
                  backgroundColor: draftTheme.colors.cardBg,
                  padding: '12px 14px',
                  borderRadius: draftTheme.cardRadius,
                  border: `1px solid ${draftTheme.colors.cardBorder}`,
                  boxShadow: draftTheme.cardStyle === 'subtle-shadow' ? draftTheme.colors.cardShadow : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Interactive Checkbox with Accent color */}
                  <button
                    type="button"
                    onClick={() => setInteractiveCheck(!interactiveCheck)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      backgroundColor: interactiveCheck ? draftTheme.colors.accent : 'transparent',
                      border: interactiveCheck ? 'none' : `2px solid ${draftTheme.colors.accent}`,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                    title="Click to test interactive accent checkbox"
                  >
                    {interactiveCheck && <Check size={14} strokeWidth={3} />}
                  </button>

                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      fontFamily: draftTheme.bodyFont,
                      color: draftTheme.colors.textMain,
                      textDecoration: interactiveCheck ? 'line-through' : 'none',
                      opacity: interactiveCheck ? 0.75 : 1,
                    }}
                  >
                    Matcha ritual & morning sun
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.74rem',
                    color: draftTheme.colors.primary,
                    fontWeight: 700,
                  }}
                >
                  <Flame size={13} fill="currentColor" />
                  <span>5d</span>
                </div>
              </div>

              {/* Sample Progress Bar filled with Accent */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                  <span style={{ color: draftTheme.colors.textMuted, fontFamily: draftTheme.bodyFont }}>
                    Daily Rituals Progress
                  </span>
                  <span style={{ color: draftTheme.colors.accent, fontWeight: 700 }}>
                    75%
                  </span>
                </div>
                <div
                  style={{
                    height: '7px',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '75%',
                      height: '100%',
                      backgroundColor: draftTheme.colors.accent,
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Sample Buttons (Primary & Accent) */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: draftTheme.colors.primary,
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Primary Action
                </button>

                <button
                  type="button"
                  style={{
                    backgroundColor: draftTheme.colors.accent,
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Accent Action
                </button>
              </div>

              {/* Sample Pills & Badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--primary-light)',
                    color: draftTheme.colors.primary,
                    fontWeight: 600,
                  }}
                >
                  Wellness
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--secondary-light)',
                    color: draftTheme.colors.secondary,
                    fontWeight: 600,
                  }}
                >
                  Mindfulness
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--accent-light)',
                    color: draftTheme.colors.accent,
                    fontWeight: 600,
                  }}
                >
                  Creative
                </span>
              </div>
            </div>

            {/* Readability & Synchronization summary */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, textAlign: 'center' }}>
              Changes apply instantly across your entire Habitale workspace. Click <strong>Apply & Save Theme</strong> to sync to your Cloud Firestore profile.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
