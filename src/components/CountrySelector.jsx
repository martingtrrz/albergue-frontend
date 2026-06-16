import React, { useState, useRef, useEffect } from 'react';

export default function CountrySelector({ countries = [], value, onChange, hasError, inputStyle, selectStyle }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foco automático al buscador cuando se abre
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const sorted = [...countries].sort((a, b) => a.country.localeCompare(b.country, 'es'));

  const filtered = search.trim()
    ? sorted.filter(c => c.country.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const selected = countries.find(c => c.country === value);

  function handleSelect(country) {
    onChange(country);
    setOpen(false);
    setSearch('');
  }

  const triggerStyle = {
    ...(inputStyle || selectStyle || {}),
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
    ...(hasError ? { borderColor: 'var(--error-color)' } : {}),
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Botón trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        className="form-control"
        style={triggerStyle}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o); }}
      >
        {selected ? (
          <>
            <span style={{ fontSize: '1.2em', lineHeight: 1 }}>{selected.emoji}</span>
            <span style={{ flex: 1 }}>{selected.country}</span>
          </>
        ) : (
          <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
            -- Seleccione un País --
          </span>
        )}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ flexShrink: 0, opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'var(--surface-color)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--hover-shadow)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '300px',
          overflow: 'hidden',
          animation: 'fadeInUp 0.15s ease-out',
        }}>
          {/* Buscador */}
          <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: '10px', opacity: 0.4, pointerEvents: 'none', color: 'var(--text-secondary)' }}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="form-control"
                style={{
                  paddingLeft: '32px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Lista */}
          <div style={{ overflowY: 'auto', flex: 1 }} role="listbox">
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Sin resultados para "{search}"
              </div>
            ) : (
              filtered.map(c => (
                <div
                  key={c.code}
                  onClick={() => handleSelect(c.country)}
                  role="option"
                  aria-selected={c.country === value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    background: c.country === value ? 'var(--primary-light)' : 'transparent',
                    color: c.country === value ? 'var(--primary-dark)' : 'var(--text-primary)',
                    fontWeight: c.country === value ? 600 : 400,
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={e => {
                    if (c.country !== value) {
                      e.currentTarget.style.background = 'rgba(0, 227, 215, 0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (c.country !== value) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.15em', lineHeight: 1, flexShrink: 0 }}>{c.emoji}</span>
                  <span>{c.country}</span>
                  {c.country === value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto', color: 'var(--primary-dark)' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
