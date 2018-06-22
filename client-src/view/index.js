import * as Ramda from 'ramda';
import React from 'react';
import Matcher from 'view/components/matcher';




View.propTypes = {
};
function View() {
  return (
    <React.Fragment>
      <Matcher />
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
