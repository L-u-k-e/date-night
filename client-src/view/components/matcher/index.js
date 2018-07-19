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
  loading: PropTypes.bool,

  // controlCurrentPlace
  currentPlaceIndex: PropTypes.number.isRequired,
  onNewPlace: PropTypes.func.isRequired,
};
Matcher.defaultProps = {
  loading: true,
  places: []
};
function Matcher(props) {
  const {
    theme,
    loading,
    places,
    currentPlaceIndex,
    onNewPlace
  } = props;
  return (
    <div className={theme.matcher}>
      {loading ? (
        'please wait...'
      ) : (
        <Place place={places[currentPlaceIndex]} onNewPlace={onNewPlace} />
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
      position => this.setState({ location: position, loadingLocation: false }),
      error => {
        console.log(error);
        // while we dont have https we can expect an error here. lets use hardcoded coords just for testing
        // this is the lat/ long of some pace in the Boston MA North End
        const fakePosition = { coords: { latitude: 42.362855, longitude: -71.066159 } };
        this.setState({ location: fakePosition, loadingLocation: false });
      }
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
      const url = `${window.location.origin}/api/places?latitude=${latitude}&longitude=${longitude}`;
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




class CurrentPlaceController extends React.Component {
  static propTypes = {
    // providePlaces
    places: PropTypes.array, // eslint-disable-line

    // provideLoading
    loading: PropTypes.bool.isRequired,

    children: PropTypes.any.isRequired,
  };

  static defaultProps = {
    places: null
  };

  state = {
    currentPlaceIndex: 0
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.loading && !nextProps.loading) {
      const currentPlaceIndex = this.getNewPlaceIndex({ exclusiveMaxIndex: nextProps.places.length });
      this.setState({ currentPlaceIndex });
    }
  }

  getNewPlaceIndex = ({ exclusiveMaxIndex }) => {
    const { currentPlaceIndex } = this.state;
    let newPlaceIndex = currentPlaceIndex;
    while (newPlaceIndex === currentPlaceIndex) {
      newPlaceIndex = Math.floor(Math.random() * exclusiveMaxIndex);
    }
    return newPlaceIndex;
  }

  shufflePlaceIndex = () => {
    const { places } = this.props;
    const currentPlaceIndex = this.getNewPlaceIndex({ exclusiveMaxIndex: places.length });
    this.setState({ currentPlaceIndex });
  }

  render() {
    const { children } = this.props;
    const { currentPlaceIndex } = this.state;
    return children({ currentPlaceIndex, onNewPlace: this.shufflePlaceIndex });
  }
}
const controlCurrentPlace = wrapWithFunctionChildComponent(CurrentPlaceController);





const MatcherContainer = (
  Ramda.compose(
    setTheme,
    provideLocation,
    providePlaces,
    provideLoading,
    controlCurrentPlace,
  )(Matcher)
);
MatcherContainer.displayName = 'MatcherContainer';





export { Matcher };
export default MatcherContainer;
