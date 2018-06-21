import * as Ramda from 'ramda';
import React from 'react';




View.propTypes = {
};
function View() {
  return (
    <React.Fragment>
      Hello Matee!
    </React.Fragment>
  );
}





const ViewContainer = (
  Ramda.compose(
    Ramda.identity
  )(View)
);
ViewContainer.displayName = 'ViewContainer';
ViewContainer.propTypes = {};
ViewContainer.defaultProps = {};





export { View };
export default ViewContainer;
