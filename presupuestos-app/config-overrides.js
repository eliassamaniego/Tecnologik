// config-overrides.js
module.exports = function override(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: require.resolve('react'),
      'react-dom$': require.resolve('react-dom'),
    };
    return config;
  };
  