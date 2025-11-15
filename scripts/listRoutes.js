const app = require('../app');

function getRoutes(app) {
  const routes = [];
  const stack = app._router && app._router.stack ? app._router.stack : [];

  stack.forEach((layer) => {
    if (layer.route) {
      // Direct route
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push({ path: layer.route.path, methods });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // Router middleware
      layer.handle.stack.forEach((l) => {
        if (l.route) {
          const methods = Object.keys(l.route.methods).join(',').toUpperCase();
          // try to recover mount path from layer.regexp (best-effort)
          routes.push({ path: l.route.path, methods });
        }
      });
    }
  });

  return routes;
}

console.log(JSON.stringify(getRoutes(app), null, 2));
