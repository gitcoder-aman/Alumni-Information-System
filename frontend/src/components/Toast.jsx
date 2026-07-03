import React, { useEffect, useRef } from 'react';

let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  }
  return container;
}

export function showToast(message, type = 'success') {
  const c = getContainer();
  const t = document.createElement('div');
  t.className = `toast-item ${type}`;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.4s';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

export default function Toast() {
  return <div id="toast-container"></div>;
}
