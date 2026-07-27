import { createAppState } from './ui/app-state.js';
import { render } from './ui/render.js';
import { attachEvents } from './ui/events.js';

export function mountApp(root) {
  let state = createAppState();
  const getState = () => state;
  const setState = (next) => {
    state = next;
  };

  render(root, state);
  attachEvents(root, getState, setState);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    mountApp(document.getElementById('app'));
  });
}
