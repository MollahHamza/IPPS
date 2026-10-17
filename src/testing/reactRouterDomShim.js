// Jest only: the CommonJS build of react-router/dom bundles its own copy of React Router, so its
// RouterProvider doesn't share context with useLocation() and friends. Use the main build instead.
const ReactRouter = require('react-router');

module.exports = {
  RouterProvider: ReactRouter.RouterProvider,
  HydratedRouter: () => null,
};
