import * as Ramda from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import { connect } from 'react-redux';
import { themr } from 'react-css-themr';
// import {  } from 'redux/action-creators';
// import {  } from 'redux/selectors';
// import wrapWithFunctionChildComponent from 'view/libraries/wrap-with-function-child-component';
// import wrapWithComponent from 'view/libraries/wrap-with-component';
import baseTheme from './theme.css';





Place.propTypes = {
  // external
  className: PropTypes.string.isRequired,
  place: PropTypes.object.isRequired,

  // provideTheme
  theme: PropTypes.object.isRequired
};
Place.defaultProps = {};
function Place(props) {
  const {
    theme,
    className,
    place
  } = props;

  return (
    <div className={classNames(className, theme.root)}>
      {place.name}
      <img
        src={`https://${window.location.host}/api/photos?ref=${place.photos[0].photo_reference}`}
        alt={place.name}
      />
    </div>
  );
}





const provideTheme = themr('Place', baseTheme);





const PlaceContainer = (
  Ramda.compose(
    provideTheme,
  )(Place)
);
PlaceContainer.displayName = 'PlaceContainer';
PlaceContainer.propTypes = {
  ...PlaceContainer.propTypes,
  className: PropTypes.string,
  place: PropTypes.object.isRequired,
};
PlaceContainer.defaultProps = {
  ...PlaceContainer.defaultProps,
  className: '',
};





export { Place };
export default PlaceContainer;
