import configureProductionStore from './configure-store-production';
import configureDevelopmentStore from './configure-store-development';

const configureStore = (process.env.NODE_ENV === 'production') ? (
  configureProductionStore
) : (
  configureDevelopmentStore
);

export default configureStore;
