module.exports = {
  webpack: (config, { isServer }) => {
    // Check if not on the server to add the WebAssembly configuration
    if (!isServer) {
      config.experiments = {
        asyncWebAssembly: true,
      };

      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });
    }

    return config;
  },
};
