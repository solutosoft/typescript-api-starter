const path = require("path");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.ts",
    cli: "./src/cli.ts",
  },
  devtool: "source-map",
  target: "node",
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [{
        loader:  "ts-loader",
        options: {
          transpileOnly: true
        }
      }],
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"]
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    libraryTarget: "this"
  },
  optimization: {
    minimizer: [new TerserPlugin({
      terserOptions: {
        mangle: true,
        keep_classnames: true,
        keep_fnames: true,
      }
    })]
  },
  externals: [
    nodeExternals()
  ],
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        ".env",
        "package-lock.json",
        "package.json",
        {
          from: "src/emails",
          to: "emails"
        }
      ]
    }),
  ],
};
