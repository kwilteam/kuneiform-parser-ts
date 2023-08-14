cd ..
npm run build
git add .
git commit -m 'prepare for package update' --no-verify
npm version patch
npm publish
cd test-app
npm uninstall @lukelamey/kf-parser-ts
npm install @lukelamey/kf-parser-ts