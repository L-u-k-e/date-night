/**
 * redux-responsive has this optimization that allows it to only recalculate the state when a new breakpoint is hit
 * (as opposed to recalculating every time the window resizes). In our application, some components need to re-render
 * every time the window resizes. This middleware emits an action that forces the `browser` (redux-responsive) state
 * to recalculate every time the window resizes, so that the individual components dont have to listen for the resize
 * event and can instead just subscribe to the `browser` prop in the redux store.
 */

import { calculateResponsiveState } from 'redux-responsive';


/* ------------------------------------------ Exports ------------------------------------------ */

export default function resizeListenerMiddleware() {
  return next => {
    if (window) {
      window.addEventListener('resize', () => next(calculateResponsiveState(window)));
    }
    return (action) => {
      // just pass all actions right through
      next(action);
    };
  };
}
