import * as Ramda from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';
import { themr } from 'react-css-themr';
import wrapWithFunctionChildComponent from 'view/libraries/wrap-with-function-child-component';
import Place from './components/place';
import baseTheme from './theme.css';





Matcher.propTypes = {
  // setTheme
  theme: PropTypes.object.isRequired,

  // providePlaces
  places: PropTypes.array,

  // provideLoading
  loading: PropTypes.bool
};
Matcher.defaultProps = {
  loading: true,
  places: []
};
function Matcher(props) {
  const { theme, loading, places } = props;
  console.log(places);
  return (
    <div className={theme.matcher}>
      {loading ? (
        'please wait...'
      ) : (
        <Place place={places[0]} />
      )}
    </div>
  );
}





const setTheme = themr('Matcher', baseTheme);





class LocationProvider extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
  };

  static defaultProps = {
  };

  state = {
    location: null,
    loadingLocation: true
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => this.setState({ location: position, loadingLocation: false })
    );
  }

  render() {
    const { children } = this.props;
    const { location, loadingLocation } = this.state;
    return children({ location, loadingLocation });
  }
}
const provideLocation = wrapWithFunctionChildComponent(LocationProvider);





class PlacesProvider extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,

    // provideLocation
    loadingLocation: PropTypes.bool.isRequired,
    location: PropTypes.object,
  };

  static defaultProps = {
    location: null
  };

  state = {
    places: null,
    loadingPlaces: true
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.loadingLocation && !nextProps.loadingLocation) {
      const { coords: { latitude, longitude } } = nextProps.location;
      const url = `https://${window.location.host}/api/places?latitude=${latitude}&longitude=${longitude}`;
      const reply = await fetch(url);
      const places = await reply.json();
      this.setState({ places, loadingPlaces: false });
    }
  }

  render() {
    const { children } = this.props;
    const { places, loadingPlaces } = this.state;
    return children({ places, loadingPlaces });
  }
}
const providePlaces = wrapWithFunctionChildComponent(PlacesProvider);





LoadingProvider.propTypes = {
  children: PropTypes.any.isRequired,

  // provideLocation
  loadingLocation: PropTypes.bool.isRequired,

  // providePlaces
  loadingPlaces: PropTypes.bool.isRequired,
};
LoadingProvider.defaultProps = {
};
function LoadingProvider(props) {
  const { children, loadingLocation, loadingPlaces } = props;
  return children({ loading: loadingLocation || loadingPlaces });
}
const provideLoading = wrapWithFunctionChildComponent(LoadingProvider);





const MatcherContainer = (
  Ramda.compose(
    setTheme,
    provideLocation,
    providePlaces,
    provideLoading
  )(Matcher)
);
MatcherContainer.displayName = 'MatcherContainer';





export { Matcher };
export default MatcherContainer;
