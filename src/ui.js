export function mountApp(root) {
  // Populated incrementally starting in T-062 (specs/003-interface/tasks.md)
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    mountApp(document.getElementById('app'));
  });
}
