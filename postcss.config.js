module.exports = {
  plugins: {
    purge: ['./pages/**/*.tsx', './components/**/*.tsx'], // tailwindをどの階層にあるtsファイルに適用するか
    tailwindcss: {},
    autoprefixer: {},
  },
}
