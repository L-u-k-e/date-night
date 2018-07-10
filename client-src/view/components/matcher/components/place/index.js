import * as Ramda from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import { connect } from 'react-redux';
import { themr } from 'react-css-themr';
import { IconButton } from 'react-toolbox/lib/button';
// import {  } from 'redux/action-creators';
// import {  } from 'redux/selectors';
import wrapWithFunctionChildComponent from 'view/libraries/wrap-with-function-child-component';
// import wrapWithComponent from 'view/libraries/wrap-with-component';
import baseTheme from './theme.css';





Place.propTypes = {
  // external
  className: PropTypes.string.isRequired,
  place: PropTypes.object.isRequired,
  onNewPlace: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired,

  // provideTheme
  theme: PropTypes.object.isRequired
};
Place.defaultProps = {};
function Place(props) {
  const {
    theme,
    className,
    place,
    onNewPlace,
    onDirections
  } = props;
  console.log(place);
  return (
    <div className={classNames(className, theme.place)}>
      <div
        className={theme.image}
        style={{
          backgroundImage: `url(https://${window.location.host}/api/photos?ref=${place.photos[0].photo_reference})`
        }}
      />
      <div className={theme.info}>
        <h4> {place.name} </h4>
        <div dangerouslySetInnerHTML={{ __html: place.adr_address }} />
      </div>
      <div className={theme.actions}>
        <IconButton
          className={classNames(theme.actionButton, theme.next)}
          icon="shuffle"
          theme={theme}
          onClick={onNewPlace}
        />
        <IconButton
          className={classNames(theme.actionButton, theme.directions)}
          icon="directions"
          theme={theme}
          onClick={onDirections}
        />
      </div>
    </div>
  );
}





const provideTheme = themr('Place', baseTheme);





OnDirectionsProvider.propTypes = {
  // external
  place: PropTypes.object.isRequired,

  children: PropTypes.any.isRequired,
};
OnDirectionsProvider.defaultProps = {
};
function OnDirectionsProvider(props) {
  const { children } = props;
  return children({ onDirections });

  function onDirections() {
    const { place } = props;
    window.open(place.url, '_blank');
  }
}
const provideOnDirections = wrapWithFunctionChildComponent(OnDirectionsProvider);





const PlaceContainer = (
  Ramda.compose(
    provideTheme,
    provideOnDirections
  )(Place)
);
PlaceContainer.displayName = 'PlaceContainer';
PlaceContainer.propTypes = {
  ...PlaceContainer.propTypes,
  className: PropTypes.string,
  place: PropTypes.object.isRequired,
  onNewPlace: PropTypes.func.isRequired,
};
PlaceContainer.defaultProps = {
  ...PlaceContainer.defaultProps,
  className: '',
};





export { Place };
export default PlaceContainer;
