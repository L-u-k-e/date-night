import * as Ramda from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import { connect } from 'react-redux';
import { themr } from 'react-css-themr';
import { IconButton } from 'react-toolbox/lib/button';
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
        <IconButton className={classNames(theme.actionButton, theme.next)} icon="shuffle" theme={theme} />
        <IconButton className={classNames(theme.actionButton, theme.directions)} icon="directions" theme={theme} />
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
