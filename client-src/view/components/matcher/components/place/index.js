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
    <div className={classNames(className, theme.place)}>
      <img
        className={theme.image}
        src={`https://${window.location.host}/api/photos?ref=${place.photos[0].photo_reference}`}
        alt={place.name}
      />
      <div className={theme.info}>
        <h4> {place.name} </h4>
        <div dangerouslySetInnerHTML={{ __html: place.adr_address }} />
      </div>
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
