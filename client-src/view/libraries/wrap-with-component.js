import * as Ramda from 'ramda';
import React from 'react';





function wrapWithComponent(ParentComponent, options = {}) {
  return (
    Component => {
      function component(props) {
        const {
          mapOwnPropsToParentProps = Ramda.identity,
        } = options;
        return (
          <ParentComponent {...mapOwnPropsToParentProps(props)}>
            <Component {...props} />
          </ParentComponent>
        );
      }
      const parentName = ParentComponent.displayName || ParentComponent.name;
      const childName = Component.displayName || Component.name;
      component.displayName = (
        `wrapWithComponent(${parentName})(${childName})`
      );
      return component;
    }
  );
}





export default wrapWithComponent;
