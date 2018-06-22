import * as Ramda from 'ramda';
import React from 'react';





function wrapWithFunctionChildComponent(FunctionAsChildHOC, options = {}) {
  return (
    Component => {
      function component(props) {
        const {
          mapOwnPropsToParentProps = Ramda.identity,
          mapChildArgsToChildProps = Ramda.identity
        } = options;
        return (
          <FunctionAsChildHOC {...mapOwnPropsToParentProps(props)}>
            {args => <Component {...props} {...mapChildArgsToChildProps(args)} />}
          </FunctionAsChildHOC>
        );
      }
      const parentName = FunctionAsChildHOC.displayName || FunctionAsChildHOC.name;
      const childName = Component.displayName || Component.name;
      component.displayName = (
        `wrapWithFunctionChildComponent(${parentName})(${childName})`
      );
      return component;
    }
  );
}





export default wrapWithFunctionChildComponent;
