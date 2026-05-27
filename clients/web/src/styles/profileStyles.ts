import type { CSSProperties } from 'react'

export const modalStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
}

export const modalBox: CSSProperties = {
  background: '#111',
  padding: 20,
  maxHeight: '70vh',
  width: 400,
  color: 'white',
  borderRadius: 12,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
}

export const userRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 10,
  width: '100%',
  overflow: 'hidden'
}

export const avatar = {
  width: 40,
  height: 40,
  borderRadius: '50%'
}

export const btn = {
  marginLeft: 'auto',
  padding: '6px 10px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer'
}